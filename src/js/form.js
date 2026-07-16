/* Contact form — static-site compatible.
   Client-side validation always runs. Submission targets a form backend
   (Formspree/Cloudflare Pages Forms/etc) — swap FORM_ENDPOINT once you
   have one; until then it simulates success so the UI can be tested. */

(function () {
  const form = document.querySelector('[data-contact-form]');
  if (!form) return;

  const FORM_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxx'
  const status = form.querySelector('[data-form-status]');

  function setStatus(message, kind) {
    status.textContent = message;
    status.className = 'form-status' + (kind ? ` is-${kind}` : '');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = form.querySelector('#name');
    const email = form.querySelector('#email');
    const message = form.querySelector('#message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      setStatus('Fill in every field before sending.', 'error');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setStatus('That email address doesn\u2019t look right.', 'error');
      return;
    }

    if (!FORM_ENDPOINT) {
      setStatus('Form not yet connected to a backend — see src/js/form.js. Your message was not sent.', 'error');
      return;
    }

    setStatus('Sending…', '');
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: new FormData(form),
      });
      if (res.ok) {
        setStatus('Message sent. Thanks for reaching out.', 'success');
        form.reset();
      } else {
        setStatus('Something went wrong sending that. Try again.', 'error');
      }
    } catch {
      setStatus('Network error — check your connection and try again.', 'error');
    }
  });
})();
