/* Site analytics (Google Analytics 4, optional Microsoft Clarity).
   Every event below is a specific action: which button, which project, which
   case study. GA4's own page_view stays on because it is what counts visitors,
   countries, devices and page visits in the standard reports. */
(function () {
  const GA_ID = 'G-NZ9EE6GHM5';   // GA4 Measurement ID
  const CLARITY_ID = '';          // optional: clarity.microsoft.com project id

  const page = document.body.dataset.page || 'home';   // home | flebo | menteiz | kargo360

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  if (GA_ID) {
    const s = document.createElement('script');
    s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { page_title: document.title });
  }
  if (CLARITY_ID) {
    (function (c, l, a, r, i, t, y) {
      c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
      t = l.createElement(r); t.async = 1; t.src = 'https://www.clarity.ms/tag/' + i;
      y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
    })(window, document, 'clarity', 'script', CLARITY_ID);
  }

  const track = (name, params) => {
    const p = Object.assign({ page }, params || {});
    if (GA_ID) gtag('event', name, p);
    if (CLARITY_ID && window.clarity) window.clarity('event', name);
    if (location.hostname === 'localhost') console.debug('[analytics]', name, p);
  };

  // Case study visits: flebo_case_study_visit, menteiz_case_study_visit, kargo360_case_study_visit
  if (page !== 'home') track(page + '_case_study_visit');

  // Which project a link points at: flebo.html -> flebo, menteiz.html -> menteiz, kargo360.html -> kargo360
  const projectOf = (href) => ((href || '').match(/(flebo|menteiz|kargo360)\.html/) || [])[1];

  document.addEventListener('click', (e) => {
    const t = e.target instanceof Element ? e.target : null;
    const a = t && t.closest('a, button');
    if (!a) return;
    const href = a.getAttribute('href') || '';
    const proj = projectOf(href);

    // Home: nav + contact CTAs
    if (a.matches('.nav-cta')) return track('lets_chat_click');
    if (a.matches('.nav-resume')) return track('nav_resume_click');
    if (a.matches('.hero-cta-work')) return track('hero_see_work_click');
    if (a.matches('.hero-cta-resume')) return track('hero_resume_click');
    if (a.matches('.nav-links a')) return track('nav_' + (a.dataset.scrollTo || 'link') + '_click');
    if (a.matches('.t2-resume')) return track('resume_click');
    if (a.matches('.t2-email')) return track('email_click');
    if (a.matches('.t2-linkedin')) return track('linkedin_click');

    // Projects window: dock icons, arrows, opening a case study
    if (a.matches('.pj-dock-hot')) return track(['flebo', 'menteiz', 'kargo360'][+a.dataset.slide] + '_dock_click');
    if (a.matches('.pj-prev')) return track('project_prev_arrow_click');
    if (a.matches('.pj-next')) return track('project_next_arrow_click');
    if (a.matches('.pj-play')) return track(a.getAttribute('aria-label') === 'Play video' ? 'project_video_play_click' : 'project_video_pause_click');
    if (a.matches('.pj-slide') && proj) return track(proj + '_case_study_click');

    // Case study pages
    if (a.matches('.folder-link')) return track('back_to_folder_click');
    if (a.matches('.back') || a.matches('.foot-row a')) return track('back_to_desk_click');
    if (a.matches('.next-link') && proj) return track(proj + '_next_up_click');
    if (a.matches('.video-toggle')) return track(page + (a.getAttribute('aria-label') === 'Play video' ? '_video_play_click' : '_video_pause_click'));
  }, true);
})();
