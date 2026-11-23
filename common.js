/* LIB-TEACHER 공통 인터랙션 (빛 블러 · 커스텀 커서 · 이스터에그) */
(function initLibCommon() {
  if (window.__libCommonInitialized) return;
  window.__libCommonInitialized = true;

  const prefersFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  if (prefersFinePointer) {
    document.body.classList.add('lib-common-ready');
  }

  const cursor = document.querySelector('.custom-cursor');
  const ring = document.querySelector('.custom-cursor-ring');
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let ringX = targetX;
  let ringY = targetY;

  window.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    document.documentElement.style.setProperty('--mouse-x', `${targetX}px`);
    document.documentElement.style.setProperty('--mouse-y', `${targetY}px`);
    if (cursor) {
      cursor.style.left = `${targetX}px`;
      cursor.style.top = `${targetY}px`;
    }
  }, { passive: true });

  function animateRing() {
    ringX += (targetX - ringX) * 0.18;
    ringY += (targetY - ringY) * 0.18;
    if (ring) {
      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;
    }
    requestAnimationFrame(animateRing);
  }
  requestAnimationFrame(animateRing);

  const hoverSelector = 'a, button, .copyleft-badge, .dropzone';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.add('is-hovering');
    }
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverSelector)) {
      document.body.classList.remove('is-hovering');
    }
  });

  window.addEventListener('pointerdown', () => document.body.classList.add('is-clicking'));
  window.addEventListener('pointerup', () => document.body.classList.remove('is-clicking'));

  // 이스터에그 ('frog' 입력 또는 카피레프트 배지 5회 클릭)
  let keyBuffer = '';
  let toastTimer = null;
  let badgeClicks = 0;

  window.triggerFrogEasterEgg = function triggerFrogEasterEgg() {
    const badge = document.getElementById('copyleftBadge');
    const toast = document.getElementById('frogToast');
    badge?.classList.add('unlocked');
    if (!toast) return;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 4200);
  };

  const copyleftBadge = document.getElementById('copyleftBadge');
  copyleftBadge?.addEventListener('click', () => {
    badgeClicks += 1;
    if (badgeClicks >= 5) {
      badgeClicks = 0;
      window.triggerFrogEasterEgg();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : '';
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    keyBuffer = (keyBuffer + e.key.toLowerCase()).slice(-6);
    if (keyBuffer.endsWith('frog')) {
      keyBuffer = '';
      window.triggerFrogEasterEgg();
    }
  });
})();
