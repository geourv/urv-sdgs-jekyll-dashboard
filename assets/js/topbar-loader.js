/*
File: assets/js/topbar-loader.js
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

// assets/js/topbar-loader.js
(() => {
    const MAX_UP = 4;
  
    function buildCandidates() {
      const out = [];
      let prefix = '';
      for (let i = 0; i <= MAX_UP; i++) {
        out.push(`${prefix}assets/includes/topbar.html`);
        prefix += '../';
      }
      return out;
    }
  
    async function fetchFirstOk(urls) {
      for (const url of urls) {
        try {
          const res = await fetch(url, { cache: 'no-store' });
          if (res.ok) return { url, text: await res.text() };
        } catch (_) {}
      }
      throw new Error('no s’ha pogut carregar la topbar en cap ruta candidata');
    }
  
    function fixRelativeURLs(rootNode, prefix) {
      rootNode.querySelectorAll('[src],[href]').forEach(el => {
        ['src','href'].forEach(attr => {
          const val = el.getAttribute(attr);
          if (!val) return;
          // ignora absolutes o d’arrel
          if (/^(https?:)?\/\//i.test(val) || /^(mailto:|tel:|#|\/)/i.test(val)) return;
          el.setAttribute(attr, prefix + val);
        });
      });
    }
  
    function insertTopbar(node) {
      // si ja n’hi ha una, la substituïm suaument; si no, la posem al principi del <body>
      const existing = document.getElementById('myTopbar') || document.querySelector('.w3-top');
      if (existing && existing.parentNode) {
        existing.parentNode.replaceChild(node, existing);
      } else {
        document.body.insertBefore(node, document.body.firstChild);
      }
      // assegura z-index perquè quede per damunt de l’overlay (3)
      node.style.zIndex = node.style.zIndex || '4';
    }
  
    async function init() {
      try {
        // no dupliquem si ja existeix
        if (document.getElementById('myTopbar')) return;
  
        const { url, text } = await fetchFirstOk(buildCandidates());
        const prefix = url.replace(/assets\/includes\/topbar\.html$/, '');
  
        const tmp = document.createElement('div');
        tmp.innerHTML = text;
  
        const topbar = tmp.querySelector('#myTopbar') || tmp.firstElementChild;
        if (!topbar) throw new Error('el partial de topbar no té #myTopbar');
  
        fixRelativeURLs(topbar, prefix);
        insertTopbar(topbar);
  
        // opcional: evitar que l’overlay tape el topbar
        const overlay = document.getElementById('myOverlay');
        if (overlay && (!overlay.style.zIndex || Number(overlay.style.zIndex) >= 4)) {
          overlay.style.zIndex = '3';
        }
  
        document.dispatchEvent(new Event('topbar:ready'));
      } catch (err) {
        console.error(err);
      }
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  