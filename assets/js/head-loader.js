/*
File: assets/js/head-loader.js
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

// assets/js/head-loader.js
(() => {
    const MAX_UP = 4;
  
    function buildCandidates(forced) {
      if (forced) return [forced + 'assets/includes/head.html'];
      const out = []; let p = '';
      for (let i = 0; i <= MAX_UP; i++) { out.push(p + 'assets/includes/head.html'); p += '../'; }
      return out;
    }
  
    async function fetchFirstOk(urls) {
      for (const url of urls) {
        try { const r = await fetch(url, { cache: 'no-store' }); if (r.ok) return { url, text: await r.text() }; } catch {}
      }
      throw new Error('no s’ha pogut carregar head.html');
    }
  
    function fixRel(url, prefix) {
      if (!url) return url;
      if (/^(https?:)?\/\//i.test(url) || /^(mailto:|tel:|#|\/)/i.test(url)) return url;
      return prefix + url;
    }
  
    function insertMetaAndLinks(tmp, prefix) {
      const head = document.head;
  
      // dedupe meta bàsics
      tmp.querySelectorAll('meta[charset]').forEach(n => { if (head.querySelector('meta[charset]')) n.remove(); });
      tmp.querySelectorAll('meta[name="viewport"]').forEach(n => { if (head.querySelector('meta[name="viewport"]')) n.remove(); });
  
      // arregla i dedupe links
      const existing = new Set([...head.querySelectorAll('link[href]')].map(n => n.getAttribute('href')));
      tmp.querySelectorAll('link[href]').forEach(link => {
        link.setAttribute('href', fixRel(link.getAttribute('href'), prefix));
        if (existing.has(link.getAttribute('href'))) link.remove();
      });
  
      // insereix (després del <title> si n’hi ha)
      const afterTitle = head.querySelector('title')?.nextSibling ?? head.firstChild;
      [...tmp.querySelectorAll('meta,link')].forEach(node => head.insertBefore(node, afterTitle));
    }
  
    async function insertAndRunScripts(tmp, prefix) {
      const head = document.head;
      const scripts = [...tmp.querySelectorAll('script')];
  
      const promises = scripts.map(srcNode => new Promise((resolve, reject) => {
        const el = document.createElement('script');
  
        // copia atributs útils
        ['type','crossorigin','integrity','referrerpolicy','nomodule'].forEach(a => {
          if (srcNode.hasAttribute(a)) el.setAttribute(a, srcNode.getAttribute(a));
        });
  
        const hasDefer = srcNode.hasAttribute('defer');
        const hasAsync = srcNode.hasAttribute('async');
  
        // si no indica res, posem defer per preservar l’ordre i no bloquejar
        if (!hasDefer && !hasAsync) el.defer = true;
        if (hasDefer) el.defer = true;
        if (hasAsync) el.async = true;
  
        const src = srcNode.getAttribute('src');
        if (src) {
          el.src = fixRel(src, prefix);
  
          // dedupe per src
          if (document.querySelector(`script[src="${CSS.escape(el.src)}"]`)) {
            resolve(); // ja existeix, no el tornem a carregar
            return;
          }
  
          el.onload = () => resolve();
          el.onerror = (e) => reject(new Error(`error carregant ${el.src}`));
          head.appendChild(el);
        } else {
          // inline script
          el.textContent = srcNode.textContent;
          head.appendChild(el);
          resolve();
        }
      }));
  
      await Promise.all(promises);
    }
  
    async function init() {
      try {
        const caller = document.currentScript;
        const forcedPrefix = caller?.dataset?.prefix || null;
  
        const { url, text } = await fetchFirstOk(buildCandidates(forcedPrefix));
        const autoPrefix = url.replace(/assets\/includes\/head\.html$/, '');
        const prefix = forcedPrefix ?? autoPrefix;
  
        const tmp = document.createElement('div');
        tmp.innerHTML = text.trim();
  
        insertMetaAndLinks(tmp, prefix);
        await insertAndRunScripts(tmp, prefix);
  
        // esdeveniment per a que el teu codi sàpiga que les libs del head estan llestes
        document.dispatchEvent(new Event('head:scripts-ready'));
      } catch (e) {
        console.error(e);
      }
    }
  
    // sense defer per carregar CSS/JS comuns al més prompte possible
    if (document.readyState === 'loading') init();
    else init();
  })();
  