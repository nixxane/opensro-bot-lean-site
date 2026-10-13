const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';

// Pages
$$('#rail button').forEach(b => b.onclick = () => {
  $$('#rail button').forEach(x => x.setAttribute('aria-selected', x === b));
  $$('.pg').forEach(p => p.hidden = p.dataset.p !== b.dataset.p);
  if (b.dataset.p === 'map') draw();
});
$$('.seg, .classes, #areas').forEach(g => g.addEventListener('click', e => {
  const t = e.target.closest('button, li'); if (!t || !g.contains(t)) return;
  [...g.children].forEach(x => x.classList.toggle('sel', x === t));
}));
$$('.mini-ic img').forEach(i => i.onclick = () => i.classList.toggle('on'));

// Start / stop, compact mode, clock
$('#toggle').onclick = () => {
  const s = $('#bot').classList.toggle('stopped');
  $('#state').textContent = s ? 'Stopped' : 'Hunting';
  $('#reason').textContent = s ? 'Press F8 to resume' : 'Attacking Tiger Girl · pet collecting';
};
$('#mode').onclick = () => { const c = $('#bot').classList.toggle('compact'); $('#mode').textContent = c ? 'Wide' : 'Compact'; draw(); };
let t = 5048;
setInterval(() => {
  if ($('#bot').classList.contains('stopped')) return;
  t++; const f = n => String(n | 0).padStart(2, '0');
  $('#clock').textContent = `${f(t / 3600)}:${f(t / 60 % 60)}:${f(t % 60)}`;
}, 1000);

// Map: real minimap tiles (regions 168-171 × 96-99, 192 m each), metres from the block's top-left corner.
const R = 192, X0 = 168, Y1 = 99, N = 4;
const S = { tile: 240, center: { u: 600, v: 470 }, rad: 40, chase: 70, tool: 'center',
  path: [{ u: 560, v: 440 }, { u: 640, v: 430 }, { u: 650, v: 510 }], avoid: [{ u: 520, v: 530, r: 18 }],
  me: { u: 606, v: 476 }, view: null };
