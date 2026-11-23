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


/* 테마 맞춤형 셀렉트 목록 팝업 제어 */
(function initCustomSelectMenus() {
  if (window.__libCustomSelectInitialized) return;
  window.__libCustomSelectInitialized = true;

  let activeMenu = null;
  let activeWrap = null;

  function closeActiveMenu() {
    if (activeMenu) {
      activeMenu.classList.remove('is-open');
      activeMenu = null;
    }
    if (activeWrap) {
      activeWrap.classList.remove('is-open');
      const trig = activeWrap.querySelector('.lib-select-trigger');
      if (trig) trig.setAttribute('aria-expanded', 'false');
      activeWrap = null;
    }
  }

  function positionMenu(trigger, menu) {
    const rect = trigger.getBoundingClientRect();
    const minW = Math.max(rect.width, 170);
    menu.style.minWidth = `${minW}px`;
    menu.style.width = `${rect.width}px`;

    const menuHeight = Math.min(menu.scrollHeight || 220, 260);
    const spaceBelow = window.innerHeight - rect.bottom;
    const top = spaceBelow < menuHeight + 14 && rect.top > menuHeight + 14
      ? Math.max(8, rect.top - menuHeight - 6)
      : Math.min(window.innerHeight - menuHeight - 8, rect.bottom + 6);

    const left = Math.min(
      Math.max(8, rect.left),
      Math.max(8, window.innerWidth - minW - 8)
    );

    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;
  }

  function enhanceSelect(selectEl) {
    if (!selectEl || selectEl.dataset.libEnhanced === 'true') return;
    selectEl.dataset.libEnhanced = 'true';

    const isInline = selectEl.style.width === 'auto' || selectEl.closest('.filter-inputs') !== null;
    const wrap = document.createElement('div');
    wrap.className = 'lib-select-wrap' + (isInline ? ' is-inline' : '');

    const trigger = document.createElement('button');
    trigger.type = 'button';
    trigger.className = 'lib-select-trigger';
    trigger.setAttribute('aria-haspopup', 'listbox');
    trigger.setAttribute('aria-expanded', 'false');

    const labelSpan = document.createElement('span');
    labelSpan.className = 'lib-select-label';

    const arrowSpan = document.createElement('span');
    arrowSpan.className = 'lib-select-arrow';
    arrowSpan.setAttribute('aria-hidden', 'true');
    arrowSpan.textContent = '▼';

    trigger.appendChild(labelSpan);
    trigger.appendChild(arrowSpan);

    const menu = document.createElement('div');
    menu.className = 'lib-select-menu';
    menu.setAttribute('role', 'listbox');
    document.body.appendChild(menu);

    function syncFromSelect() {
      const selectedOpt = selectEl.options[selectEl.selectedIndex] || selectEl.options[0];
      labelSpan.textContent = selectedOpt ? selectedOpt.textContent : '';
      menu.innerHTML = '';

      Array.from(selectEl.options).forEach((opt, idx) => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'lib-select-option' + (opt.selected ? ' is-selected' : '');
        item.setAttribute('role', 'option');
        item.setAttribute('aria-selected', opt.selected ? 'true' : 'false');
        item.dataset.value = opt.value;

        const textEl = document.createElement('span');
        textEl.textContent = opt.textContent;
        item.appendChild(textEl);

        if (opt.selected) {
          const checkEl = document.createElement('span');
          checkEl.className = 'lib-select-check';
          checkEl.textContent = '✓';
          item.appendChild(checkEl);
        }

        item.addEventListener('click', (e) => {
          e.stopPropagation();
          selectEl.selectedIndex = idx;
          selectEl.value = opt.value;
          selectEl.dispatchEvent(new Event('change', { bubbles: true }));
          syncFromSelect();
          closeActiveMenu();
          trigger.focus();
        });

        menu.appendChild(item);
      });
    }

    selectEl.parentNode.insertBefore(wrap, selectEl);
    selectEl.classList.add('lib-select-native-hidden');
    wrap.appendChild(selectEl);
    wrap.appendChild(trigger);

    syncFromSelect();

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (activeWrap === wrap) {
        closeActiveMenu();
        return;
      }
      closeActiveMenu();
      syncFromSelect();
      wrap.classList.add('is-open');
      menu.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      positionMenu(trigger, menu);
      activeMenu = menu;
      activeWrap = wrap;
    });

    selectEl.addEventListener('change', syncFromSelect);
  }

  function enhanceAllSelects() {
    document.querySelectorAll('select').forEach(enhanceSelect);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', enhanceAllSelects);
  } else {
    enhanceAllSelects();
  }

  document.addEventListener('click', (e) => {
    if (activeMenu && !activeMenu.contains(e.target) && activeWrap && !activeWrap.contains(e.target)) {
      closeActiveMenu();
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && activeMenu) {
      closeActiveMenu();
    }
  });

  window.addEventListener('resize', () => {
    if (activeWrap && activeMenu) {
      const trig = activeWrap.querySelector('.lib-select-trigger');
      if (trig) positionMenu(trig, activeMenu);
    }
  }, { passive: true });

  window.addEventListener('scroll', (e) => {
    if (!activeMenu) return;
    if (e.target && (e.target === activeMenu || activeMenu.contains(e.target))) {
      return;
    }
    closeActiveMenu();
  }, { passive: true, capture: true });
})();


/* 사이트 내 네오-브루탈리즘 알림 토스트 유틸리티 */
(function initLibNotice() {
  if (window.showLibNotice) return;

  function getContainer() {
    let container = document.querySelector('.lib-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'lib-toast-container';
      container.setAttribute('aria-live', 'polite');
      container.setAttribute('aria-atomic', 'true');
      document.body.appendChild(container);
    }
    return container;
  }

  window.showLibNotice = function showLibNotice(message, type = 'warn', duration = 3400) {
    const container = getContainer();
    const toast = document.createElement('div');
    toast.className = 'lib-toast' + (type ? ` is-${type}` : '');
    toast.setAttribute('role', 'status');

    const textSpan = document.createElement('span');
    textSpan.textContent = String(message || '');

    const closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'lib-toast-close';
    closeBtn.setAttribute('aria-label', '알림 닫기');
    closeBtn.textContent = '×';

    function removeToast() {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }

    closeBtn.addEventListener('click', removeToast);
    toast.appendChild(textSpan);
    toast.appendChild(closeBtn);
    container.appendChild(toast);

    if (duration > 0) {
      setTimeout(removeToast, duration);
    }
  };
})();
