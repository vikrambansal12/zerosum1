// Replaces the footer's "Collaborations" partner-link list with a compact
// inquiry form (Name/Company/Email/Phone/Requirements) so a visitor can
// reach out without navigating to the separate contact page. Shares the
// same /api/contact backend and validation rules as contact.html's main
// form. Included on every page with a #footer-contact-form container.
(function () {
  var PRODUCTION_API_BASE = 'https://zerosum-smtppass.up.railway.app';
  var API_BASE = (window.location.hostname.endsWith('.loca.lt') || window.location.port === '3001')
    ? ''
    : (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? 'http://localhost:3001'
      : PRODUCTION_API_BASE;
  var API_URL = API_BASE + '/api/contact';

  function init() {
    var container = document.getElementById('footer-contact-form');
    if (!container) return;

    var fieldStyle = 'width:100%;padding:7px 10px;border-radius:6px;background:#1e293b;border:1px solid #334155;color:#e2e8f0;font-size:13px;font-family:inherit;';
    var labelStyle = 'display:block;margin-bottom:3px;color:#94a3b8;font-size:12px;font-weight:500;';

    container.innerHTML =
      '<form novalidate style="max-width:480px;margin:0 auto;display:flex;flex-direction:column;gap:8px;">' +
        '<div><label style="' + labelStyle + '">Full Name *</label><input type="text" data-field="name" style="' + fieldStyle + '"></div>' +
        '<div><label style="' + labelStyle + '">Company Name *</label><input type="text" data-field="company" style="' + fieldStyle + '"></div>' +
        '<div><label style="' + labelStyle + '">Email Address *</label><input type="email" data-field="email" style="' + fieldStyle + '"></div>' +
        '<div><label style="' + labelStyle + '">Phone Number *</label><input type="tel" data-field="phone" style="' + fieldStyle + '"></div>' +
        '<div><label style="' + labelStyle + '">Product Requirements *</label><textarea data-field="message" rows="2" style="' + fieldStyle + ';resize:vertical;"></textarea></div>' +
        '<button type="submit" style="padding:9px;border-radius:6px;border:none;background:linear-gradient(90deg,#06b6d4,#2563eb);color:#fff;font-size:13px;font-weight:600;cursor:pointer;">Submit Inquiry</button>' +
        '<div data-role="status" style="font-size:12px;text-align:center;min-height:16px;"></div>' +
      '</form>';

    var form = container.querySelector('form');
    var statusEl = container.querySelector('[data-role="status"]');
    var submitBtn = form.querySelector('button[type="submit"]');

    function setStatus(message, isError) {
      statusEl.textContent = message;
      statusEl.style.color = isError ? '#f87171' : '#4ade80';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = form.querySelector('[data-field="name"]').value.trim();
      var company = form.querySelector('[data-field="company"]').value.trim();
      var email = form.querySelector('[data-field="email"]').value.trim();
      var phone = form.querySelector('[data-field="phone"]').value.trim();
      var message = form.querySelector('[data-field="message"]').value.trim();

      if (!name || !company || !email || !phone || !message) {
        setStatus('Please fill in all required fields.', true);
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setStatus('Please enter a valid email address.', true);
        return;
      }

      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
      setStatus('', false);

      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name, company: company, email: email, phone: phone, message: message, inquiryType: 'purchase' })
      })
        .then(function (res) { return res.json().then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (result) {
          if (result.ok) {
            setStatus(result.data.message || 'Inquiry sent successfully!', false);
            form.reset();
          } else {
            setStatus(result.data.message || 'Something went wrong. Please try again.', true);
          }
        })
        .catch(function () {
          setStatus('Could not connect to server. Please try again later.', true);
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit Inquiry';
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
