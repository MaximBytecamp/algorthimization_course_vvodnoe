(() => {
  const params = new URLSearchParams(location.search);
  const target = new URL('contacts.html', location.href);
  for (const key of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content']) {
    const value = params.get(key);
    if (value) target.searchParams.set(key, value);
  }
  const button = document.getElementById('lead-link');
  button.href = target.href;
  button.addEventListener('click', () => {
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'cta_click', {button_name: 'guide_to_form', page_section: 'backend_guide', transport_type: 'beacon'});
    }
  });
})();
