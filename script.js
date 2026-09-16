/* 公開前の設定：メールかお問い合わせフォームのURLを入力します。
   例: contactEmail: '実際のメールアドレス'
   contactUrlを入力すると、メールよりフォームを優先します。 */
const SITE_CONFIG = {
  contactEmail: 'info@lcdesign.page',
  contactUrl: ''
};

(() => {
  'use strict';
  const link = document.getElementById('contact-link');
  let destination = '';
  if (SITE_CONFIG.contactUrl) {
    try {
      const url = new URL(SITE_CONFIG.contactUrl);
      if (url.protocol === 'https:') destination = url.href;
    } catch (_) { /* 未設定・不正なURLでは準備中の案内を保持 */ }
  }
  if (!destination && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(SITE_CONFIG.contactEmail)) {
    destination = 'mailto:' + encodeURIComponent(SITE_CONFIG.contactEmail) + '?subject=' + encodeURIComponent('L.C.DESIGNへのお問い合わせ');
  }
  if (destination) {
    link.href = destination;
    link.hidden = false;
    document.getElementById('contact-pending').hidden = true;
    document.getElementById('contact-note').hidden = false;
  }
  document.getElementById('year').textContent = new Date().getFullYear();

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const section = document.querySelector('.input-section');
  let observers = [];
  let frame = 0;
  let watchingInput = false;

  function updateNetwork() {
    frame = 0;
    if (!watchingInput || reducedMotion.matches) return;
    const rect = section.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height - innerHeight)));
    section.style.setProperty('--converge', progress.toFixed(3));
  }
  function onScroll() {
    if (!frame && watchingInput) frame = requestAnimationFrame(updateNetwork);
  }
  function configureMotion() {
    observers.forEach(observer => observer.disconnect());
    observers = [];
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    cancelAnimationFrame(frame);
    frame = 0;
    watchingInput = false;
    document.documentElement.classList.remove('motion-enabled');
    section.style.removeProperty('--converge');
    if (reducedMotion.matches || !('IntersectionObserver' in window)) return;

    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    const wordObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => entry.target.classList.toggle('is-active', entry.isIntersecting));
    }, { rootMargin: '-18% 0px -18% 0px', threshold: 0 });
    const sectionObserver = new IntersectionObserver(entries => {
      watchingInput = entries[0].isIntersecting;
      if (watchingInput) onScroll();
    });
    document.documentElement.classList.add('motion-enabled');
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
    document.querySelectorAll('.input-word').forEach(element => wordObserver.observe(element));
    sectionObserver.observe(section);
    observers = [revealObserver, wordObserver, sectionObserver];
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }
  configureMotion();
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', configureMotion);
})();
