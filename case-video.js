/* Case studies: screen recordings playing inside hero / figure devices (.full-video).
   Each loops at the desk's 1.25x while its figure is on screen and pauses when it
   scrolls away or the tab is hidden; reduced-motion leaves it on its first frame
   until played. The round button toggles it. */
document.querySelectorAll('.full-video').forEach((box) => {
  const v = box.querySelector('video');
  const btn = box.querySelector('.video-toggle');
  v.defaultPlaybackRate = v.playbackRate = 1.25;
  let visible = false, paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => {
    if (visible && !paused && !document.hidden) v.play().catch((err) => { if (err.name === 'NotAllowedError') setPaused(true); });
    else v.pause();
  };
  const setPaused = (p) => {
    paused = p;
    box.classList.toggle('is-paused', p);
    btn.setAttribute('aria-label', p ? 'Play video' : 'Pause video');
    sync();
  };
  btn.addEventListener('click', () => setPaused(!paused));
  new IntersectionObserver(([en]) => { visible = en.isIntersecting; sync(); }, { threshold: 0.3 }).observe(box);
  document.addEventListener('visibilitychange', sync);
  setPaused(paused);
});
