(() => {
  const root = document.documentElement;
  const hero = document.querySelector('.motion-hero');
  if (!hero) return;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  const pauseButton = document.querySelector('#motion-toggle');
  const preview = document.querySelector('#hero-preview');
  const canvas = document.querySelector('#kinetic-canvas');
  const ctx = canvas?.getContext('2d');
  const progress = document.querySelector('.scroll-progress');
  let userPaused = false;
  try { userPaused = localStorage.getItem('yuzhou-motion-paused') === 'true'; } catch {}
  let heroVisible = true, frame = 0, lastFrame = 0, width = 0, height = 0;
  let pointerX = 0.5, pointerY = 0.5, stroke = '#7bdfff';
  const isPaused = () => userPaused || reducedMotion.matches;
  const updateColour = () => { stroke = getComputedStyle(root).getPropertyValue('--live-accent').trim() || '#7bdfff'; };
  updateColour();
  document.querySelectorAll('[data-theme-choice]').forEach(button => button.addEventListener('click', updateColour));

  function resizeCanvas() {
    if (!canvas || !ctx) return;
    width = hero.clientWidth; height = hero.clientHeight;
    const scale = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(width * scale); canvas.height = Math.round(height * scale);
    canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (isPaused()) drawGraphic(0);
  }
  function drawGraphic(time) {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const count = width < 700 ? 15 : 26;
    const points = [];
    for (let i = 0; i < count; i++) {
      const x = width * (.24 + .76 * ((i * .381966) % 1)) + Math.sin(time * .00018 + i * 1.8) * 25 + (pointerX - .5) * 9;
      const y = height * (.04 + .83 * ((i * .618034) % 1)) + Math.cos(time * .00014 + i * .9) * 20 + (pointerY - .5) * 8;
      points.push({x, y});
    }
    ctx.strokeStyle = stroke; ctx.fillStyle = stroke;
    for (let i = 0; i < count; i++) {
      const a = points[i];
      for (let j = i + 1; j < count; j++) {
        const b = points[j]; const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 155) { ctx.globalAlpha = (1 - d / 155) * .25; ctx.lineWidth = .65; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      ctx.globalAlpha = .28; ctx.beginPath(); ctx.arc(a.x, a.y, i % 4 === 0 ? 2.2 : 1.1, 0, Math.PI * 2); ctx.fill();
      if (i % 6 === 0) { ctx.globalAlpha = .18; ctx.lineWidth = .65; ctx.beginPath(); ctx.arc(a.x, a.y, 7, 0, Math.PI * 2); ctx.stroke(); }
    }
    ctx.globalAlpha = 1;
  }
  function animate(time) {
    if (isPaused() || !heroVisible || document.hidden) { frame = 0; return; }
    if (time - lastFrame > 1000 / 30) { drawGraphic(time); lastFrame = time; }
    frame = requestAnimationFrame(animate);
  }
  function updatePreview() {
    if (!preview) return;
    if (isPaused() || !heroVisible || document.hidden || navigator.connection?.saveData || document.querySelector('#video-modal')?.open) { preview.pause(); return; }
    if (!preview.getAttribute('src')) { preview.muted = true; preview.src = preview.dataset.src; }
    preview.play().catch(() => {});
  }
  function updateActivity() {
    if (frame) { cancelAnimationFrame(frame); frame = 0; }
    if (!isPaused() && heroVisible && !document.hidden) frame = requestAnimationFrame(animate);
    updatePreview();
  }
  function updateMotion() {
    root.dataset.motion = isPaused() ? 'paused' : 'running';
    root.classList.toggle('motion-ready', !isPaused());
    if (pauseButton) {
      pauseButton.disabled = reducedMotion.matches;
      pauseButton.setAttribute('aria-pressed', String(isPaused()));
      pauseButton.querySelector('.motion-toggle-label').textContent = reducedMotion.matches ? 'Reduced motion' : userPaused ? 'Resume motion' : 'Pause motion';
      pauseButton.querySelector('.motion-toggle-icon').textContent = isPaused() ? '▶' : 'Ⅱ';
      pauseButton.title = reducedMotion.matches ? 'Animation is reduced by your device settings.' : 'Pause or resume decorative animation and the silent video preview.';
    }
    updateActivity();
  }
  pauseButton?.addEventListener('click', () => { userPaused = !userPaused; try { localStorage.setItem('yuzhou-motion-paused', String(userPaused)); } catch {} updateMotion(); });
  reducedMotion.addEventListener('change', updateMotion);
  document.addEventListener('visibilitychange', updateActivity);
  if ('IntersectionObserver' in window) new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; updateActivity(); }, {threshold: .05}).observe(hero);
  if ('ResizeObserver' in window) new ResizeObserver(resizeCanvas).observe(hero);
  else window.addEventListener('resize', resizeCanvas, {passive:true});
  resizeCanvas();

  const reveals = document.querySelectorAll('.is-home .section-head, .is-home .project-feature, .is-home .project-card, .is-home .skill-grid > div, .is-home .entry');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }); }, {threshold:.07, rootMargin:'0px 0px -20px 0px'});
    reveals.forEach((element, i) => { element.dataset.reveal = ''; element.style.setProperty('--reveal-delay', ((i % 3) * 65) + 'ms'); observer.observe(element); });
  }
  let scrollQueued = false;
  function updateProgress() {
    const total = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.transform = 'scaleX(' + (total > 0 ? Math.min(1, scrollY / total) : 0) + ')';
    scrollQueued = false;
  }
  window.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateProgress); } }, {passive:true});
  updateProgress();
  const sections = document.querySelectorAll('#about,#projects,#skills,#experience,#contact');
  const navLinks = document.querySelectorAll('.nav a[href*="#"]');
  // Track visible sections without changing the document's navigation structure.
  if ('IntersectionObserver' in window) {
    const navObserver = new IntersectionObserver(entries => { entries.forEach(entry => { if (entry.isIntersecting) navLinks.forEach(link => { if (link.getAttribute('href').split('#')[1] === entry.target.id) link.setAttribute('aria-current','location'); else link.removeAttribute('aria-current'); }); }); }, {rootMargin:'-15% 0px -55% 0px'});
    sections.forEach(section => navObserver.observe(section));
  }
  const tilt = document.querySelector('[data-tilt]');
  hero.addEventListener('pointermove', event => {
    const box = hero.getBoundingClientRect();
    pointerX = (event.clientX - box.left) / box.width; pointerY = (event.clientY - box.top) / box.height;
    if (tilt && finePointer.matches && !isPaused()) tilt.style.transform = 'perspective(1100px) rotateY(' + ((pointerX - .5) * 5 - 2) + 'deg) rotateX(' + ((.5 - pointerY) * 3) + 'deg)';
  }, {passive:true});
  hero.addEventListener('pointerleave', () => { if (tilt) tilt.style.removeProperty('transform'); });

  const modal = document.querySelector('#video-modal');
  const modalVideo = document.querySelector('#modal-video');
  if (modal && modalVideo) {
    document.querySelectorAll('[data-open-demo]').forEach(button => button.addEventListener('click', () => {
      document.querySelector('#video-modal-title').textContent = button.dataset.demoTitle;
      document.querySelector('#video-modal-caption').textContent = button.dataset.demoCaption;
      modalVideo.muted = true; modalVideo.src = button.dataset.openDemo;
      modal.showModal(); preview?.pause(); modalVideo.play().catch(() => {});
    }));
    modal.querySelector('[data-close-demo]').addEventListener('click', () => modal.close());
    modal.addEventListener('click', event => { if (event.target === modal) modal.close(); });
    modal.addEventListener('close', () => { modalVideo.pause(); modalVideo.removeAttribute('src'); modalVideo.load(); updatePreview(); });
  }
  updateMotion();
})();
