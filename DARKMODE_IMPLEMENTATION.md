# Dark Mode Implementation Guide

## Overview
Dark mode has been successfully implemented on your personal website! This document provides details about the implementation and how to use, test, and customize it.

## What Was Implemented

### New Files Created (4 files)
1. **`/assets/css/darkmode.css`** - Dark mode color scheme and styling
2. **`/assets/js/darkmode.js`** - Toggle functionality and persistence logic
3. **`/_includes/darkmode-toggle.html`** - Toggle button component
4. **`DARKMODE_IMPLEMENTATION.md`** - This documentation file

### Modified Files (5 files)
1. **`/_layouts/base.html`** - Added darkmode.css and darkmode.js to common assets
2. **`/_includes/head.html`** - Added theme initialization script to prevent flash
3. **`/_includes/nav.html`** - Added dark mode toggle button to navigation
4. **`/assets/css/achievement.css`** - Updated to use CSS variables for dark mode compatibility
5. **`/_config.yml`** - Added documentation for dark mode colors

## Features Implemented

### 1. Toggle Button
- **Location**: Navigation bar, right after the search button
- **Icons**: Moon icon (🌙) for light mode, Sun icon (☀️) for dark mode
- **Accessibility**:
  - Keyboard accessible (Enter or Space to toggle)
  - ARIA labels for screen readers
  - Focus states visible
  - Smooth animations

### 2. Color Scheme

**Light Mode Enhancements:**
- Navbar/Footer backgrounds: 15% brighter, reduced contrast, slight desaturation
- Box shadows for depth (softer than dark mode)
- Stronger 2px borders for definition
- Font weight 500 for better readability
- Subtle white text shadows for clarity
- Background patterns lightened and softened

**Dark Mode Colors:**
- Background: `#1a1a1a` (dark gray)
- Text: `#e0e0e0` (light gray)
- Links: `#64b5f6` (lighter blue)
- Hover: `#90caf9` (even lighter blue)
- Navbar/Footer: `#1f1f1f` (slightly lighter than background for contrast)
- Navbar/Footer Text: `#ffffff` (pure white for maximum visibility)
- Footer Text: `#d0d0d0` (bright light gray)
- Borders: `#505050` (medium-light gray for better separation)

**Visual Enhancements (Both Modes):**
- Box shadows on navbar and footer for depth
- Stronger borders (2px) for clear separation
- Font weight increased (500) for better readability
- Text shadows for improved contrast and readability
- Avatar gets enhanced border in dark mode
- **Background images automatically adjusted** using CSS filters:
  - **Light Mode**: Navbar/Footer backgrounds brightened by 15%, reduced contrast, desaturated
  - **Dark Mode**: Navbar/Footer backgrounds darkened by 70%, increased contrast, desaturated
  - Page background image: 75% darker in dark mode, if present
  - Header cover images: 50% dark overlay with enhanced text shadows

**Transitions:** All color changes animate smoothly over 0.3 seconds

### 3. Persistence
- User preference saved to `localStorage`
- Preference persists across sessions
- Works across all pages

### 4. System Preference Detection
- Automatically detects system dark mode preference
- Respects user's OS-level setting on first visit
- Updates automatically if system preference changes

### 5. No Flash of Unstyled Content (FOUC)
- Theme loads before page renders
- Inline script in `<head>` applies theme immediately
- Prevents jarring switch between light and dark

### 6. Comprehensive Coverage
**Styled Elements:**
- All text content
- Navigation bar and dropdown menus
- Footer
- Forms and input fields
- Buttons
- Code blocks
- Tables
- Achievement cards
- Pagination
- Search overlay
- Cards and panels
- Blockquotes and horizontal rules

**Third-Party Widgets:**
- Koalendar appointment widget (container styled)
- SociableKit LinkedIn widget (subtle filter applied)
- Formspree contact form (full dark mode support)

## How to Use

### For Visitors
1. Look for the moon/sun icon in the navigation bar
2. Click/tap to toggle between light and dark modes
3. Your preference will be saved automatically

### Testing Locally

#### 1. Start Local Server
```bash
cd /Users/praveenp/Github/yourspraveen.github.io
bundle exec jekyll serve
```

#### 2. Open in Browser
Navigate to: `http://localhost:4000`

#### 3. Test the Toggle
- Click the moon/sun icon in the navbar
- Verify smooth transition between modes
- Check that preference persists after page reload

#### 4. Test System Preference
**On macOS:**
- Go to System Preferences → General → Appearance
- Switch between Light and Dark
- Clear localStorage: Open DevTools → Application → Local Storage → Delete `theme-preference`
- Reload page to see it respect system preference

**On Windows:**
- Go to Settings → Personalization → Colors
- Switch between Light and Dark

### Deploying to GitHub Pages

#### Option 1: Git Commands
```bash
cd /Users/praveenp/Github/yourspraveen.github.io
git add .
git commit -m "Add dark mode support with toggle button

- Implement CSS-based dark mode with smooth transitions
- Add toggle button in navigation bar
- Support localStorage persistence and system preference detection
- Update all pages and components for dark mode compatibility
- Add comprehensive styling for third-party widgets"
git push origin master
```

