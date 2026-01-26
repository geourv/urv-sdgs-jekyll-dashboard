/*
File: assets/js/sidebar-loader.js
Purpose: Legacy include/loader used in the original static version (kept for reference; not required by Jekyll layout).
Related files:
  - _layouts/default.html
  - _includes/*.html
Safe edits:
  - OK: You may delete after confirming nothing references it
  - Careful: If any page still loads it directly, removal will break that page
Notes:
  - Current Jekyll version uses _includes and _layouts instead of runtime HTML loaders.
*/

// assets/js/sidebar-loader.js
(() => {
  // quantes capes volem provar com a màxim (arrel, ../, ../../, ...)
  const MAX_UP = 4;

  function buildCandidates() {
    // prova la ruta al mateix nivell, i va pujant
    const candidates = [];
    let prefix = '';
    for (let i = 0; i <= MAX_UP; i++) {
      candidates.push(`${prefix}assets/includes/sidebar.html`);
      prefix += '../';
    }
    return candidates;
  }

  async function fetchFirstOk(urls) {
    for (const url of urls) {
      try {
        const res = await fetch(url, { cache: 'no-store' });
        if (res.ok) return { url, text: await res.text() };
      } catch (_) { /* ignora i prova la següent */ }
    }
    throw new Error('no s’ha pogut carregar la sidebar en cap ruta candidata');
  }

  // reescriu src/href interns perquè siguen relatius al mateix prefix amb què hem trobat el partial
  function fixRelativeURLs(rootNode, prefix) {
    const ATTRS = ['src', 'href'];
    rootNode.querySelectorAll('[src],[href]').forEach(el => {
      for (const attr of ATTRS) {
        const val = el.getAttribute(attr);
        if (!val) continue;
        // salta absolutes (http, https, //, mailto:, tel:, #, /arrel)
        if (/^(https?:)?\/\//i.test(val) || /^(mailto:|tel:|#|\/)/i.test(val)) continue;
        // ja prefixat amb ../ correctament?
        el.setAttribute(attr, prefix + val);
      }
    });
  }

  function ensureOverlay() {
    let overlay = document.getElementById('myOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'myOverlay';
      overlay.className = 'w3-overlay w3-hide-large w3-animate-opacity';
      overlay.style.display = 'none';
      overlay.style.zIndex = '3'; // la topbar al teu HTML està a 4
      overlay.title = 'close side menu';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  function openSidebar() {
    const s = document.getElementById('mySidebar');
    const o = document.getElementById('myOverlay');
    if (!s || !o) return;
    s.style.display = 'block';
    o.style.display = 'block';
    o.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeSidebar() {
    const s = document.getElementById('mySidebar');
    const o = document.getElementById('myOverlay');
    if (!s || !o) return;
    s.style.display = 'none';
    o.style.display = 'none';
    o.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  function toggleSidebar() {
    const s = document.getElementById('mySidebar');
    if (!s) return;
    if (getComputedStyle(s).display !== 'none') closeSidebar();
    else openSidebar();
  }

  async function insertSidebarIfMissing() {
    if (document.getElementById('mySidebar')) return; // ja inserida

    const candidates = buildCandidates();
    const { url, text } = await fetchFirstOk(candidates);

    // prefix és la part "assets/includes/sidebar.html" minus l’últim tros
    // ex: url = "../assets/includes/sidebar.html" → prefix = "../"
    const prefix = url.replace(/assets\/includes\/sidebar\.html$/, '');

    const tmp = document.createElement('div');
    tmp.innerHTML = text;

    const sidebar = tmp.querySelector('#mySidebar');
    if (!sidebar) throw new Error('el partial no conté #mySidebar');

    // arreglem rutes internes de logos/enllaços
    fixRelativeURLs(sidebar, prefix);

    // estats inicials segurs
    sidebar.style.display = sidebar.style.display || 'none';
    if (!sidebar.style.zIndex) sidebar.style.zIndex = '5';
    if (!sidebar.style.width) sidebar.style.width = '300px';

    // insereix abans de .w3-main si existeix, si no al body
    const main = document.querySelector('.w3-main');
    if (main && main.parentNode) {
      main.parentNode.insertBefore(sidebar, main);
    } else {
      document.body.appendChild(sidebar);
    }

    // overlay (si el partial ja en du un, també cal reescriure-li rutes)
    let overlay = document.getElementById('myOverlay') || tmp.querySelector('#myOverlay');
    if (overlay && !overlay.parentNode) {
      fixRelativeURLs(overlay, prefix);
      document.body.appendChild(overlay);
    }
    overlay = ensureOverlay();

    // wiring global
    window.w3_open = toggleSidebar;
    window.w3_close = closeSidebar;

    overlay.addEventListener('click', closeSidebar);

    // mode escriptori/mòbil
    const mq = window.matchMedia('(min-width: 993px)');
    function sync(e) {
      const s = document.getElementById('mySidebar');
      const o = document.getElementById('myOverlay');
      if (!s || !o) return;
      if (e.matches) { // escriptori
        s.style.display = 'block';
        o.style.display = 'none';
        document.body.style.overflow = '';
      } else { // mòbil
        s.style.display = 'none';
        o.style.display = 'none';
        document.body.style.overflow = '';
      }
    }
    mq.addEventListener('change', sync);
    sync(mq);

    document.dispatchEvent(new Event('sidebar:ready'));
  }

  function init() {
    insertSidebarIfMissing().catch(console.error);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