const mobs = [[585, 455, 'm'], [622, 488, 'm'], [612, 452, 'm'], [575, 500, 'm'], [660, 470, 'm'], [640, 520, 'u']].map(([u, v, k]) => ({ u, v, k, du: 0, dv: 0 }));
const party = [{ u: 596, v: 486 }, { u: 616, v: 462 }];
const player = { u: 690, v: 445 };
const map = $('#map'), tiles = $('#tiles'), ov = $('#ov');
for (let x = 0; x < N; x++) for (let y = 0; y < N; y++) {
  const img = new Image(); img.src = `map/${X0 + x}x${Y1 - y}.png`; img.alt = ''; img.dataset.x = x; img.dataset.y = y; tiles.append(img);
}
const k = () => S.tile / R;
function centreView() { S.view = { x: S.center.u * k() - map.clientWidth / 2, y: S.center.v * k() - map.clientHeight / 2 }; }
function el(tag, attrs) { const e = document.createElementNS(NS, tag); for (const a in attrs) e.setAttribute(a, attrs[a]); return e; }
function icon(href, p, size) { return el('image', { href, x: p.u * k() - size / 2, y: p.v * k() - size / 2, width: size, height: size }); }
function draw() {
  if (!map.clientWidth) return;
  if (!S.view) centreView();
  S.view.x = Math.max(0, Math.min(N * S.tile - map.clientWidth, S.view.x)); S.view.y = Math.max(0, Math.min(N * S.tile - map.clientHeight, S.view.y));
  const K = k(), ox = -S.view.x, oy = -S.view.y;
  tiles.style.transform = `translate(${ox}px,${oy}px)`;
  for (const img of tiles.children) Object.assign(img.style, { left: img.dataset.x * S.tile + 'px', top: img.dataset.y * S.tile + 'px', width: S.tile + 'px', height: S.tile + 'px' });
  ov.setAttribute('width', N * S.tile); ov.setAttribute('height', N * S.tile); ov.style.transform = `translate(${ox}px,${oy}px)`;
  ov.replaceChildren();
  const c = S.center;
  for (const a of S.avoid) ov.append(el('circle', { cx: a.u * K, cy: a.v * K, r: a.r * K, fill: '#d9583e44', stroke: '#d9583e', 'stroke-width': 1.5 }));
  ov.append(el('circle', { cx: c.u * K, cy: c.v * K, r: S.chase * K, fill: 'none', stroke: '#ffd65a99', 'stroke-dasharray': '5 4' }));
  ov.append(el('circle', { cx: c.u * K, cy: c.v * K, r: S.rad * K, fill: '#ffd65a1f', stroke: '#ffd65a', 'stroke-width': 2 }));
  if (S.path.length) {
    ov.append(el('polyline', { points: [...S.path, S.path[0]].map(p => `${p.u * K},${p.v * K}`).join(' '), fill: 'none', stroke: '#6fc1ff', 'stroke-width': 2, 'stroke-dasharray': '1 0' }));
    S.path.forEach((p, i) => { ov.append(el('circle', { cx: p.u * K, cy: p.v * K, r: 7, fill: '#0b2233', stroke: '#6fc1ff', 'stroke-width': 1.5 }));
      const tx = el('text', { x: p.u * K, y: p.v * K + 3.5, 'text-anchor': 'middle', fill: '#fff', 'font-size': 10, 'font-weight': 'bold' }); tx.textContent = i + 1; ov.append(tx); });
  }
  ov.append(el('line', { x1: c.u * K - 5, y1: c.v * K, x2: c.u * K + 5, y2: c.v * K, stroke: '#ffd65a' }), el('line', { x1: c.u * K, y1: c.v * K - 5, x2: c.u * K, y2: c.v * K + 5, stroke: '#ffd65a' }));
  for (const m of mobs) ov.append(icon(m.k === 'u' ? 'a/mm_sign_unique.png' : 'a/mm_sign_monster.png', { u: m.u + m.du, v: m.v + m.dv }, m.k === 'u' ? 14 : 10));
  for (const p of party) ov.append(icon('a/mm_sign_party.png', p, 12));
  ov.append(icon('a/mm_sign_otherplayer.png', player, 11));
  const me = icon('a/mm_sign_character.png', S.me, 16); ov.append(me);
}
function at(e) { const r = map.getBoundingClientRect(); return { u: (e.clientX - r.left + S.view.x) / k(), v: (e.clientY - r.top + S.view.y) / k() }; }
let drag = null;
map.onpointerdown = e => { drag = { x: e.clientX, y: e.clientY, vx: S.view.x, vy: S.view.y, moved: false }; map.setPointerCapture(e.pointerId); };
map.onpointermove = e => {
  const p = at(e), rx = X0 + Math.floor(p.u / R), ry = Y1 - Math.floor(p.v / R);
  $('#coords').textContent = `X ${Math.round(p.u * 10) % 1920} · Y ${Math.round(p.v * 10) % 1920} · region ${rx}×${ry}`;
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (Math.abs(dx) + Math.abs(dy) > 4) drag.moved = true;
  if (drag.moved) { S.view.x = drag.vx - dx; S.view.y = drag.vy - dy; draw(); }
};
map.onpointerup = e => {
  const d = drag; drag = null; if (!d || d.moved) return;
  const p = at(e);
  if (S.tool === 'center') S.center = p;
  else if (S.tool === 'path') S.path.push(p);
  else S.avoid.push({ ...p, r: 15 });
  draw();
};
$$('#tool button').forEach(b => b.addEventListener('click', () => S.tool = b.dataset.t));
const zoom = f => { const cu = (S.view.x + map.clientWidth / 2) / k(), cv = (S.view.y + map.clientHeight / 2) / k();
  S.tile = Math.max(120, Math.min(480, S.tile * f)); S.view = { x: cu * k() - map.clientWidth / 2, y: cv * k() - map.clientHeight / 2 }; draw(); };
$('#zin').onclick = () => zoom(1.5); $('#zout').onclick = () => zoom(1 / 1.5);
for (const [id, key] of [['rad', 'rad'], ['chase', 'chase']]) $('#' + id).oninput = e => { S[key] = +e.target.value; $('#' + id + 'v').textContent = e.target.value; draw(); };
setInterval(() => {
  if ($('#bot').classList.contains('stopped')) return;
  for (const m of mobs) { m.du = Math.max(-6, Math.min(6, m.du + (Math.random() - .5) * 2)); m.dv = Math.max(-6, Math.min(6, m.dv + (Math.random() - .5) * 2)); }
  S.me.u += (mobs[0].u - S.me.u) * .02; S.me.v += (mobs[0].v - S.me.v) * .02;
  if (!$('[data-p=map]').hidden) draw();
}, 400);
addEventListener('resize', draw);
requestAnimationFrame(draw);
if (innerWidth < 1040) { $('#bot').classList.add('compact'); $('#mode').textContent = 'Wide'; }
