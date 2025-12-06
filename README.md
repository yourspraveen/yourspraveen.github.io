# Personal Website - Praveen K Palaniswamy

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.yourspraveen.com)](https://www.yourspraveen.com)
[![GitHub](https://img.shields.io/badge/GitHub-yourspraveen-blue)](https://github.com/yourspraveen)

This is the repository for my personal website, hosted at [www.yourspraveen.com](https://www.yourspraveen.com).

## About This Website

This website serves as my professional portfolio and personal brand, showcasing my work, achievements, and providing ways to connect with me. It's built using Jekyll static site generator with the Beautiful Jekyll theme and hosted on GitHub Pages.

### Key Features

- **🌓 Dark Mode**: Full dark/light theme toggle with system preference detection and localStorage persistence
- **Professional Profile**: Information about my role as Senior Manager at Capital One Financial Corporation and educational background
- **Appointment Scheduling**: Integrated Koalendar widget for easy meeting booking
- **Contact Form**: Direct contact through Formspree-powered form
- **LinkedIn Integration**: Display of recent LinkedIn posts via SociableKit widget
- **GitHub Achievements**: Showcase of contributions and recognitions
- **Modern Footer**: 3-column layout with social icons, optimized spacing
- **Enhanced Design**: Consistent box styling, filtered backgrounds, professional appearance
- **Responsive Design**: Mobile-friendly and optimized for all devices
- **Analytics**: Cloudflare Analytics for visitor tracking

## Website Structure

```
/
├── index.html              # Home page with LinkedIn posts widget
├── aboutme.html            # Professional profile and contact form
├── appointments.html       # Appointment scheduling page
├── achievements.md         # GitHub achievements and recognitions
├── tags.html              # Blog post tags index
├── _config.yml            # Jekyll configuration
├── _layouts/              # Page templates
├── _includes/             # Reusable components
├── assets/                # CSS, JavaScript, and images
└── requirements.md        # Detailed feature documentation
```

## Technology Stack

- **Static Site Generator**: Jekyll 3.9.3+
- **Theme**: [Beautiful Jekyll](https://beautifuljekyll.com) v6.0.1 (heavily customized)
- **Hosting**: GitHub Pages
- **Domain**: Custom domain via CNAME
- **Analytics**: Cloudflare Analytics
- **Theme System**: Custom dual-mode (light/dark) implementation

### Dependencies

- Jekyll (>= 3.9.3)
- Jekyll Paginate (~> 1.1)
- Jekyll Sitemap (~> 1.4)
- Kramdown (~> 2.3)
- Kramdown Parser GFM (~> 1.1)
- Webrick (~> 1.8)

## Third-Party Integrations

- **[Koalendar](https://koalendar.com)**: Appointment scheduling
- **[SociableKit](https://sociablekit.com)**: LinkedIn posts widget
- **[Formspree](https://formspree.io)**: Contact form processing
- **[Cloudflare Analytics](https://www.cloudflare.com/web-analytics/)**: Privacy-friendly analytics

## Local Development

### Prerequisites

- Ruby 2.7+ (recommended: use rbenv or rvm)
- Bundler gem
- Git

### Setup Instructions

1. Clone the repository:
```bash
git clone https://github.com/yourspraveen/yourspraveen.github.io.git
cd yourspraveen.github.io
```

2. Install dependencies:
```bash
bundle install
```

3. Run the local development server:
```bash
bundle exec jekyll serve
```

4. Open your browser and navigate to:
```
http://localhost:4000
```

### Live Reload

For automatic reloading during development:
```bash
bundle exec jekyll serve --livereload
```

## Content Management

### Adding Blog Posts

Create a new markdown file in the `_posts` directory:

```bash
_posts/YYYY-MM-DD-your-post-title.md
```

Add YAML front matter at the top:
```yaml
---
layout: post
title: "Your Post Title"
subtitle: "Optional subtitle"
tags: [tag1, tag2]
---

Your content here...
```

### Adding Pages

Create a new HTML or markdown file in the root directory with YAML front matter:

```yaml
---
layout: page
title: "Page Title"
subtitle: "Optional subtitle"
---

Your content here...
```

### Updating Profile Information

Edit `aboutme.html` to update:
- Professional information
- Educational background
- Personal interests
- Contact details

### Managing Social Links

Update social network links in `_config.yml`:
```yaml
social-network-links:
  email: "your.email@gmail.com"
  github: yourusername
  linkedin: yourprofile
  instagram: yourusername
```

## Customization

### Dark Mode

Toggle dark mode using the moon/sun icon in the navigation bar. Your preference is automatically saved.

To customize dark mode colors, edit `/assets/css/darkmode.css`:
```css
[data-theme="dark"] {
  --page-col: #1a1a1a;
  --text-col: #e0e0e0;
  --link-col: #64b5f6;
  /* ... */
}
```

See [DARKMODE_IMPLEMENTATION.md](DARKMODE_IMPLEMENTATION.md) for detailed customization options.

### Colors and Styling

Modify light mode color scheme in `_config.yml`:
```yaml
# Light mode colors
page-col: "#FFFFFF"
text-col: "#404040"
link-col: "#008AFF"
hover-col: "#0085A1"
```

### Background Image Filtering

Both light and dark modes automatically filter background images. Adjust in `/assets/css/darkmode.css`:

**Light mode** (brighten):
```css
.navbar-custom::before,
footer::before {
  filter: brightness(1.15) contrast(0.95) saturate(0.9);
}
```

**Dark mode** (darken):
```css
[data-theme="dark"] .navbar-custom::before,
[data-theme="dark"] footer::before {
  filter: brightness(0.3) contrast(1.2) grayscale(0.4);
}
```

### Navigation Menu

Update navigation links in `_config.yml`:
```yaml
navbar-links:
  Page Name: "pagename"
```

### Footer Configuration

The footer uses a 3-column layout. To show/hide the theme credit:
```yaml
remove-ads: true  # Hide "Powered by Beautiful Jekyll"
remove-ads: false # Show theme credit
```

### Custom CSS

Add custom styles to `/assets/css/` and reference them in page front matter:
```yaml
css: "/assets/css/custom-styles.css"
```

## Deployment

The website automatically deploys to GitHub Pages when changes are pushed to the `master` branch.

### Manual Deployment Steps

1. Make changes to your content
2. Commit changes:
```bash
git add .
git commit -m "Description of changes"
```
3. Push to GitHub:
```bash
git push origin master
```
4. GitHub Pages will automatically build and deploy (usually within 1-2 minutes)

## Documentation

- **[requirements.md](requirements.md)** - Comprehensive feature documentation and specifications
- **[DARKMODE_IMPLEMENTATION.md](DARKMODE_IMPLEMENTATION.md)** - Dark mode implementation guide and customization
- **[Beautiful Jekyll Documentation](https://beautifuljekyll.com)** - Base theme documentation

## Project Status

### Current Features
- ✅ **Dark mode with toggle** (system preference detection, localStorage)
- ✅ **Enhanced light mode** (improved contrast, filtered backgrounds)
- ✅ Professional profile page with box styling
- ✅ Appointment scheduling (Koalendar integration)
- ✅ Contact form (Formspree integration)
- ✅ LinkedIn posts integration (SociableKit)
- ✅ GitHub achievements showcase
- ✅ **Modern 3-column footer** (ultra-slim design)
- ✅ **Background image filtering** (automatic light/dark adaptation)
- ✅ Responsive design (mobile-optimized)
- ✅ Analytics tracking (Cloudflare)
- ✅ Custom domain (www.yourspraveen.com)
- ✅ Accessibility features (keyboard navigation, ARIA labels)

### Recent Improvements (December 2025)
- ✅ Complete dark mode implementation
- ✅ Footer redesign with 3-column layout
- ✅ Background image filtering system
- ✅ Consistent section box styling
- ✅ Enhanced typography and shadows
- ✅ Optimized spacing and dimensions
- ✅ Smooth theme transitions

### Potential Enhancements
- ⏳ Blog posts (infrastructure ready, no posts yet)
- ⏳ Portfolio/Projects section
- ⏳ Resume/CV download
- ⏳ Newsletter subscription

## Browser Support

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)
- ✅ Dark mode support in all modern browsers
- ✅ System preference detection (prefers-color-scheme)

## License

This website uses the [Beautiful Jekyll theme](https://github.com/daattali/beautiful-jekyll) which is licensed under the MIT License.

### Beautiful Jekyll License

Beautiful Jekyll is created by [Dean Attali](https://deanattali.com) and is licensed under the MIT License. See the [Beautiful Jekyll repository](https://github.com/daattali/beautiful-jekyll) for more details.

## Contact

- **Website**: [www.yourspraveen.com](https://www.yourspraveen.com)
- **Email**: praveen.palaniswamy@gmail.com
- **LinkedIn**: [praveenpalaniswamy](https://linkedin.com/in/praveenpalaniswamy)
- **GitHub**: [yourspraveen](https://github.com/yourspraveen)

## Key Files

### Core Configuration
- `_config.yml` - Main Jekyll configuration (colors, social links, site settings)
- `CNAME` - Custom domain configuration

### Layouts & Templates
- `_layouts/` - Page templates (base, page, post, home)
- `_includes/` - Reusable components (header, footer, nav, dark mode toggle)

### Styling
- `assets/css/darkmode.css` - Dark mode and light mode enhancements
- `assets/css/beautifuljekyll.css` - Base theme styles
- `assets/css/aboutme.css` - About Me page styles
- `assets/css/appointments.css` - Appointments page styles
- `assets/css/achievement.css` - Achievements page styles

### JavaScript
- `assets/js/darkmode.js` - Dark mode toggle and persistence logic
- `assets/js/beautifuljekyll.js` - Base theme functionality

### Content Pages
- `index.html` - Home page with LinkedIn widget
- `aboutme.html` - Profile and contact form
- `appointments.html` - Appointment scheduling
- `achievements.md` - GitHub achievements

### Documentation
- `README.md` - This file
- `requirements.md` - Detailed feature specifications
- `DARKMODE_IMPLEMENTATION.md` - Dark mode guide

## Acknowledgments

- [Beautiful Jekyll](https://beautifuljekyll.com) by Dean Attali for the excellent base theme
- [Jekyll](https://jekyllrb.com) for the static site generator
- [GitHub Pages](https://pages.github.com) for free hosting
- [Koalendar](https://koalendar.com) for appointment scheduling
- [SociableKit](https://sociablekit.com) for LinkedIn integration
- [Formspree](https://formspree.io) for contact form processing
- [Font Awesome](https://fontawesome.com) for icons
- [Bootstrap](https://getbootstrap.com) for responsive grid system

---

**Last Updated**: December 2025
**Version**: 2.0 (with Dark Mode)
