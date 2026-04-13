# Security Regression Test Cases — yourspraveen.github.io

**Created:** 2026-04-13
**Companion to:** [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
**Scope:** Client-side security validation for Jekyll portfolio site

---

## How to Use This File

Each test case maps to a finding in the security audit report. Tests are grouped by severity and designed to be run manually in a browser (DevTools console) or via automated tooling. After remediating a finding, re-run its test cases to confirm the fix. A passing test means the vulnerability is **no longer exploitable**.

**Prerequisites:**
- Local dev server: `bundle exec jekyll serve` (default: `http://localhost:4000`)
- Browser with DevTools (Chrome/Firefox recommended)
- Access to survey asset directories for file-based tests

---

## CRITICAL — Survey XSS Tests

### TC-1: MarkdownParser XSS via intro.md (Finding 1)

**Target file:** `assets/js/survey.js` — `MarkdownParser.parse()` (lines 35-71)
**Attack vector:** Injected HTML/JS in markdown files rendered via innerHTML (lines 387, 429)

#### TC-1.1: Script tag injection in markdown

**Setup:** Create a test markdown file or temporarily modify an existing survey's `intro.md`.

```markdown
# Test Survey Introduction
<script>window.__XSS_TC_1_1 = true;</script>
Normal paragraph text.
```

**Steps:**
1. Place the above content in any survey's `intro.md` (e.g., `assets/surveys/TEST/intro.md`)
2. Navigate to the survey page and enter the survey code
3. Open DevTools Console
4. Execute: `window.__XSS_TC_1_1`

**Expected (vulnerable):** Returns `true` — script executed.
**Expected (fixed):** Returns `undefined` — script was sanitized/stripped.

#### TC-1.2: Event handler injection via img tag

```markdown
# Welcome
<img src=x onerror="window.__XSS_TC_1_2='fired'">
```

**Steps:**
1. Place content in survey `intro.md`
2. Load survey, open console
3. Execute: `window.__XSS_TC_1_2`

**Expected (vulnerable):** Returns `'fired'`.
**Expected (fixed):** Returns `undefined`. Image tag either stripped or `onerror` attribute removed.

#### TC-1.3: SVG-based XSS in markdown

```markdown
# Survey Info
<svg onload="window.__XSS_TC_1_3=true"><rect/></svg>
```

**Steps:** Same as TC-1.1.
**Expected (vulnerable):** `window.__XSS_TC_1_3 === true`
**Expected (fixed):** `window.__XSS_TC_1_3 === undefined`

#### TC-1.4: Appendix markdown XSS

Repeat TC-1.1 through TC-1.3 using the survey's `appendix.md` file instead of `intro.md`. The same innerHTML path exists at line 429.

---

### TC-2: config.json Question Text XSS (Finding 2)

**Target file:** `assets/js/survey.js` — lines 741, 817
**Attack vector:** innerHTML assignment from config.json question labels/text

#### TC-2.1: Script in question text

**Setup:** Modify a survey's `config.json`:

```json
{
  "questions": [
    {
      "id": "xss_test",
      "text": "Rate this<script>window.__XSS_TC_2_1=true</script>",
      "type": "likert",
      "required": true,
      "scale": ["1", "2", "3", "4", "5"],
      "rows": [{"id": "r1", "label": "Test row"}]
    }
  ]
}
```

**Steps:**
1. Load survey with modified config
2. Advance to the question rendering step
3. Console: `window.__XSS_TC_2_1`

**Expected (vulnerable):** Returns `true`.
**Expected (fixed):** Returns `undefined`. Question text rendered as escaped text.

#### TC-2.2: Event handler in Likert row label

```json
{
  "questions": [
    {
      "id": "xss_label",
      "text": "Rate the following",
      "type": "likert",
      "required": true,
      "scale": ["1", "2", "3", "4", "5"],
      "rows": [
        {
          "id": "r1",
          "label": "Normal row"
        },
        {
          "id": "r2",
          "label": "<img src=x onerror=\"window.__XSS_TC_2_2='label_xss'\">"
        }
      ]
    }
  ]
}
```

**Steps:**
1. Load survey, navigate to the Likert question
2. Console: `window.__XSS_TC_2_2`

**Expected (vulnerable):** Returns `'label_xss'`.
**Expected (fixed):** Returns `undefined`.

#### TC-2.3: Verify SecurityUtils.sanitizeText() is called

**Console test (no file modification needed):**

```javascript
// Run in DevTools on a survey page after survey.js loads
(function() {
  var origSanitize = SecurityUtils.sanitizeText;
  var callLog = [];
  SecurityUtils.sanitizeText = function(input) {
    callLog.push(input);
    return origSanitize.call(this, input);
  };
  // Trigger question rendering (reload survey or advance to questions)
  // After rendering, check:
  setTimeout(function() {
    console.log('sanitizeText called ' + callLog.length + ' times during render');
    console.log('Calls:', callLog);
    SecurityUtils.sanitizeText = origSanitize; // restore
  }, 3000);
})();
```

**Expected (vulnerable):** `callLog.length === 0` during question rendering — sanitizer is never called.
**Expected (fixed):** `callLog.length > 0` — sanitizer is called for each question text/label before DOM insertion.

---

### TC-3: javascript: Protocol Link XSS (Finding 3)

**Target file:** `assets/js/survey.js` — MarkdownParser, line 51
**Attack vector:** `[text](javascript:...)` in markdown converted to clickable `<a href="javascript:...">`

#### TC-3.1: javascript: URI in markdown link

**Markdown content (in any survey intro.md or appendix.md):**

```markdown
For more details, [click here](javascript:window.__XSS_TC_3_1='js_proto')
```

**Steps:**
1. Load survey with this markdown
2. Inspect the rendered link in DevTools Elements panel
3. Check the `href` attribute value

**Expected (vulnerable):** `<a href="javascript:window.__XSS_TC_3_1='js_proto'">click here</a>` — clicking executes JS.
**Expected (fixed):** Link is either removed, has `href="#"`, or only `http://`/`https://` protocols are allowed.

#### TC-3.2: data: URI in markdown link

```markdown
[View document](data:text/html,<script>window.__XSS_TC_3_2=true</script>)
```

**Steps:** Same as TC-3.1.
**Expected (fixed):** `data:` URIs are blocked alongside `javascript:`.

#### TC-3.3: Case-variant bypass

```markdown
[Test](JaVaScRiPt:alert(1))
[Test2](&#106;avascript:alert(1))
```

**Steps:** Inspect rendered `href` values.
**Expected (fixed):** Both variants are blocked. Protocol validation is case-insensitive and handles HTML entity encoding.

---

## HIGH — CSRF, Replay, and Storage Tests

### TC-4: CSRF on Survey Submission (Finding 4)

**Target:** `https://survey-api-365853907280.us-central1.run.app/submit-survey`

#### TC-4.1: Cross-origin form POST

**Create a local HTML file (not on the survey domain):**

```html
<!DOCTYPE html>
<html>
<head><title>CSRF Test TC-4.1</title></head>
<body>
  <h1>CSRF Test — Survey Submission</h1>
  <form id="csrf-form" action="https://survey-api-365853907280.us-central1.run.app/submit-survey" method="POST" enctype="application/json">
    <input type="hidden" name='{"surveyCode":"TEST","responses":{"q1":"csrf_injected"}}' value="">
  </form>
  <script>
    // Auto-submit to test CSRF
    // Uncomment to execute: document.getElementById('csrf-form').submit();
    console.log('CSRF form ready. Uncomment submit line or click button to test.');
  </script>
  <button onclick="document.getElementById('csrf-form').submit()">Submit CSRF Test</button>
</body>
</html>
```

**Steps:**
1. Open this file from a different origin (e.g., `file://` or `http://localhost:8080`)
2. Click the submit button
3. Check if the survey API accepts the submission

**Expected (vulnerable):** API returns 200 OK — submission accepted from arbitrary origin.
**Expected (fixed):** API returns 403 Forbidden or rejects due to missing/invalid CSRF token.

#### TC-4.2: fetch-based cross-origin POST

```javascript
// Run from any page NOT on the survey domain
fetch('https://survey-api-365853907280.us-central1.run.app/submit-survey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    surveyCode: 'TEST',
    responses: { q1: 'csrf_fetch_test' }
  })
})
.then(r => console.log('Status:', r.status, '— CSRF ' + (r.ok ? 'VULNERABLE' : 'PROTECTED')))
.catch(e => console.log('Blocked by CORS:', e.message));
```

**Expected (vulnerable):** Status 200 — accepted.
**Expected (fixed):** CORS error or 403 status.

---

### TC-5: Replay Attack on Survey Submission (Finding 5)

#### TC-5.1: Duplicate submission replay

```javascript
// Run on the survey page after completing a survey
// Capture a valid submission payload first, then replay it
var payload = {
  surveyCode: 'AIPM8', // use a real code
  responses: { q1: 'replayed_answer' },
  metadata: { timestamp: new Date().toISOString() }
};

// Send the same request 3 times
var results = [];
for (var i = 0; i < 3; i++) {
  fetch('https://survey-api-365853907280.us-central1.run.app/submit-survey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  .then(r => { results.push(r.status); if (results.length === 3) console.log('Replay results:', results); });
}
// Expected (vulnerable): All three return 200
// Expected (fixed): First returns 200, subsequent return 409 Conflict or 429 Too Many Requests
```

---

### TC-6: localStorage Tampering (Finding 6)

#### TC-6.1: Read stored survey responses

```javascript
// Run in DevTools on the survey page after partially completing a survey
(function() {
  var keys = Object.keys(localStorage).filter(k => k.startsWith('survey_state_'));
  if (keys.length === 0) {
    console.log('No survey state found. Start a survey first.');
    return;
  }
  keys.forEach(function(key) {
    var data = JSON.parse(localStorage.getItem(key));
    console.log('Survey state found:', key);
    console.log('Stored responses:', JSON.stringify(data, null, 2));
    console.log('TC-6.1: Data is ' + (typeof data === 'string' && data.match(/^[A-Za-z0-9+/=]+$/) ? 'ENCRYPTED (fixed)' : 'PLAINTEXT (vulnerable)'));
  });
})();
```

**Expected (vulnerable):** Plaintext JSON responses visible.
**Expected (fixed):** Data is encrypted or stored server-side.

#### TC-6.2: Tamper with stored responses

```javascript
// Run after starting a survey
(function() {
  var keys = Object.keys(localStorage).filter(k => k.startsWith('survey_state_'));
  if (keys.length === 0) { console.log('No survey state found.'); return; }
  var key = keys[0];
  var data = JSON.parse(localStorage.getItem(key));
  
  // Tamper: inject a response
  if (data.responses) {
    data.responses['tampered_q'] = 'injected_value';
  } else {
    data.tampered = true;
  }
  localStorage.setItem(key, JSON.stringify(data));
  console.log('Tampered state saved. Reload the survey page and check if tampered data persists/submits.');
})();
```

**Expected (vulnerable):** Tampered data persists and may be submitted.
**Expected (fixed):** Integrity check fails on reload, state is rejected/cleared.

#### TC-6.3: State persistence after completion

```javascript
// Run AFTER submitting a survey
(function() {
  var keys = Object.keys(localStorage).filter(k => k.startsWith('survey_state_'));
  console.log('Survey states remaining after submission:', keys.length);
  console.log('TC-6.3:', keys.length === 0 ? 'PASS (cleared)' : 'FAIL (state persists: ' + keys.join(', ') + ')');
})();
```

**Expected (fixed):** No `survey_state_*` keys remain after successful submission.

---

## MEDIUM — SRI, CSP, and Widget Tests

### TC-7: Subresource Integrity Verification (Finding 7)

#### TC-7.1: Automated SRI check on all CDN resources

```javascript
// Run in DevTools on any page
(function() {
  var results = [];
  
  // Check all external scripts
  document.querySelectorAll('script[src]').forEach(function(s) {
    var src = s.getAttribute('src');
    if (src && (src.startsWith('http://') || src.startsWith('https://')) && !src.includes(location.hostname)) {
      results.push({
        type: 'script',
        src: src,
        hasIntegrity: !!s.getAttribute('integrity'),
        hasCrossorigin: !!s.getAttribute('crossorigin'),
        integrity: s.getAttribute('integrity') || 'MISSING'
      });
    }
  });
  
  // Check all external stylesheets
  document.querySelectorAll('link[rel="stylesheet"]').forEach(function(l) {
    var href = l.getAttribute('href');
    if (href && (href.startsWith('http://') || href.startsWith('https://')) && !href.includes(location.hostname)) {
      results.push({
        type: 'stylesheet',
        src: href,
        hasIntegrity: !!l.getAttribute('integrity'),
        hasCrossorigin: !!l.getAttribute('crossorigin'),
        integrity: l.getAttribute('integrity') || 'MISSING'
      });
    }
  });
  
  console.table(results);
  var missing = results.filter(r => !r.hasIntegrity);
  console.log('\nTC-7.1:', missing.length === 0 ? 'PASS — All CDN resources have SRI' : 'FAIL — ' + missing.length + ' resources missing SRI:');
  missing.forEach(r => console.log('  -', r.src));
})();
```

**Key resources to verify have SRI:**

| Resource | Expected |
|----------|----------|
| Bootstrap CSS (stackpath) | Has SRI |
| jQuery (code.jquery.com) | Has SRI |
| Popper.js (jsdelivr) | Has SRI |
| Bootstrap JS (stackpath) | Has SRI |
| Font Awesome (cdnjs) | Should have SRI after fix |
| simple-jekyll-search (unpkg) | Should have SRI after fix; should NOT use `@latest` |

#### TC-7.2: Verify search library is version-pinned

```javascript
// Run in DevTools
(function() {
  var searchScript = document.querySelector('script[src*="simple-jekyll-search"]');
  if (!searchScript) { console.log('Search script not found on this page.'); return; }
  var src = searchScript.getAttribute('src');
  var usesLatest = src.includes('@latest');
  console.log('Search script src:', src);
  console.log('TC-7.2:', usesLatest ? 'FAIL — uses @latest (unpinned)' : 'PASS — version is pinned');
})();
```

---

### TC-8: Content Security Policy (Finding 8)

#### TC-8.1: Check for CSP meta tag

```javascript
// Run in DevTools on any page
(function() {
  var cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  if (!cspMeta) {
    console.log('TC-8.1: FAIL — No CSP meta tag found');
    return;
  }
  var policy = cspMeta.getAttribute('content');
  console.log('CSP Policy:', policy);
  
  // Validate key directives exist
  var checks = {
    'default-src': policy.includes('default-src'),
    'script-src': policy.includes('script-src'),
    'style-src': policy.includes('style-src'),
    'connect-src': policy.includes('connect-src'),
    'frame-src': policy.includes('frame-src')
  };
  
  console.table(checks);
  var allPass = Object.values(checks).every(Boolean);
  console.log('TC-8.1:', allPass ? 'PASS — CSP present with required directives' : 'PARTIAL — Some directives missing');
})();
```

#### TC-8.2: Verify CSP blocks inline script injection

```javascript
// After CSP is in place, test if inline script injection is blocked
// This should trigger a CSP violation report in the console
(function() {
  var div = document.createElement('div');
  div.innerHTML = '<img src=x onerror="window.__CSP_TEST=true">';
  document.body.appendChild(div);
  
  setTimeout(function() {
    document.body.removeChild(div);
    console.log('TC-8.2:', window.__CSP_TEST ? 'FAIL — inline handler executed despite CSP' : 'PASS — CSP blocked inline handler');
  }, 1000);
})();
```

---

### TC-9: document.write() in Footer (Finding 9)

#### TC-9.1: Check for document.write usage

```bash
# Run from project root
grep -n "document\.write" _includes/footer-scripts.html
```

**Expected (vulnerable):** Match found — `document.write('<script...')`.
**Expected (fixed):** No match — replaced with `document.createElement('script')` pattern.

#### TC-9.2: Console-based verification

```javascript
// Run in DevTools — check if document.write is used at runtime
(function() {
  var origWrite = document.write;
  var writeCalled = false;
  document.write = function() {
    writeCalled = true;
    console.warn('document.write() was called with:', arguments[0]);
    return origWrite.apply(document, arguments);
  };
  
  // Note: this only catches calls AFTER this script runs
  // For full coverage, inject this before footer-scripts.html loads
  setTimeout(function() {
    console.log('TC-9.2:', writeCalled ? 'FAIL — document.write() was called' : 'PASS — document.write() not detected');
    document.write = origWrite;
  }, 5000);
})();
```

---

### TC-10: Widget Sandboxing (Finding 10)

#### TC-10.1: Check widget isolation

```javascript
// Run on the appointments page (Koalendar)
(function() {
  var koalendarScript = document.querySelector('script[src*="koalendar.com"]');
  var koalendarIframe = document.querySelector('iframe[src*="koalendar.com"]');
  
  if (koalendarScript && !koalendarIframe) {
    console.log('TC-10.1a: FAIL — Koalendar loads as inline script with full DOM access (no iframe sandbox)');
  } else if (koalendarIframe) {
    var sandbox = koalendarIframe.getAttribute('sandbox');
    console.log('TC-10.1a:', sandbox ? 'PASS — Koalendar in sandboxed iframe: ' + sandbox : 'PARTIAL — iframe exists but no sandbox attribute');
  } else {
    console.log('TC-10.1a: N/A — Koalendar not found on this page');
  }
})();
```

```javascript
// Run on the posts page (SociableKit)
(function() {
  var skScript = document.querySelector('script[src*="sociablekit.com"]');
  var skIframe = document.querySelector('iframe[src*="sociablekit.com"]');
  
  if (skScript && !skIframe) {
    console.log('TC-10.1b: FAIL — SociableKit loads as inline script with full DOM access');
  } else if (skIframe) {
    var sandbox = skIframe.getAttribute('sandbox');
    console.log('TC-10.1b:', sandbox ? 'PASS — SociableKit in sandboxed iframe: ' + sandbox : 'PARTIAL — iframe but no sandbox');
  } else {
    console.log('TC-10.1b: N/A — SociableKit not found on this page');
  }
})();
```

---

## LOW — Brute Force, Email Injection, Honeypot Tests

### TC-11: Survey Code Brute-Force (Finding 11)

#### TC-11.1: Rate limiting check

```javascript
// Run in DevTools — sends 10 rapid requests to test rate limiting
(function() {
  var endpoint = 'https://survey-api-365853907280.us-central1.run.app/submit-survey';
  var codes = ['AAA', 'BBB', 'CCC', 'DDD', 'EEE', 'FFF', 'GGG', 'HHH', 'III', 'JJJ'];
  var results = [];
  
  var promises = codes.map(function(code) {
    return fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ surveyCode: code, responses: {} })
    })
    .then(function(r) { results.push({ code: code, status: r.status }); })
    .catch(function(e) { results.push({ code: code, error: e.message }); });
  });
  
  Promise.all(promises).then(function() {
    console.table(results);
    var blocked = results.filter(r => r.status === 429);
    console.log('TC-11.1:', blocked.length > 0 ? 'PASS — Rate limiting active (' + blocked.length + '/10 blocked)' : 'FAIL — No rate limiting detected');
  });
})();
```

---

### TC-12: Contact Form Email Injection (Finding 12)

#### TC-12.1: Newline injection in email field

```javascript
// Run on the contact page
(function() {
  var form = document.getElementById('contact-form');
  if (!form) { console.log('Contact form not found.'); return; }
  
  var emailInput = form.querySelector('[name="_replyto"]');
  if (!emailInput) { console.log('_replyto field not found.'); return; }
  
  // Test if the HTML5 validation catches newlines
  emailInput.value = 'attacker@evil.com\r\nBcc: victim@example.com';
  var isValid = emailInput.checkValidity();
  
  console.log('Email with newlines valid?', isValid);
  console.log('TC-12.1:', isValid ? 'FAIL — Newline injection passes client validation' : 'PASS — Client validation rejects newlines');
})();
```

#### TC-12.2: Honeypot field visibility

```javascript
// Run on the contact page
(function() {
  var honeypot = document.querySelector('[name="_gotcha"]');
  if (!honeypot) { console.log('TC-12.2: FAIL — No honeypot field found'); return; }
  
  var style = window.getComputedStyle(honeypot);
  var isHidden = style.display === 'none' || style.visibility === 'hidden' || 
                 style.opacity === '0' || honeypot.type === 'hidden' ||
                 (style.position === 'absolute' && (parseInt(style.left) < -9000 || parseInt(style.top) < -9000));
  
  console.log('TC-12.2:', isHidden ? 'PASS — Honeypot is hidden' : 'WARNING — Honeypot may be visible to users');
  
  // Check if honeypot has accessible name that bots could detect
  var hasObviousName = honeypot.name.includes('honey') || honeypot.name.includes('gotcha') || 
                       honeypot.name.includes('trap') || honeypot.name.includes('bot');
  console.log('TC-12.2b:', hasObviousName ? 'INFO — Honeypot name ("' + honeypot.name + '") may be detectable by smart bots' : 'PASS — Honeypot name is not obvious');
})();
```

---

## Automated Full-Suite Runner

Copy and paste this into DevTools to run all console-based tests at once:

```javascript
(function() {
  console.log('=== SECURITY REGRESSION TEST SUITE ===');
  console.log('Date:', new Date().toISOString());
  console.log('Page:', location.href);
  console.log('');
  
  // TC-7.1: SRI Check
  console.group('TC-7.1: Subresource Integrity');
  var sriResults = [];
  document.querySelectorAll('script[src], link[rel="stylesheet"]').forEach(function(el) {
    var src = el.getAttribute('src') || el.getAttribute('href');
    if (src && src.startsWith('http') && !src.includes(location.hostname)) {
      var hasIntegrity = !!el.getAttribute('integrity');
      sriResults.push({ resource: src.split('/').pop(), hasIntegrity: hasIntegrity });
      if (!hasIntegrity) console.warn('Missing SRI:', src);
    }
  });
  var sriMissing = sriResults.filter(r => !r.hasIntegrity).length;
  console.log('Result:', sriMissing === 0 ? 'PASS' : 'FAIL (' + sriMissing + ' missing)');
  console.groupEnd();
  
  // TC-8.1: CSP Check
  console.group('TC-8.1: Content Security Policy');
  var cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
  console.log('Result:', cspMeta ? 'PASS — CSP present' : 'FAIL — No CSP');
  if (cspMeta) console.log('Policy:', cspMeta.getAttribute('content').substring(0, 200) + '...');
  console.groupEnd();
  
  // TC-6.1: localStorage Survey State
  console.group('TC-6.1: localStorage Survey State');
  var surveyKeys = Object.keys(localStorage).filter(k => k.startsWith('survey_state_'));
  if (surveyKeys.length > 0) {
    surveyKeys.forEach(function(k) {
      try {
        var data = JSON.parse(localStorage.getItem(k));
        var isPlaintext = typeof data === 'object';
        console.log(k + ':', isPlaintext ? 'FAIL — Plaintext JSON' : 'PASS — Encrypted/opaque');
      } catch(e) {
        console.log(k + ': PASS — Not parseable as JSON (likely encrypted)');
      }
    });
  } else {
    console.log('No survey states in localStorage (N/A)');
  }
  console.groupEnd();
  
  // TC-7.2: Search library version pin
  console.group('TC-7.2: Search Library Version');
  var searchScript = document.querySelector('script[src*="simple-jekyll-search"]');
  if (searchScript) {
    var usesLatest = searchScript.src.includes('@latest');
    console.log('Result:', usesLatest ? 'FAIL — @latest (unpinned)' : 'PASS — Pinned version');
  } else {
    console.log('N/A — Search script not on this page');
  }
  console.groupEnd();
  
  // TC-9.1: document.write check (static)
  console.group('TC-9.1: document.write');
  console.log('Run grep check: grep -n "document.write" _includes/footer-scripts.html');
  console.groupEnd();
  
  // TC-10.1: Widget sandboxing
  console.group('TC-10.1: Widget Sandboxing');
  ['koalendar.com', 'sociablekit.com'].forEach(function(domain) {
    var script = document.querySelector('script[src*="' + domain + '"]');
    var iframe = document.querySelector('iframe[src*="' + domain + '"]');
    if (script && !iframe) {
      console.log(domain + ': FAIL — Inline script, no sandbox');
    } else if (iframe) {
      console.log(domain + ':', iframe.getAttribute('sandbox') ? 'PASS' : 'PARTIAL — No sandbox attr');
    } else {
      console.log(domain + ': N/A — Not on this page');
    }
  });
  console.groupEnd();
  
  // TC-12.2: Honeypot
  console.group('TC-12.2: Contact Form Honeypot');
  var honeypot = document.querySelector('[name="_gotcha"]');
  if (honeypot) {
    var style = window.getComputedStyle(honeypot);
    console.log('Result:', style.display === 'none' ? 'PASS — Hidden' : 'CHECK — Verify visibility');
  } else {
    console.log('N/A — Not on contact page');
  }
  console.groupEnd();
  
  console.log('\n=== SUITE COMPLETE ===');
  console.log('Note: TC-1 through TC-5 require file modifications or cross-origin tests — run manually.');
})();
```

---

## CLI-Based Static Analysis Tests

These can be run from the project root without a browser:

```bash
#!/bin/bash
# save as ref/run-security-checks.sh and run: bash ref/run-security-checks.sh

echo "=== Static Security Checks ==="
echo ""

# Check 1: innerHTML usage in survey.js
echo "--- innerHTML usage in survey.js ---"
grep -n "\.innerHTML\s*=" assets/js/survey.js
INNER_COUNT=$(grep -c "\.innerHTML\s*=" assets/js/survey.js)
echo "Total innerHTML assignments: $INNER_COUNT"
echo ""

# Check 2: document.write usage
echo "--- document.write usage ---"
grep -rn "document\.write" _includes/ _layouts/
echo ""

# Check 3: Missing SRI on external resources
echo "--- External resources missing integrity attribute ---"
grep -rn 'src=.*https://' _includes/ _layouts/ --include="*.html" | grep -v 'integrity='
grep -rn 'href=.*https://' _includes/ _layouts/ --include="*.html" | grep -v 'integrity=' | grep -v 'rel="preconnect"' | grep -v 'fonts.googleapis.com'
echo ""

# Check 4: CSP meta tag
echo "--- Content Security Policy ---"
grep -rn 'Content-Security-Policy' _includes/head.html
CSP_COUNT=$(grep -c 'Content-Security-Policy' _includes/head.html 2>/dev/null || echo "0")
echo "CSP meta tags found: $CSP_COUNT"
echo ""

# Check 5: @latest in unpkg/cdn URLs
echo "--- Unpinned CDN versions (@latest) ---"
grep -rn '@latest' _includes/ _layouts/ --include="*.html"
echo ""

# Check 6: SecurityUtils.sanitizeText usage in rendering paths
echo "--- sanitizeText calls in survey.js ---"
grep -n "sanitizeText" assets/js/survey.js
echo ""

# Check 7: javascript: protocol handling in MarkdownParser
echo "--- MarkdownParser link regex ---"
grep -n "href" assets/js/survey.js | head -5
echo ""

echo "=== Checks Complete ==="
```

---

## Remediation Verification Checklist

After fixing findings, mark each test as passed:

| Test | Finding | Status | Date Verified |
|------|---------|--------|---------------|
| TC-1.1 | F1: Markdown script injection | [ ] | |
| TC-1.2 | F1: Markdown img onerror | [ ] | |
| TC-1.3 | F1: Markdown SVG onload | [ ] | |
| TC-1.4 | F1: Appendix markdown XSS | [ ] | |
| TC-2.1 | F2: Question text script | [ ] | |
| TC-2.2 | F2: Likert label img XSS | [ ] | |
| TC-2.3 | F2: sanitizeText call check | [ ] | |
| TC-3.1 | F3: javascript: protocol link | [ ] | |
| TC-3.2 | F3: data: URI link | [ ] | |
| TC-3.3 | F3: Case-variant bypass | [ ] | |
| TC-4.1 | F4: CSRF form POST | [ ] | |
| TC-4.2 | F4: CSRF fetch POST | [ ] | |
| TC-5.1 | F5: Replay duplicate submit | [ ] | |
| TC-6.1 | F6: localStorage plaintext | [ ] | |
| TC-6.2 | F6: localStorage tampering | [ ] | |
| TC-6.3 | F6: State cleared on submit | [ ] | |
| TC-7.1 | F7: SRI on all CDN resources | [ ] | |
| TC-7.2 | F7: Search lib version pinned | [ ] | |
| TC-8.1 | F8: CSP meta tag present | [ ] | |
| TC-8.2 | F8: CSP blocks inline handlers | [ ] | |
| TC-9.1 | F9: No document.write usage | [ ] | |
| TC-10.1 | F10: Widgets sandboxed | [ ] | |
| TC-11.1 | F11: Rate limiting active | [ ] | |
| TC-12.1 | F12: Email newline rejected | [ ] | |
| TC-12.2 | F12: Honeypot hidden | [ ] | |
