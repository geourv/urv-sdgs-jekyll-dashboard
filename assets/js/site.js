/*
File: assets/js/site.js
Purpose: Client-side UI behavior: mobile sidebar toggle, overlay layering, dropdown persistence, sidebar scroll restore.
Related files:
  - _includes/sidebar.html
  - assets/css/styles.css
Safe edits:
  - OK: Adjust breakpoints and persisted keys; add new dropdown groups
  - Careful: Changing element ids (#mySidebar, #myOverlay) or z-index expectations can block clicks on mobile
Notes:
  - Sidebar open/closed state is stored in sessionStorage to avoid auto-closing on navigation.
*/

// assets/js/site.js
(function () {
  const SIDEBAR_STATE_KEY = 'sidebar:state'; // 'open' | 'closed'
  const DESKTOP_SIDEBAR_COLLAPSED_KEY = 'sidebar:desktop:collapsed'; // '1' | '0'
  const SHARED_FILTERS_KEY = 'sdgs:sharedFilters:v1';
  const SHARED_FILTER_QUERY_KEYS = ['centreCode', 'programmeKey', 'systemId', 'sectionId'];
  const SHARED_FILTER_TARGET_PATH_SUFFIXES = [
    '/pages/wordcloud',
    '/pages/doughnut',
    '/pages/radar',
    '/pages/bubble',
    '/pages/course-details',
    '/pages/sdg-matrix',
    '/pages/degree-barchart',
    '/pages/degree-wordcloud',
    '/pages/degree2'
  ];
  function normalizeSharedFilters(raw) {
    const source = raw && typeof raw === 'object' ? raw : {};
    return {
      centreCode: String(source.centreCode || '').trim(),
      programmeKey: String(source.programmeKey || '').trim(),
      systemId: String(source.systemId || '').trim(),
      sectionId: String(source.sectionId || '').trim()
    };
  }

  function normalizeSharedFilterPath(pathname) {
    let normalized = String(pathname || '');
    normalized = normalized.replace(/\/+$/, '');
    if (normalized.endsWith('.html')) {
      normalized = normalized.slice(0, -5);
    }
    return normalized;
  }

  function isSharedFilterTargetUrl(url) {
    if (!url || typeof url.pathname !== 'string') return false;
    const normalizedPath = normalizeSharedFilterPath(url.pathname);
    return SHARED_FILTER_TARGET_PATH_SUFFIXES.some((suffix) => {
      return normalizedPath === suffix || normalizedPath.endsWith(suffix);
    });
  }

  function readSharedFiltersFromUrl(urlLike) {
    try {
      const url = new URL(String(urlLike || ''), window.location.href);
      const patch = {};
      SHARED_FILTER_QUERY_KEYS.forEach((key) => {
        if (url.searchParams.has(key)) {
          patch[key] = String(url.searchParams.get(key) || '');
        }
      });
      return patch;
    } catch (_) {
      return {};
    }
  }

  function readSharedFilters() {
    const fromUrl = readSharedFiltersFromUrl(window.location.href);
    try {
      const raw = localStorage.getItem(SHARED_FILTERS_KEY);
      if (!raw) return normalizeSharedFilters(fromUrl);
      return normalizeSharedFilters({ ...JSON.parse(raw), ...fromUrl });
    } catch (_) {
      return normalizeSharedFilters(fromUrl);
    }
  }

  function writeSharedFilters(patch) {
    const current = readSharedFilters();
    const next = normalizeSharedFilters({ ...current, ...(patch || {}) });
    try {
      localStorage.setItem(SHARED_FILTERS_KEY, JSON.stringify(next));
    } catch (_) {}
    return next;
  }

  function clearSharedFilters() {
    try {
      localStorage.removeItem(SHARED_FILTERS_KEY);
    } catch (_) {}
  }

  window.SDGFilterMemory = {
    read: readSharedFilters,
    write: writeSharedFilters,
    clear: clearSharedFilters
  };

  const SHARED_FILTER_CONTROL_IDS = {
    centreCode: ['faculty-select', 'facultySelect'],
    programmeKey: ['degree-select', 'degreeSelect'],
    systemId: ['doughnut-system-select', 'radar-system-select', 'bubble-system-select', 'barchart-system-select', 'course-system-select', 'systemSelect'],
    sectionId: ['doughnut-section-select', 'radar-section-select', 'bubble-section-select', 'barchart-section-select', 'course-section-select', 'matrix-section-select', 'sectionSelect']
  };

  function firstExistingElementById(ids) {
    const idList = Array.isArray(ids) ? ids : [];
    for (let i = 0; i < idList.length; i += 1) {
      const element = document.getElementById(String(idList[i] || ''));
      if (element) return element;
    }
    return null;
  }

  function readFilterValueFromControl(controlEl) {
    if (!controlEl) return { hasValue: false, value: '' };
    const optionCount = Number(controlEl.options?.length || 0);
    const value = String(controlEl.value || '').trim();

    // Ignore not-yet-initialized selects that still have a single placeholder option.
    if (!value && optionCount <= 1) return { hasValue: false, value: '' };
    return { hasValue: true, value };
  }

  function captureSharedFiltersFromControls() {
    const patch = {};
    let hasAnyValue = false;

    const centre = readFilterValueFromControl(firstExistingElementById(SHARED_FILTER_CONTROL_IDS.centreCode));
    const programme = readFilterValueFromControl(firstExistingElementById(SHARED_FILTER_CONTROL_IDS.programmeKey));
    const system = readFilterValueFromControl(firstExistingElementById(SHARED_FILTER_CONTROL_IDS.systemId));
    const section = readFilterValueFromControl(firstExistingElementById(SHARED_FILTER_CONTROL_IDS.sectionId));

    if (centre.hasValue) {
      patch.centreCode = centre.value;
      hasAnyValue = true;
    }
    if (programme.hasValue) {
      patch.programmeKey = programme.value;
      hasAnyValue = true;
    }
    if (system.hasValue) {
      patch.systemId = system.value;
      hasAnyValue = true;
    }
    if (section.hasValue) {
      patch.sectionId = section.value;
      hasAnyValue = true;
    }

    if (!hasAnyValue) return null;
    return writeSharedFilters(patch);
  }

  function isSharedFilterControlElement(element) {
    if (!(element instanceof Element)) return false;
    const elementId = String(element.id || '');
    if (!elementId) return false;
    return Object.values(SHARED_FILTER_CONTROL_IDS).some((idList) => {
      return Array.isArray(idList) && idList.includes(elementId);
    });
  }

  function withSharedFiltersInUrl(url, filters) {
    let target;
    try {
      target = new URL(String(url || ''), window.location.href);
    } catch (_) {
      return null;
    }
    if (!isSharedFilterTargetUrl(target)) return target;

    const normalized = normalizeSharedFilters(filters);
    SHARED_FILTER_QUERY_KEYS.forEach((key) => {
      const value = String(normalized[key] || '');
      if (value) target.searchParams.set(key, value);
      else target.searchParams.delete(key);
    });
    return target;
  }

  function setupSharedFilterNavigationPersistence() {
    const persistCurrentSharedFilters = () => {
      return captureSharedFiltersFromControls();
    };

    document.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest('a[href]');
      if (!link) return;

      let url;
      try {
        url = new URL(link.href, window.location.href);
      } catch (_) {
        return;
      }
      if (url.origin !== window.location.origin) return;

      const persistedFilters = persistCurrentSharedFilters() || readSharedFilters();
      const urlWithFilters = withSharedFiltersInUrl(url, persistedFilters);
      if (urlWithFilters) {
        link.href = urlWithFilters.toString();
      }
    }, true);

    document.addEventListener('change', (event) => {
      if (isSharedFilterControlElement(event.target)) {
        persistCurrentSharedFilters();
      }
    }, true);

    window.addEventListener('pagehide', persistCurrentSharedFilters);
    window.addEventListener('beforeunload', persistCurrentSharedFilters);
  }

  function ensureOverlay() {
    let overlay = document.getElementById('myOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'myOverlay';
      overlay.className = 'w3-overlay w3-hide-large w3-animate-opacity';
      overlay.style.display = 'none';
      // Keep the overlay BELOW the sidebar so menu links remain clickable.
      // (Sidebar uses z-index: 1001; overlay uses 1000.)
      overlay.style.zIndex = '1000';
      overlay.title = 'close side menu';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function openSidebar(persist = true) {
    const s = document.getElementById('mySidebar');
    const o = ensureOverlay();
    if (!s) return;
    s.style.display = 'block';
    o.style.display = 'block';
    o.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    if (persist) {
      try { sessionStorage.setItem(SIDEBAR_STATE_KEY, 'open'); } catch (_) {}
    }
  }

  function closeSidebar(persist = true) {
    const s = document.getElementById('mySidebar');
    const o = document.getElementById('myOverlay');
    if (!s || !o) return;
    s.style.display = 'none';
    o.style.display = 'none';
    o.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (persist) {
      try { sessionStorage.setItem(SIDEBAR_STATE_KEY, 'closed'); } catch (_) {}
    }
  }

  function toggleSidebar() {
    const s = document.getElementById('mySidebar');
    if (!s) return;
    if (getComputedStyle(s).display !== 'none') closeSidebar(true);
    else openSidebar(true);
  }

  function isDesktopViewport() {
    if (typeof window.matchMedia === 'function') {
      return window.matchMedia('(min-width: 993px)').matches;
    }
    return (window.innerWidth || 0) >= 993;
  }

  function readDesktopSidebarCollapsedPreference() {
    try {
      return localStorage.getItem(DESKTOP_SIDEBAR_COLLAPSED_KEY) === '1';
    } catch (_) {
      return false;
    }
  }

  function writeDesktopSidebarCollapsedPreference(isCollapsed) {
    try {
      localStorage.setItem(DESKTOP_SIDEBAR_COLLAPSED_KEY, isCollapsed ? '1' : '0');
    } catch (_) {}
  }

  function applyDesktopSidebarCollapsedState(isCollapsed, persist = true) {
    const collapsed = Boolean(isCollapsed);
    const shouldApplyCollapsed = collapsed && isDesktopViewport();
    document.body.classList.toggle('site-sidebar-collapsed', shouldApplyCollapsed);

    const toggleBtn = document.getElementById('desktopSidebarToggle');
    const toggleIcon = document.getElementById('desktopSidebarToggleIcon');
    if (toggleBtn) {
      const isExpanded = !shouldApplyCollapsed;
      const label = isExpanded
        ? 'Col·lapsar panell de navegació'
        : 'Obrir panell de navegació';
      toggleBtn.setAttribute('aria-expanded', String(isExpanded));
      toggleBtn.setAttribute('aria-label', label);
      toggleBtn.setAttribute('title', label);
    }
    if (toggleIcon) {
      toggleIcon.className = shouldApplyCollapsed ? 'fa fa-bars' : 'fa fa-chevron-left';
    }

    if (persist) {
      writeDesktopSidebarCollapsedPreference(collapsed);
    }
  }

  function setupDesktopSidebarToggle() {
    const toggleBtn = document.getElementById('desktopSidebarToggle');
    if (!toggleBtn) return;

    toggleBtn.addEventListener('click', (event) => {
      event.preventDefault();
      if (!isDesktopViewport()) return;
      const nextCollapsed = !document.body.classList.contains('site-sidebar-collapsed');
      applyDesktopSidebarCollapsedState(nextCollapsed, true);
    });

    applyDesktopSidebarCollapsedState(readDesktopSidebarCollapsedPreference(), false);
  }

  function syncSidebarWithViewport() {
    const s = document.getElementById('mySidebar');
    const o = ensureOverlay();
    if (!s) return;

    const mq = (typeof window.matchMedia === 'function')
      ? window.matchMedia('(min-width: 993px)')
      : null;
    function sync(e) {
      const desktopMatch = (e && typeof e.matches === 'boolean')
        ? e.matches
        : isDesktopViewport();
      if (desktopMatch) {
        s.style.display = 'block';
        o.style.display = 'none';
        document.body.style.overflow = '';
      } else {
        // On small screens, do NOT auto-close on navigation.
        // Instead, restore the last user choice.
        let state = 'closed';
        try {
          state = sessionStorage.getItem(SIDEBAR_STATE_KEY) || 'closed';
        } catch (_) {}

        if (state === 'open') {
          openSidebar(false);
        } else {
          closeSidebar(false);
        }
      }

      applyDesktopSidebarCollapsedState(readDesktopSidebarCollapsedPreference(), false);
    }
    if (mq && typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', sync);
    } else if (mq && typeof mq.addListener === 'function') {
      mq.addListener(sync);
    } else {
      window.addEventListener('resize', sync);
    }
    sync(mq);

    // Clicking the overlay is an explicit user action → persist the closed state.
    o.addEventListener('click', () => closeSidebar(true));
  }

  function setupDropdowns() {
    // Toggle for the custom dropdown block inside sidebar
    const toggles = document.querySelectorAll('.w3-dropdown-clicker');
    toggles.forEach(toggle => {
      const menu = toggle.querySelector('.w3-dropdown-content');
      if (!menu) return;

      const dropdownId = toggle.dataset.dropdownId || 'default';
      const storageKey = `sidebarDropdown:${dropdownId}`;
      const defaultOpen = toggle.dataset.defaultOpen === 'true';
      const stored = sessionStorage.getItem(storageKey);

      // Respect server-side default (e.g., current page inside dropdown) and user choice.
      const shouldOpen = defaultOpen || stored === 'open' || menu.style.display === 'block';
      menu.style.display = shouldOpen ? 'block' : 'none';
      toggle.setAttribute('aria-expanded', String(shouldOpen));

      toggle.addEventListener('click', (ev) => {
        // Avoid closing sidebar when clicking links inside dropdown
        if (ev.target && ev.target.closest('a')) return;

        const open = menu.style.display !== 'none';
        menu.style.display = open ? 'none' : 'block';
        toggle.setAttribute('aria-expanded', String(!open));
        sessionStorage.setItem(storageKey, open ? 'closed' : 'open');
        ev.stopPropagation();
      });
    });

    // Intentionally do NOT auto-close dropdowns on outside clicks.
    // Reason: it feels like the menu “collapses by itself”, especially on mobile.
    // Dropdowns should only change state when the user taps the dropdown header.
  }

  function restoreSidebarScroll() {
    const s = document.getElementById('mySidebar');
    if (!s) return;
    const saved = sessionStorage.getItem('sidebarScrollTop');
    if (saved != null) {
      const n = parseInt(saved, 10);
      if (!Number.isNaN(n)) s.scrollTop = n;
    }
    window.addEventListener('beforeunload', () => {
      try { sessionStorage.setItem('sidebarScrollTop', String(s.scrollTop || 0)); } catch (_) {}
    });
  }

  
  function setupBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;

    const showAfter = 260; // px
    function onScroll() {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      btn.style.display = (y > showAfter) ? 'flex' : 'none';
    }

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

function setupFooterYear() {
    const y = new Date().getFullYear();
    document.querySelectorAll('[data-year]').forEach(el => {
      el.textContent = String(y);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    // wire global handlers expected by mobile menu button
    window.w3_open = toggleSidebar;
    window.w3_close = closeSidebar;

    setupSharedFilterNavigationPersistence();
    syncSidebarWithViewport();
    setupDesktopSidebarToggle();
    setupDropdowns();
    restoreSidebarScroll();
    setupFooterYear();
    setupBackToTop();
  });
})();
