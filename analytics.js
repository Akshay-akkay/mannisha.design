/* Site analytics (Google Analytics 4, optional Microsoft Clarity).
   Fill in the IDs below; with both empty nothing loads and nothing is sent.
   GA4 gives visitors, countries/cities, devices, referrers, time on page and
   every custom event tracked here. Clarity adds heatmaps + session recordings. */
(function () {
  const GA_ID = 'G-NZ9EE6GHM5';        // e.g. 'G-XXXXXXXXXX'  (GA4 > Admin > Data streams > Measurement ID)
  const CLARITY_ID = '';   // e.g. 'abcdefghij'   (clarity.microsoft.com > project > Settings)

  const page = document.body.dataset.page || location.pathname.replace(/^\//, '').replace(/\.html$/, '') || 'home';
  const caseStudy = document.body.dataset.case || null;

  // ---- loaders ----------------------------------------------------------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { page_title: document.title, send_page_view: true });
  }
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  const track = (name, params) => {
    const p = Object.assign({ page, ...(caseStudy && { case_study: caseStudy }) }, params || {});
    if (GA_ID) gtag('event', name, p);
    if (CLARITY_ID && window.clarity) window.clarity('event', name);
    if (!GA_ID && !CLARITY_ID && location.hostname === 'localhost') console.debug('[analytics]', name, p);
  };
  window.mkTrack = track;

  // ---- case study visits -----------------------------------------------
  if (caseStudy) track('case_study_view', { case_study: caseStudy });

  // ---- CTA + link clicks -------------------------------------------------
  const label = (el) => (el.dataset.track || el.getAttribute('aria-label') || el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 80);
  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    if (!t) return;
    const a = t.closest('a, button');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const l = label(a);
    if (a.matches('.nav-cta, .t2-pill, .t2-linkedin, .nav-links a, .nav-logo, .back, .next-link, .foot-row a')) {
      track('cta_click', { cta: l, href, location: a.closest('nav, footer, section, .pj-window') ? a.closest('nav, footer, section, .pj-window').className.split(' ')[0] : 'body' });
    }
    if (a.matches('.pj-slide')) track('project_open', { project: a.querySelector('h3') ? a.querySelector('h3').textContent.trim() : l, href });
    if (a.matches('.pj-dock-hot')) track('dock_click', { project: l });
    if (a.matches('.pj-prev, .pj-next')) track('project_arrow', { direction: a.classList.contains('pj-next') ? 'next' : 'prev' });
    if (/^mailto:/.test(href)) track('email_click', { href });
    else if (/\.pdf($|\?)/.test(href)) track('resume_download', { href });
    else if (/^https?:\/\//.test(href) && !href.includes(location.hostname)) track('outbound_click', { href, cta: l });
  }, true);

  // ---- projects window: which case study is on screen -------------------
  const win = document.getElementById('pj-window');
  if (win) {
    const slides = [...win.querySelectorAll('.pj-slide')];
    const mo = new MutationObserver(() => {
      const on = slides.find((s) => s.classList.contains('is-active'));
      if (on) track('project_view', { project: on.querySelector('h3').textContent.trim() });
    });
    slides.forEach((s) => mo.observe(s, { attributes: true, attributeFilter: ['class'] }));
  }

  // ---- section + scroll depth -------------------------------------------
  const sections = [
    ['hero', '.hero-name'], ['about', '.about'], ['work', '.projects-heading'], ['monthly_recap', '.recap-monthly'],
    ['life_in_a_cart', '.cart-title'], ['procreate', '.procreate-heading'], ['lets_talk', '.t2-head']
  ].map(([n, sel]) => [n, document.querySelector(sel)]).filter(([, el]) => el);
  if (sections.length && 'IntersectionObserver' in window) {
    const seen = new Set();
    const io = new IntersectionObserver((es) => {
      for (const en of es) {
        if (!en.isIntersecting) continue;
        const name = sections.find(([, el]) => el === en.target)[0];
        if (seen.has(name)) continue;
        seen.add(name); track('section_view', { section: name }); io.unobserve(en.target);
      }
    }, { threshold: 0.2 });
    sections.forEach(([, el]) => io.observe(el));
  }
  const marks = [25, 50, 75, 100]; const hit = new Set();
  const depth = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    if (h <= 0) return;
    const pct = Math.round(((scrollY) / h) * 100);
    for (const m of marks) if (pct >= m && !hit.has(m)) { hit.add(m); track('scroll_depth', { percent: m }); }
  };
  addEventListener('scroll', depth, { passive: true }); depth();

  // ---- time on page (sent when leaving) ---------------------------------
  const t0 = performance.now();
  addEventListener('pagehide', () => track('page_leave', { seconds: Math.round((performance.now() - t0) / 1000), max_scroll: Math.max(0, ...hit) }));
})();
