/*
File: assets/js/footer-loader.js
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

// assets/js/footer-loader.js
(() => {
    const MAX_UP = 4;
  
    function buildCandidates(forcedPrefix) {
      if (forcedPrefix) return [forcedPrefix + 'assets/includes/footer.html'];
      const out = []; let p = '';
      for (let i = 0; i <= MAX_UP; i++) { out.push(p + 'assets/includes/footer.html'); p += '../'; }
      return out;
    }
  
    async function fetchFirstOk(urls) {
      for (const url of urls) {
        try {
          const r = await fetch(url, { cache: 'no-store' });
          if (r.ok) return { url, text: await r.text() };
        } catch (_) {}
      }
      throw new Error('no s’ha pogut carregar footer.html en cap ruta candidata');
    }
  
    function fixRelativeURLs(root, prefix) {
      root.querySelectorAll('[href],[src]').forEach(el => {
        ['href','src'].forEach(attr => {
          const v = el.getAttribute(attr);
          if (!v) return;
          if (/^(https?:)?\/\//i.test(v) || /^(mailto:|tel:|#|\/)/i.test(v)) return; // absolut o d’arrel
          el.setAttribute(attr, prefix + v);
        });
      });
    }
  
    function insertFooter(node) {
      // preferim afegir-lo dins de .w3-main si existeix
      const main = document.querySelector('.w3-main');
      if (main) {
        main.appendChild(node);
      } else {
        // si no hi ha .w3-main, el posem al final del body
        document.body.appendChild(node);
      }
    }
  
    function enhanceFooter(node) {
      // any automàtic
      const spanYear = node.querySelector('[data-year]');
      if (spanYear) spanYear.textContent = new Date().getFullYear();
  
      // evita que tape contingut si fas sticky amb CSS més endavant
      // (aquí no apliquem sticky; només wiring per si calgués)
    }
  
    async function init() {
      try {
        if (document.getElementById('siteFooter')) return; // ja hi és
  
        const caller = document.currentScript;
        const forcedPrefix = caller?.dataset?.prefix || null;
        const { url, text } = await fetchFirstOk(buildCandidates(forcedPrefix));
        const autoPrefix = url.replace(/assets\/includes\/footer\.html$/, '');
        const prefix = forcedPrefix ?? autoPrefix;
  
        const tmp = document.createElement('div');
        tmp.innerHTML = text.trim();
  
        const footer = tmp.querySelector('#siteFooter') || tmp.firstElementChild;
        if (!footer) throw new Error('el partial de footer no té #siteFooter');
  
        fixRelativeURLs(footer, prefix);
        insertFooter(footer);
        enhanceFooter(footer);
  
        document.dispatchEvent(new Event('footer:ready'));
      } catch (e) {
        console.error(e);
      }
    }
  
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();
  