#### Option 2: Review Changes First
```bash
git status                    # See what changed
git diff                      # Review changes
git add .                     # Stage changes
git commit -m "Add dark mode support"
git push origin master        # Deploy
```

**Note:** GitHub Pages will rebuild your site in 1-2 minutes after pushing.

## Testing Checklist

After deploying, test the following:

### Basic Functionality
- [ ] Toggle button visible in navbar
- [ ] Moon icon shows in light mode
- [ ] Sun icon shows in dark mode
- [ ] Clicking toggle switches modes
- [ ] Smooth 0.3s transition animation
- [ ] No page jump or layout shift

### Persistence
- [ ] Preference saves after toggle
- [ ] Preference persists after page reload
- [ ] Preference persists across different pages
- [ ] Clear localStorage and verify system preference detection

### Visual Checks
- [ ] All text is readable in both modes
- [ ] Links are visible and distinguishable
- [ ] Navbar and footer styled correctly
- [ ] Forms and inputs usable in dark mode
- [ ] Code blocks have good contrast
- [ ] Achievement cards look good
- [ ] Tables are readable

### Page-Specific Tests
- [ ] **Home page (index.html)** - LinkedIn widget acceptable
- [ ] **About Me (aboutme.html)** - Profile text and contact form work
- [ ] **Appointments (appointments.html)** - Koalendar widget container styled
- [ ] **Achievements (achievements.md)** - Cards styled with dark theme
- [ ] **404 page** - Error page displays correctly
- [ ] **Tags page** - Tag buttons work in dark mode

### Mobile Testing
- [ ] Toggle button accessible on mobile
- [ ] Collapsed navbar shows toggle button
- [ ] Touch interaction works
- [ ] Layout responsive in both modes

### Browser Compatibility
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

### Accessibility
- [ ] Toggle button keyboard accessible (Tab, Enter, Space)
- [ ] Focus state visible
- [ ] Screen reader announces toggle properly
- [ ] Color contrast meets WCAG standards

## How Background Image Filtering Works

The implementation uses CSS `::before` pseudo-elements with filters to adjust background images in both light and dark modes without modifying the actual images. This technique:

### Technical Approach
1. **Pseudo-element overlay**: Creates a `::before` element that inherits the background
2. **CSS Filters**: Applies brightness, contrast, and saturation filters to adjust the image
3. **Z-index layering**: Positions content above the filtered background
4. **Non-destructive**: Original images remain unchanged; only the display is affected
5. **Mode-specific**: Different filter values for light and dark modes

### Filter Values Explained

**Light Mode** (`brightness(1.15) contrast(0.95) saturate(0.9)`):
- **`brightness(1.15)`**: Increases brightness by 15% for a lighter, airier feel
- **`contrast(0.95)`**: Slightly reduces contrast by 5% for softer appearance
- **`saturate(0.9)`**: Reduces saturation by 10% for subtle, refined look

**Dark Mode** (`brightness(0.3) contrast(1.2) grayscale(0.4)`):
- **`brightness(0.3)`**: Reduces brightness to 30% (makes it 70% darker)
- **`contrast(1.2)`**: Increases contrast by 20% to maintain definition
- **`grayscale(0.4)`**: Adds 40% desaturation for a subtler appearance

### Benefits
- ✅ No need to create separate light/dark versions of images
- ✅ Automatic adaptation of all background images
- ✅ Easy to adjust with CSS only
- ✅ Smooth transitions between light and dark modes
- ✅ Works with any background image
- ✅ Consistent professional appearance in both modes

### What Gets Filtered
1. **Navbar background** (`navbar-img` in `_config.yml`) - lightened in light mode, darkened in dark mode
2. **Footer background** (`footer-img` in `_config.yml`) - lightened in light mode, darkened in dark mode
3. **Page background** (`page-img` in `_config.yml`, if set) - darkened in dark mode only
4. **Post/page header images** (`cover-img` in page front matter) - dark overlay in dark mode

## Customization

### Changing Dark Mode Colors

Edit `/assets/css/darkmode.css` and modify the `[data-theme="dark"]` section:

```css
[data-theme="dark"] {
  --page-col: #1a1a1a;        /* Background color */
  --text-col: #e0e0e0;        /* Text color */
  --link-col: #64b5f6;        /* Link color */
  --hover-col: #90caf9;       /* Hover color */
  --navbar-col: #2d2d2d;      /* Navbar background */
  /* ... modify as needed ... */
}
```

### Changing Toggle Button Position

The toggle is currently in `/_includes/nav.html` after the search button. To move it:

1. Open `/_includes/nav.html`
2. Find the line: `{% include darkmode-toggle.html %}`
3. Move it to desired position within the `<ul class="navbar-nav ml-auto">` element

### Changing Toggle Button Style

