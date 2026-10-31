// Hero scene: a glowing gold torus knot with a green core and drifting dust, parallaxed by the pointer.
// Does nothing without WebGL, without three.js, or when the visitor prefers reduced motion.
window.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('scene');
  if (!canvas || !window.THREE || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, .1, 100);
  camera.position.z = 9;

  const gold = 0xdfc999, green = 0x5fd38d;
  const rig = new THREE.Group();
  scene.add(rig);

  const knotGeo = new THREE.TorusKnotGeometry(2.3, .64, 160, 16, 2, 3);
  const wire = new THREE.LineSegments(new THREE.WireframeGeometry(knotGeo), new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: .16 }));
  const dots = new THREE.Points(knotGeo, new THREE.PointsMaterial({ color: gold, size: .04, transparent: true, opacity: .95 }));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.15, 1), new THREE.MeshBasicMaterial({ color: green, wireframe: true, transparent: true, opacity: .55 }));
  const halo = new THREE.Mesh(new THREE.TorusGeometry(3.7, .012, 8, 120), new THREE.MeshBasicMaterial({ color: green, transparent: true, opacity: .45 }));
  halo.rotation.x = 1.2;
  rig.add(wire, dots, core, halo);

  function dust(count, spread, size, color, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r = spread * (.35 + Math.random() * .65), t = Math.random() * 6.283, p = Math.acos(2 * Math.random() - 1);
      pos.set([r * Math.sin(p) * Math.cos(t), r * Math.sin(p) * Math.sin(t), r * Math.cos(p)], i * 3);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color, size, transparent: true, opacity, depthWrite: false }));
  }
  const far = dust(700, 22, .05, green, .55), near = dust(160, 12, .09, gold, .7);
  scene.add(far, near);

  const pointer = { x: 0, y: 0 }, eased = { x: 0, y: 0 };
  addEventListener('pointermove', e => { pointer.x = e.clientX / innerWidth - .5; pointer.y = e.clientY / innerHeight - .5; });

  let w = 0, h = 0;
  function resize() {
    w = canvas.clientWidth; h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // Wide screens: knot sits right of the headline. Narrow: centred and dimmed behind the text.
    const wide = w / h > 1.15;
    rig.position.set(wide ? 3.1 : 0, wide ? 0 : 2.2, 0);
    rig.scale.setScalar(wide ? 1 : .7);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  let visible = true, last = performance.now();
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { last = performance.now(); requestAnimationFrame(frame); } }).observe(canvas);

  function frame(now) {
    if (!visible) return;
    const dt = Math.min((now - last) / 1000, .05); last = now;
    eased.x += (pointer.x - eased.x) * .05;
    eased.y += (pointer.y - eased.y) * .05;
    rig.rotation.y += dt * .22;
    rig.rotation.x = eased.y * .6 + Math.sin(now / 4000) * .08;
    rig.rotation.z += dt * .04;
    core.rotation.y -= dt * .6;
    core.rotation.x += dt * .35;
    const s = 1 + Math.sin(now / 900) * .06;
    core.scale.setScalar(s);
    halo.rotation.z += dt * .3;
    far.rotation.y += dt * .015;
    near.rotation.y -= dt * .03;
    camera.position.x = eased.x * 1.2;
    camera.position.y = -eased.y * .8 - scrollY * .002;
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
  canvas.classList.add('ready');
});
