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

  function syncSidebarWithViewport() {
    const s = document.getElementById('mySidebar');
    const o = ensureOverlay();
    if (!s) return;

    const mq = window.matchMedia('(min-width: 993px)');
    function sync(e) {
      if (e.matches) {
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
    }
    mq.addEventListener('change', sync);
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

    syncSidebarWithViewport();
    setupDropdowns();
    restoreSidebarScroll();
    setupFooterYear();
    setupBackToTop();
  });
})();