Edit the `<style>` section in `/_includes/darkmode-toggle.html`:

```css
.darkmode-toggle-btn {
  font-size: 1.125rem;    /* Icon size */
  padding: 0.5rem 1rem;   /* Button padding */
  /* ... customize as needed ... */
}
```

### Making Dark Mode Default

Edit `/assets/js/darkmode.js`, find the `getSystemTheme` function and change:

```javascript
getSystemTheme: function() {
  return this.DARK;  // Always default to dark
},
```

Or edit the inline script in `/_includes/head.html`.

### Disabling System Preference Detection

Edit `/assets/js/darkmode.js` and modify the `init` function:

```javascript
init: function() {
  const savedTheme = this.getSavedTheme();
  const initialTheme = savedTheme || this.LIGHT;  // Always default to light if no saved preference
  // ... rest of the code ...
}
```

## Troubleshooting

### Issue: Toggle button not visible
**Solution:** Check that nav.html includes the darkmode-toggle.html component. Clear browser cache.

### Issue: Theme doesn't persist
**Solution:** Check browser localStorage is enabled. Check console for errors.

### Issue: Flash of light theme on dark mode
**Solution:** Ensure the inline script in head.html is before all CSS. Clear cache.

### Issue: Some elements not styled
**Solution:** Add specific selectors to darkmode.css with `[data-theme="dark"]` prefix.

### Issue: Third-party widgets look wrong
**Solution:** Add custom CSS overrides in darkmode.css or apply CSS filters.

### Issue: Images too bright in dark mode
**Solution:** Adjust opacity in darkmode.css:
```css
[data-theme="dark"] img:not(.avatar-img) {
  opacity: 0.8;  /* Reduce from 0.9 */
}
```

### Issue: Background images too dark/light
**Solution:** Adjust filter values in darkmode.css.

For light mode navbar/footer (make brighter/dimmer):
```css
.navbar-custom::before,
footer::before {
  filter: brightness(1.2) contrast(0.95) saturate(0.9);  /* Increase brightness 1.1-1.3 */
}
```

For dark mode navbar/footer (make lighter/darker):
```css
[data-theme="dark"] .navbar-custom::before,
[data-theme="dark"] footer::before {
  filter: brightness(0.4) contrast(1.2) grayscale(0.4);  /* Adjust brightness 0.1-0.5 */
}
```

For page background:
```css
[data-theme="dark"] body::before {
  filter: brightness(0.35) contrast(1.1) grayscale(0.5);  /* Adjust as needed */
}
```

## Browser Console Commands

Useful for debugging in DevTools console:

```javascript
// Get current theme
DarkMode.getCurrentTheme()

// Manually set theme
DarkMode.setTheme('dark')
DarkMode.setTheme('light')

// Toggle theme
DarkMode.toggleTheme()

// Clear saved preference
localStorage.removeItem('theme-preference')

// Check system preference
window.matchMedia('(prefers-color-scheme: dark)').matches
```

## File Structure

```
/
├── assets/
│   ├── css/
│   │   ├── darkmode.css           # Dark mode styles (NEW)
│   │   └── achievement.css        # Updated with CSS variables
│   └── js/
│       └── darkmode.js            # Toggle logic (NEW)
├── _includes/
│   ├── darkmode-toggle.html       # Toggle button (NEW)
│   ├── head.html                  # Updated with inline script
│   └── nav.html                   # Updated with toggle include
├── _layouts/
│   └── base.html                  # Updated with dark mode assets
├── _config.yml                    # Updated with dark mode docs
└── DARKMODE_IMPLEMENTATION.md     # This file (NEW)
```

## Performance Impact

- **CSS Added:** ~8 KB (darkmode.css)
- **JavaScript Added:** ~4 KB (darkmode.js)
- **Total Impact:** ~12 KB additional load
- **Render Impact:** Negligible (CSS variables are fast)
- **FOUC Prevention:** Inline script adds ~0.3 KB to HTML

## Future Enhancements

Potential improvements for later:

1. **Auto-scheduling:** Switch modes based on time of day
2. **Custom themes:** Allow users to create their own color schemes
3. **Per-page preference:** Different themes for different pages
4. **Animated transitions:** More elaborate mode switching animations
5. **High contrast mode:** Additional accessibility theme
6. **Image variants:** Load different images for dark mode
7. **Chart/graph theming:** If you add data visualizations

## Support

If you encounter issues:

1. Check the browser console for JavaScript errors
2. Verify all files were created/modified correctly
3. Clear browser cache and localStorage
4. Test in incognito/private mode
5. Check that Jekyll rebuilt the site properly

## Credits

- **Implementation:** Claude Code (Anthropic)
- **Base Theme:** Beautiful Jekyll by Dean Attali
- **Icons:** Font Awesome 6.5.2
- **Inspiration:** Modern dark mode best practices

## License

This dark mode implementation follows the same license as the Beautiful Jekyll theme (MIT License).

---

**Implemented:** December 2025
**Version:** 1.0
**Status:** Production Ready ✅
