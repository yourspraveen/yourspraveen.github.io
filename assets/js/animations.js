import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {
  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  // 1. Hero Entrance / Page Heading
  gsap.from(".intro-header .page-heading", {
    y: 50,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  });

  // 2. Sections / Containers Reveal
  const sections = gsap.utils.toArray([
    '#aboutme-section',
    '#contactme-section',
    '.tag-filter-container',
    '.post-meta-info'
  ].join(','));

  sections.forEach((sec) => {
    gsap.from(sec, {
      scrollTrigger: {
        trigger: sec,
        start: "top 85%",
        toggleActions: "play none none none"
      },
      y: 30,
      opacity: 0,
      duration: 0.8,
      ease: "power2.out"
    });
  });

  // 3. Staggered Reveal for Cards/Posts
  ScrollTrigger.batch(".post-preview, .blog-card", {
    onEnter: batch => gsap.fromTo(batch, 
      { opacity: 0, y: 30 }, 
      { opacity: 1, y: 0, stagger: 0.15, overwrite: true, duration: 0.8, ease: "power2.out" }
    ),
    start: "top 85%",
  });

  // 4. Achievement Counters (if applicable)
  const counters = gsap.utils.toArray('.achievement-counter');
  counters.forEach(counter => {
    const targetText = counter.getAttribute('data-target') || counter.innerText;
    const target = parseInt(targetText.replace(/,/g, ''), 10);
    if(isNaN(target)) return;
    
    counter.innerText = "0";
    
    gsap.to(counter, {
      scrollTrigger: {
        trigger: counter,
        start: "top 90%"
      },
      innerText: target,
      duration: 2,
      snap: { innerText: 1 },
      ease: "power1.out",
      onUpdate: function() {
        // Format with commas if needed
        counter.innerHTML = Math.ceil(this.targets()[0].innerText).toLocaleString();
      }
    });
  });

  // 5. Scroll Progress Bar
  const progressBar = document.createElement('div');
  progressBar.style.position = 'fixed';
  progressBar.style.top = '0';
  progressBar.style.left = '0';
  progressBar.style.height = '3px';
  progressBar.style.width = '100%';
  progressBar.style.backgroundColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#64b5f6' : '#0085A1';
  progressBar.style.transformOrigin = '0% 50%';
  progressBar.style.transform = 'scaleX(0)';
  progressBar.style.zIndex = '9999';
  document.body.appendChild(progressBar);

  // Update progress bar color on theme change
  new MutationObserver((mutations) => {
    mutations.forEach(m => {
      if (m.attributeName === 'data-theme') {
        progressBar.style.backgroundColor = document.documentElement.getAttribute('data-theme') === 'dark' ? '#64b5f6' : '#0085A1';
      }
    });
  }).observe(document.documentElement, { attributes: true });

  gsap.to(progressBar, {
    scaleX: 1,
    ease: "none",
    scrollTrigger: {
      trigger: document.documentElement,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.2
    }
  });

  // 6. Magnetic Hover States for Links & Buttons
  const magnetics = document.querySelectorAll('.footer-custom a, .navbar-brand, .nav-link, .btn, .social-icons a');
  magnetics.forEach(btn => {
    // Add inline block to allow transforms on inline elements
    if (window.getComputedStyle(btn).display === 'inline') {
      btn.style.display = 'inline-block';
    }
    
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - (rect.width / 2);
      const y = e.clientY - rect.top - (rect.height / 2);
      
      gsap.to(btn, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out"
      });
    });

    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {
        x: 0,
        y: 0,
        duration: 0.7,
        ease: "elastic.out(1, 0.3)"
      });
    });
  });
});
