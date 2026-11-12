// Dark Mode Toggle for Beautiful Jekyll
// Handles theme switching, persistence, and system preference detection

const DarkMode = {
  // Storage key for theme preference
  STORAGE_KEY: 'theme-preference',

  // Theme constants
  LIGHT: 'light',
  DARK: 'dark',

  /**
   * Initialize dark mode functionality
   */
  init: function() {
    // Set initial theme
    const savedTheme = this.getSavedTheme();
    const systemTheme = this.getSystemTheme();
    const initialTheme = savedTheme || systemTheme;

    this.setTheme(initialTheme, false);

    // Set up toggle button event listener
    this.setupToggle();

    // Listen for system theme changes
    this.watchSystemTheme();

    // Update navbar class based on theme (for Beautiful Jekyll compatibility)
    this.updateNavbarClass();
  },

  /**
   * Get saved theme from localStorage
   * @returns {string|null} Saved theme or null
   */
  getSavedTheme: function() {
    try {
      return localStorage.getItem(this.STORAGE_KEY);
    } catch (e) {
      console.warn('localStorage not available:', e);
      return null;
    }
  },

  /**
   * Save theme preference to localStorage
   * @param {string} theme - Theme to save
   */
  saveTheme: function(theme) {
    try {
      localStorage.setItem(this.STORAGE_KEY, theme);
    } catch (e) {
      console.warn('Could not save theme preference:', e);
    }
  },

  /**
   * Get system theme preference
   * @returns {string} System theme (light or dark)
   */
  getSystemTheme: function() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return this.DARK;
    }
    return this.LIGHT;
  },

  /**
   * Set theme on document
   * @param {string} theme - Theme to set
   * @param {boolean} save - Whether to save preference (default: true)
   */
  setTheme: function(theme, save = true) {
    // Update document attribute
    document.documentElement.setAttribute('data-theme', theme);

    // Update body attribute for compatibility
    document.body.setAttribute('data-theme', theme);

    // Save preference if requested
    if (save) {
      this.saveTheme(theme);
    }

    // Update toggle button icon
    this.updateToggleIcon(theme);

    // Update navbar class
    this.updateNavbarClass();

    // Dispatch custom event for other scripts
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
  },

  /**
   * Toggle between light and dark themes
   */
  toggleTheme: function() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;
    const newTheme = currentTheme === this.LIGHT ? this.DARK : this.LIGHT;
    this.setTheme(newTheme);
  },

  /**
   * Set up toggle button event listener
   */
  setupToggle: function() {
    const toggleBtn = document.getElementById('darkmode-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });

      // Add keyboard support
      toggleBtn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleTheme();
        }
      });
    }
  },

  /**
   * Update toggle button icon based on current theme
   * @param {string} theme - Current theme
   */
  updateToggleIcon: function(theme) {
    const moonIcon = document.getElementById('darkmode-icon-moon');
    const sunIcon = document.getElementById('darkmode-icon-sun');

    if (moonIcon && sunIcon) {
      if (theme === this.DARK) {
        moonIcon.style.display = 'none';
        sunIcon.style.display = 'inline-block';
      } else {
        moonIcon.style.display = 'inline-block';
        sunIcon.style.display = 'none';
      }
    }
  },

  /**
   * Watch for system theme changes
   */
  watchSystemTheme: function() {
    if (window.matchMedia) {
      const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');

      // Modern browsers
      if (darkModeQuery.addEventListener) {
        darkModeQuery.addEventListener('change', (e) => {
          // Only change if user hasn't set a preference
          if (!this.getSavedTheme()) {
            const newTheme = e.matches ? this.DARK : this.LIGHT;
            this.setTheme(newTheme, false);
          }
        });
      }
      // Legacy browsers
      else if (darkModeQuery.addListener) {
        darkModeQuery.addListener((e) => {
          if (!this.getSavedTheme()) {
            const newTheme = e.matches ? this.DARK : this.LIGHT;
            this.setTheme(newTheme, false);
          }
        });
      }
    }
  },

  /**
   * Update navbar class for Beautiful Jekyll compatibility
   * Ensures navbar styling is correct for current theme
   */
  updateNavbarClass: function() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    const currentTheme = document.documentElement.getAttribute('data-theme') || this.LIGHT;

    if (currentTheme === this.DARK) {
      navbar.classList.remove('navbar-light');
      navbar.classList.add('navbar-dark');
    } else {
      navbar.classList.remove('navbar-dark');
      navbar.classList.add('navbar-light');
    }
  },

  /**
   * Get current theme
   * @returns {string} Current theme
   */
  getCurrentTheme: function() {
    return document.documentElement.getAttribute('data-theme') || this.LIGHT;
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => DarkMode.init());
} else {
  DarkMode.init();
}

// Export for potential use in other scripts
window.DarkMode = DarkMode;
