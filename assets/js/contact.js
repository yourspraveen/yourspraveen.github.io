/**
 * Contact form submission → self-hosted FormSupport API (/submit-contact).
 * Validates client-side, requires a Cloudflare Turnstile token, and posts JSON.
 * No page reload; shows inline success/error status.
 */
(function () {
  var CONTACT_ENDPOINT =
    'https://survey-api-365853907280.us-central1.run.app/submit-contact';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var submitBtn = document.getElementById('contact-submit');
  var statusEl = document.getElementById('contact-status');
  var emailEl = document.getElementById('contact-email');
  var nameEl = document.getElementById('contact-name');
  var messageEl = document.getElementById('contact-message');
  var websiteEl = document.getElementById('contact-website');

  function showStatus(message, ok) {
    statusEl.textContent = message;
    statusEl.className = 'alert ' + (ok ? 'alert-success' : 'alert-danger');
    statusEl.classList.remove('d-none');
  }

  function resetTurnstile() {
    if (window.turnstile && typeof window.turnstile.reset === 'function') {
      try { window.turnstile.reset(); } catch (e) { /* no-op */ }
    }
  }

  function setSubmitting(isSubmitting) {
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? 'Sending…' : 'Submit';
  }

  function turnstileToken() {
    var field = form.querySelector('[name="cf-turnstile-response"]');
    return field ? field.value : '';
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var email = (emailEl.value || '').trim();
    var message = (messageEl.value || '').trim();

    // Client-side validation (server re-validates authoritatively).
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showStatus('Please enter a valid email address.', false);
      return;
    }
    if (!message) {
      showStatus('Please enter a message.', false);
      return;
    }

    var token = turnstileToken();
    if (!token) {
      showStatus('Please complete the verification below and try again.', false);
      return;
    }

    var payload = {
      email: email,
      message: message,
      name: (nameEl.value || '').trim(),
      website: websiteEl ? websiteEl.value : '',
      cf_turnstile_response: token
    };

    setSubmitting(true);

    fetch(CONTACT_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (response) {
        if (response.ok) {
          showStatus("Thanks — your message has been sent. I'll get back to you soon.", true);
          form.reset();
          resetTurnstile();
          return;
        }

        var msg;
        switch (response.status) {
          case 403:
            msg = 'Verification failed. Please complete the check and try again.';
            break;
          case 422:
            msg = 'Please check your details and try again.';
            break;
          case 429:
            msg = 'Too many attempts — please wait a moment and try again.';
            break;
          default:
            msg = 'Something went wrong sending your message. Please email me directly.';
        }
        showStatus(msg, false);
        resetTurnstile();
      })
      .catch(function () {
        showStatus('Network error — please check your connection or email me directly.', false);
        resetTurnstile();
      })
      .finally(function () {
        setSubmitting(false);
      });
  });
})();
