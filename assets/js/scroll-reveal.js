// Scroll-triggered reveal animations using Intersection Observer
(function() {
  'use strict';

  // Respect user preference for reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    return;
  }

  function initScrollReveal() {
    var selectors = [
      '.post-preview',
      '.blog-card',
      '#aboutme-section',
      '#contactme-section',
      '.tag-filter-container',
      '.intro-header .page-heading',
      '.post-meta-info'
    ];

    var elements = document.querySelectorAll(selectors.join(','));

    if (!elements.length || !('IntersectionObserver' in window)) {
      return;
    }

    // Determine which elements are already visible in the viewport
    var viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Group elements by parent for stagger delay assignment
    var siblingGroups = {};

    elements.forEach(function(el) {
      var rect = el.getBoundingClientRect();
      var isAboveFold = rect.top < viewportHeight;

      if (isAboveFold) {
        // Already visible on load — show immediately, no animation
        return;
      }

      // Below the fold — set up reveal animation
      el.classList.add('reveal');

      var parent = el.parentElement;
      var key = (parent ? (parent.id || parent.className || '') : '') + '|' + el.tagName;
      if (!siblingGroups[key]) {
        siblingGroups[key] = [];
      }
      var idx = siblingGroups[key].length;
      if (idx > 0 && idx <= 5) {
        el.classList.add('reveal-delay-' + idx);
      }
      siblingGroups[key].push(el);
    });

    // Only observe elements that got the reveal class
    var revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) {
      return;
    }

    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(function(el) {
      observer.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initScrollReveal);
  } else {
    initScrollReveal();
  }
})();
