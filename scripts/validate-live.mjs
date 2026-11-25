#!/usr/bin/env node
/**
 * Validate the published site at its real domain.
 *
 * The chain is Gitea holds the source, a Gitea Action builds it and force-pushes
 * `_site` to GitHub, and GitHub Pages serves that at www.yourspraveen.com. Every
 * check before this one reads the *source*; nothing has ever read the thing the
 * public gets. So a build can be green, the push can succeed, and the site can
 * be broken, redirected, slow or serving yesterday's bytes without anything
 * noticing.
 *
 * No dependencies on purpose: the deploy runner bakes node 26 and installs
 * nothing else, and a validator that needs `npx` can fail for reasons that have
 * nothing to do with the site.
 *
 * Two modes, because they catch different things and only one can block:
 *
 *   --local _site                 serve the build and check its structure. This
 *                                 is the gate: run it on a PR and again before
 *                                 the force-push, so a broken build never
 *                                 reaches the public.
 *   https://www.yourspraveen.com  check the published site. This is the
 *                                 verification: TLS, the apex, compression,
 *                                 cache headers, real CDN latency, and whether
 *                                 Pages published at all. It cannot block -- by
 *                                 then the bytes are public -- so its job is to
 *                                 be loud.
 *
 * Usage:
 *   node scripts/validate-live.mjs [https://www.yourspraveen.com] [--wait 180]
 *   node scripts/validate-live.mjs --local _site
 *
 * Exit 0 only when every check passed. Budgets are deliberately generous: this
 * is a sanity gate, not a performance competition, and a flaky gate gets
 * ignored.
 */

/** The domain the site is published at, whatever we happen to be serving. */
const PUBLISHED = "https://www.yourspraveen.com";

const localArg = process.argv.indexOf("--local");
const LOCAL_DIR = localArg === -1 ? null : (process.argv[localArg + 1] || "_site");
const waitArg = process.argv.indexOf("--wait");
const WAIT_SECONDS = localArg !== -1 ? 0 : (waitArg === -1 ? 0 : Number(process.argv[waitArg + 1] || 180));
let BASE = LOCAL_DIR ? "" : (process.argv[2] || "https://www.yourspraveen.com").replace(/\/$/, "");
const APEX = () => BASE.replace("://www.", "://");

/** True when we are reading what the public gets, rather than a local build. */
const live = () => !LOCAL_DIR;

/** Budgets. Each one is a number somebody can argue with, which is the point. */
const BUDGET = {
  ttfbMs: 2000,            // time to first byte for the homepage, cold
  htmlBytes: 250 * 1024,   // the homepage document itself
  pageBytes: 3 * 1024 * 1024, // document plus every local asset it references
  assets: 60,              // how many local assets one page may pull
};

const results = [];
const notes = [];

/** Serve a built Jekyll site the way Pages does: directory -> index.html, and a
 * missing path -> 404.html with a 404 status. Without that last part a typo'd
 * link looks like a working page, which is one of the things being checked. */
async function serveLocal(dir) {
  const { createServer } = await import("node:http");
  const { readFile, stat } = await import("node:fs/promises");
  const { join, extname, resolve: resolvePath } = await import("node:path");
  const root = resolvePath(dir);
  const types = {
    ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript",
    ".json": "application/json", ".xml": "application/xml", ".txt": "text/plain",
    ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon",
    ".woff": "font/woff", ".woff2": "font/woff2", ".pdf": "application/pdf",
  };
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    const candidates = path.endsWith("/")
      ? [join(root, path, "index.html")]
      : [join(root, path), join(root, path, "index.html"), join(root, path + ".html")];
    for (const file of candidates) {
      if (!file.startsWith(root)) break;
      try {
        if (!(await stat(file)).isFile()) continue;
        res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
        res.end(await readFile(file));
        return;
      } catch { /* try the next candidate */ }
    }
    try {
      res.writeHead(404, { "content-type": "text/html; charset=utf-8" });
      res.end(await readFile(join(root, "404.html")));
    } catch {
      res.writeHead(404).end("not found");
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { server, base: `http://127.0.0.1:${server.address().port}` };
}
let failed = 0;

function note(name, detail = "") {
  notes.push({ name, detail });
  console.log(`note ${name}${detail ? ` — ${detail}` : ""}`);
}

function record(ok, name, detail = "") {
  results.push({ ok, name, detail });
  if (!ok) failed += 1;
  const mark = ok ? "ok  " : "FAIL";
  console.log(`${mark} ${name}${detail ? ` — ${detail}` : ""}`);
}

async function fetchWithTiming(url, options = {}) {
  const started = Date.now();
  const res = await fetch(url, { redirect: "manual", ...options });
  const ttfb = Date.now() - started;
  const body = options.method === "HEAD" ? "" : await res.text();
  return { res, ttfb, body, bytes: Buffer.byteLength(body) };
}

/** GitHub Pages can take a moment after a push; poll rather than race it. */
async function waitForSite() {
  if (!WAIT_SECONDS) return true;
  const deadline = Date.now() + WAIT_SECONDS * 1000;
  let last = "";
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE + "/", { redirect: "follow" });
      if (res.ok) return true;
      last = `HTTP ${res.status}`;
    } catch (err) {
      last = err.message;
    }
    await new Promise((r) => setTimeout(r, 5000));
  }
  record(false, "the site answers at all", `${WAIT_SECONDS}s without a 200 (${last})`);
  return false;
}

