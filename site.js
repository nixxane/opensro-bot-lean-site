// Shared page behaviour: nav highlight, scroll reveals, card glow, screenshot tilt, version label,
// latest patch notes on the home page, patch-notes search and the guide's scroll-spy.
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const page = document.body.className.match(/page-(\w+)/)?.[1];
  $$('[data-nav]').forEach(a => a.classList.toggle('on', a.dataset.nav === page));

  // Reveal on scroll.
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    }), { threshold: .12 });
    reveals.forEach((el, i) => { el.style.transitionDelay = `${(i % 3) * 80}ms`; io.observe(el); });
  } else reveals.forEach(el => el.classList.add('in'));

  // Spotlight that follows the pointer over cards.
  document.addEventListener('pointermove', e => {
    const card = e.target.closest?.('.card');
    if (!card) return;
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', `${e.clientX - r.left}px`);
    card.style.setProperty('--my', `${e.clientY - r.top}px`);
  });

  // 3D tilt on the front-page screenshot.
  const tilt = $('.shot-tilt');
  if (tilt && !reduced) {
    tilt.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      tilt.style.setProperty('--ry', `${((e.clientX - r.left) / r.width - .5) * 8}deg`);
      tilt.style.setProperty('--rx', `${-((e.clientY - r.top) / r.height - .5) * 6}deg`);
    });
    tilt.addEventListener('pointerleave', () => { tilt.style.setProperty('--rx', '0deg'); tilt.style.setProperty('--ry', '0deg'); });
  }

  // Version label from the bot repository.
  const label = $('#release');
  if (label) {
    fetch('https://raw.githubusercontent.com/nixxane/opensro-bot-lean/main/bot.lean.meta.js', { signal: AbortSignal.timeout(5000) })
      .then(r => r.ok ? r.text() : '')
      .then(t => { const v = t.match(/^\/\/\s*@version\s+(\d+\.\d+\.\d+)\s*$/m)?.[1]; if (v) label.textContent = `Current version ${v}`; })
      .catch(() => {});
  }

  // Latest three releases on the home page, read from notes.html so there is one place to edit.
  const latest = $('#latest');
  if (latest) {
    fetch('notes.html').then(r => r.text()).then(html => {
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const items = $$('.release', doc).slice(0, 3);
      if (!items.length) throw 0;
      latest.replaceChildren(...items.map(a => { const n = document.importNode(a, true); n.classList.add('reveal'); return n; }));
      $$('.reveal', latest).forEach(el => el.classList.add('in'));
    }).catch(() => { latest.innerHTML = '<p class="muted">See the full patch notes below.</p>'; });
  }

  // Patch-notes search. Opens the older-releases fold while searching.
  const search = $('#notes-search');
  if (search) {
    search.hidden = false;
    const all = $$('.release');
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase();
      all.forEach(a => a.classList.toggle('hidden', !!q && !a.textContent.toLowerCase().includes(q)));
      $$('details').forEach(d => { if (q) d.open = true; });
    });
  }

  // Guide scroll-spy.
  const links = $$('.toc a');
  if (links.length && 'IntersectionObserver' in window) {
    const map = new Map(links.map(a => [a.getAttribute('href').slice(1), a]));
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { links.forEach(a => a.classList.remove('on')); map.get(e.target.id)?.classList.add('on'); }
    }), { rootMargin: '-20% 0px -70% 0px' });
    map.forEach((_, id) => { const h = document.getElementById(id); if (h) spy.observe(h); });
  }
})();
