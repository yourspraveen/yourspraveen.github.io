import * as THREE from 'three';

export function startScene(headerElement) {
  // Setup Container
  const container = document.createElement('div');
  container.id = 'hero-3d-canvas';
  container.setAttribute('aria-hidden', 'true'); // decorative visual only
  container.style.position = 'absolute';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.zIndex = '0';
  container.style.pointerEvents = 'none'; // let clicks pass through to real HTML
  container.style.overflow = 'hidden';

  if (getComputedStyle(headerElement).position === 'static') {
    headerElement.style.position = 'relative';
  }
  headerElement.prepend(container);

  // Setup Three.js Scene
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5)); // Cap DPR for perf
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Lattice points: integer combinations of three sheared basis vectors —
  // the structure underlying lattice-based (post-quantum) cryptography.
  const B1 = [1.7, 0.18, 0.0];
  const B2 = [0.22, 1.7, 0.18];
  const B3 = [0.18, 0.22, 1.7];
  const N = 3; // i,j,k in [-N, N] -> 7^3 = 343 points

  const latticePoint = (i, j, k) => [
    i * B1[0] + j * B2[0] + k * B3[0],
    i * B1[1] + j * B2[1] + k * B3[1],
    i * B1[2] + j * B2[2] + k * B3[2]
  ];

  const points = [];
  const edges = [];
  for (let i = -N; i <= N; i++) {
    for (let j = -N; j <= N; j++) {
      for (let k = -N; k <= N; k++) {
        const p = latticePoint(i, j, k);
        points.push(p[0], p[1], p[2]);
        // Nearest-neighbor edges: one +1 step along each basis vector
        if (i < N) { const q = latticePoint(i + 1, j, k); edges.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
        if (j < N) { const q = latticePoint(i, j + 1, k); edges.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
        if (k < N) { const q = latticePoint(i, j, k + 1); edges.push(p[0], p[1], p[2], q[0], q[1], q[2]); }
      }
    }
  }

  const particlesGeometry = new THREE.BufferGeometry();
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(points), 3));

  const edgesGeometry = new THREE.BufferGeometry();
  edgesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(edges), 3));

  // Read hero color from the theme token so light/dark stay in sync with the site.
  const readHeroColor = () => new THREE.Color(
    getComputedStyle(document.documentElement).getPropertyValue('--hero-col').trim() || '#0066CC'
  );
  const heroColor = readHeroColor();

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.06,
    color: heroColor.clone(),
    transparent: true,
    opacity: 0.7
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Lattice edges (nearest-neighbor node graph)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: heroColor.clone(),
    transparent: true,
    opacity: 0.15
  });
  const latticeLines = new THREE.LineSegments(edgesGeometry, lineMaterial);
  scene.add(latticeLines);

  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const c = readHeroColor();
        particlesMaterial.color.copy(c);
        lineMaterial.color.copy(c);
      }
    });
  });
  observer.observe(document.documentElement, { attributes: true });

  // Animation Loop
  let mouseX = 0;
  let mouseY = 0;

  // only listen if not on mobile for perf
  if(window.innerWidth > 768) {
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth) - 0.5;
      mouseY = (e.clientY / window.innerHeight) - 0.5;
    });
  }

  let animationFrameId;
  const clock = new THREE.Clock();

  function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Pause if not intersecting
    if (container.getBoundingClientRect().bottom < 0) return;

    const elapsedTime = clock.getElapsedTime();

    particlesMesh.rotation.y = elapsedTime * 0.03;
    particlesMesh.rotation.x = elapsedTime * 0.015;
    latticeLines.rotation.y = particlesMesh.rotation.y;
    latticeLines.rotation.x = particlesMesh.rotation.x;

    // Subtle parallax
    camera.position.x += (mouseX * 2 - camera.position.x) * 0.05;
    camera.position.y += (-mouseY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }

  animate();

  // Handle Resize
  window.addEventListener('resize', () => {
    if(!container.clientWidth) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
}
