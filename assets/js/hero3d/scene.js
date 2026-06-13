import * as THREE from 'three';

export function startScene(headerElement) {
  // Setup Container
  const container = document.createElement('div');
  container.id = 'hero-3d-canvas';
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

  // Particles / Node Graph logic
  const particlesGeometry = new THREE.BufferGeometry();
  const particlesCount = 300;
  
  const posArray = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

  // Determine current theme color
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark' || 
                 (localStorage.getItem('theme-preference') !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                 
  const getThemeColor = () => isDark ? 0x64b5f6 : 0x0085A1;

  const particlesMaterial = new THREE.PointsMaterial({
    size: 0.05,
    color: getThemeColor(),
    transparent: true,
    opacity: 0.8
  });

  const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particlesMesh);

  // Add subtle lines between close particles (Node Graph effect)
  const lineMaterial = new THREE.LineBasicMaterial({
    color: getThemeColor(),
    transparent: true,
    opacity: 0.15
  });

  // Watch for theme changes
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'data-theme') {
        const newIsDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newColor = newIsDark ? 0x64b5f6 : 0x0085A1;
        particlesMaterial.color.setHex(newColor);
        lineMaterial.color.setHex(newColor);
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

    particlesMesh.rotation.y = elapsedTime * 0.05;
    particlesMesh.rotation.x = elapsedTime * 0.02;

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
