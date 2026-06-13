export async function initHero3D() {
  // Only initialize on home page
  const isHome = window.location.pathname === '/' || window.location.pathname === '/index.html' || document.body.classList.contains('home-page') || document.querySelector('.intro-header.big-img'); // We'll just check for intro-header
  
  const header = document.querySelector('.intro-header');
  if (!header) return;

  // Reduced motion guard
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    showStaticPoster(header);
    return;
  }

  // Low power / data guard
  if (navigator.connection && (navigator.connection.saveData || navigator.connection.effectiveType === 'slow-2g' || navigator.connection.effectiveType === '2g')) {
    showStaticPoster(header);
    return;
  }

  // Gate initialization behind IntersectionObserver
  const observer = new IntersectionObserver(async (entries) => {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      try {
        const { startScene } = await import('./scene.js');
        startScene(header);
      } catch (e) {
        console.error('Failed to load 3D scene:', e);
        showStaticPoster(header);
      }
    }
  }, { threshold: 0.1 });

  observer.observe(header);
}

function showStaticPoster(header) {
  // Static poster fallback
  const canvasContainer = document.createElement('div');
  canvasContainer.style.position = 'absolute';
  canvasContainer.style.top = '0';
  canvasContainer.style.left = '0';
  canvasContainer.style.width = '100%';
  canvasContainer.style.height = '100%';
  canvasContainer.style.zIndex = '0';
  canvasContainer.style.backgroundImage = 'url("/assets/img/hero-fallback.webp")';
  canvasContainer.style.backgroundSize = 'cover';
  canvasContainer.style.backgroundPosition = 'center';
  canvasContainer.style.opacity = '0.3'; // Blend into background
  canvasContainer.style.pointerEvents = 'none';

  // Ensure header has relative positioning to contain absolute child
  if (getComputedStyle(header).position === 'static') {
    header.style.position = 'relative';
  }
  
  header.prepend(canvasContainer);
}
