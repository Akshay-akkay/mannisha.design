/* Case studies: screen recordings playing inside hero / figure devices (.full-video).
   Each loops at the desk's 1.25x while its figure is on screen and pauses when it
   scrolls away or the tab is hidden; reduced-motion leaves it on its first frame
   until played. The round button toggles it. */
document.querySelectorAll('.full-video').forEach((box) => {
  const vs = box.querySelectorAll('video');
  const btn = box.querySelector('.video-toggle');
  // a figure with data-w lays its video out in the image's own pixels; --s scales it to fit
  if (box.dataset.w) new ResizeObserver(() => box.style.setProperty('--s', box.clientWidth / box.dataset.w)).observe(box);
  vs.forEach((v) => { v.defaultPlaybackRate = v.playbackRate = 1.25; });
  let visible = false, paused = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sync = () => {
    vs.forEach((v) => {
      if (visible && !paused && !document.hidden) v.play().catch((err) => { if (err.name === 'NotAllowedError') setPaused(true); });
      else v.pause();
    });
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
