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
  const words = [...document.querySelectorAll('.input-word')];
  const stages = [...document.querySelectorAll('.process-list li')];
  const animated = [...words, ...stages];
  let observer;
  let frame = 0;
  const clamp = value => Math.min(1, Math.max(0, value));
  function update() {
    frame = 0;
    const height = innerHeight;
    const rect = section.getBoundingClientRect();
    if (rect.bottom > 0 && rect.top < height) {
      section.style.setProperty('--network-turn', (clamp(-rect.top / Math.max(1, rect.height-height))*100)+'deg');
    }
    animated.forEach(element => {
      const box = element.getBoundingClientRect();
      if (box.bottom < -height*.3 || box.top > height*1.3) return;
      const position = (box.top + box.height/2-height*.5)/(height*.5);
      // A wide, still reading window; entrance and exit follow scroll position.
      const distance = Math.max(0, Math.abs(position)-.28);
      const amount = Math.min(1, distance/.95);
      const direction = Math.sign(position);
      element.style.setProperty('--motion-y', (direction*amount*95)+'px');
      element.style.setProperty('--motion-angle', (direction*amount*-55)+'deg');
      element.style.setProperty('--motion-opacity', Math.max(.08,1-amount).toFixed(3));
      element.classList.toggle('is-active', Math.abs(position)<.65);
    });
  }
  function schedule() { if (!frame) frame=requestAnimationFrame(update); }
  function configureMotion() {
    if(observer) observer.disconnect();
    removeEventListener('scroll',schedule);
    removeEventListener('resize',schedule);
    cancelAnimationFrame(frame); frame=0;
    document.documentElement.classList.remove('motion-enabled');
    if(reducedMotion.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if(entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.08});
    document.querySelectorAll('.reveal:not(.process-list li), .pm-principles p').forEach(el=>observer.observe(el));
    document.documentElement.classList.add('motion-enabled');
    addEventListener('scroll',schedule,{passive:true});
    addEventListener('resize',schedule,{passive:true});
    schedule();
  }
  configureMotion();
  if(reducedMotion.addEventListener) reducedMotion.addEventListener('change',configureMotion);
})();