async function main() {
  let server = null;
  if (LOCAL_DIR) {
    const served = await serveLocal(LOCAL_DIR);
    server = served.server;
    BASE = served.base;
    console.log(`validating the build in ${LOCAL_DIR} (served at ${BASE})`);
  } else {
    console.log(`validating the published site at ${BASE}`);
  }
  if (!(await waitForSite())) return finish(server);

  // --- the document itself -------------------------------------------------
  const home = await fetchWithTiming(BASE + "/", { redirect: "follow" });
  record(home.res.ok, "homepage is 200", `HTTP ${home.res.status}`);
  if (live()) {
    // Latency off a local loopback server says nothing about the CDN.
    record(home.ttfb < BUDGET.ttfbMs, "homepage TTFB within budget",
           `${home.ttfb}ms (budget ${BUDGET.ttfbMs}ms)`);
  }
  record(home.bytes < BUDGET.htmlBytes, "homepage HTML within budget",
         `${(home.bytes / 1024).toFixed(1)}KB (budget ${(BUDGET.htmlBytes / 1024)}KB)`);

  const title = (home.body.match(/<title[^>]*>([^<]*)<\/title>/i) || [])[1] || "";
  record(title.trim().length > 0, "homepage has a title", JSON.stringify(title.trim()));

  const canonical = (home.body.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i) || [])[1] || "";
  // Always compared against the published domain, even when serving locally: a
  // wrong `url:` in _config.yml is exactly what the gate should catch before it
  // publishes, and the local server's address is not the answer.
  record(canonical.startsWith(PUBLISHED), "canonical URL is the published domain",
         canonical || "(none)");

  // Mixed content makes a padlock a lie, and it is invisible in a source build.
  const insecure = [...home.body.matchAll(/(?:src|href)=["']http:\/\/([^"']+)/gi)]
    .map((m) => m[1]).filter((u) => !u.startsWith("www.w3.org"));
  record(insecure.length === 0, "no insecure asset URLs", insecure.slice(0, 3).join(", "));

  // --- the domain itself, only meaningful against the published site -------
  if (live()) {
    // `CNAME` is www, so the apex should redirect to it rather than fail or
    // serve a second copy. As of 2026-11-23 `yourspraveen.com` has no A records
    // at all -- checked against DoH, not just this LAN -- so a bare-domain visit
    // is a DNS error. That is a DNS decision, not a build problem, so it is
    // reported and does not fail the run until the records exist.
    try {
      const apex = await fetch(APEX() + "/", { redirect: "manual" });
      const location = apex.headers.get("location") || "";
      const redirects = [301, 302, 307, 308].includes(apex.status);
      record(redirects && location.includes("www."), "apex redirects to www",
             `HTTP ${apex.status} -> ${location || "(no location)"}`);
    } catch (err) {
      note("apex does not resolve", `${APEX()} — ${err.message}; add A records for the ` +
           "apex to the Pages addresses if a bare-domain visit should work");
    }

    const cache = home.res.headers.get("cache-control") || "";
    note(cache ? `homepage cache-control: ${cache}` : "homepage sends no cache-control header");
  }

  record((home.res.headers.get("content-type") || "").includes("text/html"),
         "homepage is served as HTML", home.res.headers.get("content-type") || "(none)");

  // --- the pages that have broken before ----------------------------------
  for (const path of ["/robots.txt", "/sitemap.xml", "/feed.xml", "/aboutme/", "/resume/"]) {
    try {
      const r = await fetch(BASE + path, { redirect: "follow" });
      record(r.ok, `${path} is 200`, `HTTP ${r.status}`);
    } catch (err) {
      record(false, `${path} is 200`, err.message);
    }
  }

  // A missing page must say 404, or a typo'd link looks like a working page.
  try {
    const missing = await fetch(`${BASE}/this-page-does-not-exist-${Date.now()}/`);
    record(missing.status === 404, "a missing page returns 404", `HTTP ${missing.status}`);
  } catch (err) {
    record(false, "a missing page returns 404", err.message);
  }

  // --- the newest post, through the real permalink -------------------------
  // `_config.yml`'s permalink is what the blog pipeline's verify_live depends
  // on; a change there turns every publish into a 404 that waits out a timeout.
  try {
    const sitemap = await (await fetch(BASE + "/sitemap.xml")).text();
    const blogUrls = [...sitemap.matchAll(/<loc>([^<]+\/blogs\/[^<]+)<\/loc>/g)].map((m) => m[1]);
    record(blogUrls.length > 0, "sitemap lists blog posts", `${blogUrls.length} found`);
    if (blogUrls.length) {
      // The sitemap is absolute (it has to be), so in gate mode its URLs point
      // at production. Keep the path and put it back on whatever we are
      // actually validating, or the gate silently checks the live site.
      const newest = blogUrls[blogUrls.length - 1];
      const target = BASE + new URL(newest).pathname;
      const post = await fetch(target, { redirect: "follow" });
      record(post.ok, "the newest post resolves", `${new URL(newest).pathname} -> HTTP ${post.status}`);
    }
  } catch (err) {
    record(false, "sitemap lists blog posts", err.message);
  }

  // --- every local asset the homepage asks for ----------------------------
  const assetPaths = [...new Set(
    [...home.body.matchAll(/(?:src|href)=["'](\/[^"']+\.(?:css|js|png|jpe?g|webp|svg|woff2?|ico))["']/gi)]
      .map((m) => m[1]),
  )];
  record(assetPaths.length <= BUDGET.assets, "asset count within budget",
         `${assetPaths.length} local assets (budget ${BUDGET.assets})`);

  let total = home.bytes;
  const broken = [];
  const uncompressed = [];
  for (const path of assetPaths) {
    try {
      const r = await fetch(BASE + path, { redirect: "follow",
                                           headers: { "accept-encoding": "gzip, br" } });
      if (!r.ok) { broken.push(`${path} -> ${r.status}`); continue; }
      const buf = Buffer.from(await r.arrayBuffer());
      total += buf.byteLength;
      const encoding = r.headers.get("content-encoding") || "";
      const compressible = /\.(css|js|svg)$/i.test(path);
      // Only the published site is expected to compress: the local server here
      // deliberately does not, so this would always fail in the gate.
      if (live() && compressible && !encoding && buf.byteLength > 2048) uncompressed.push(path);
    } catch (err) {
      broken.push(`${path} -> ${err.message}`);
    }
  }
  record(broken.length === 0, "every asset the homepage references resolves",
         broken.slice(0, 4).join("; "));
  if (live()) {
    record(uncompressed.length === 0, "text assets are served compressed",
           uncompressed.slice(0, 4).join(", "));
  }
  record(total < BUDGET.pageBytes, "homepage weight within budget",
         `${(total / 1024 / 1024).toFixed(2)}MB over ${assetPaths.length + 1} requests ` +
         `(budget ${(BUDGET.pageBytes / 1024 / 1024).toFixed(1)}MB)`);

  finish(server);
}

function finish(server = null) {
  if (server) server.close();
  const passed = results.length - failed;
  const where = LOCAL_DIR ? `the build in ${LOCAL_DIR}` : BASE;
  console.log(`\n${passed}/${results.length} checks passed against ${where}` +
              (notes.length ? `, ${notes.length} note(s)` : ""));
  if (failed) {
    console.log("\nfailed:");
    for (const r of results.filter((x) => !x.ok)) {
      console.log(`  - ${r.name}${r.detail ? `: ${r.detail}` : ""}`);
    }
    process.exit(1);
  }
}

await main();
