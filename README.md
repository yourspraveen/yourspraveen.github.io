# Personal Website - Praveen K Palaniswamy

[![Website](https://img.shields.io/website?url=https%3A%2F%2Fwww.yourspraveen.com)](https://www.yourspraveen.com)
[![GitHub](https://img.shields.io/badge/GitHub-yourspraveen-blue)](https://github.com/yourspraveen)

This is the repository for my personal website, hosted at [www.yourspraveen.com](https://www.yourspraveen.com).

## About This Website

This website serves as my professional portfolio and personal brand, showcasing my work, achievements, and providing ways to connect with me. It's built using Jekyll static site generator with the Beautiful Jekyll theme and hosted on GitHub Pages.

### Key Features

- **Professional Profile**: Information about my role as Senior Manager at Capital One Financial Corporation and educational background
- **Appointment Scheduling**: Integrated Koalendar widget for easy meeting booking
- **Contact Form**: Direct contact through Formspree-powered form
- **LinkedIn Integration**: Display of recent LinkedIn posts via SociableKit widget
- **GitHub Achievements**: Showcase of contributions and recognitions
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
- **Theme**: [Beautiful Jekyll](https://beautifuljekyll.com) v6.0.1
- **Hosting**: GitHub Pages
- **Domain**: Custom domain via CNAME
- **Analytics**: Cloudflare Analytics

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

### Colors and Styling

Modify color scheme in `_config.yml`:
```yaml
page-col: "#FFFFFF"
text-col: "#404040"
link-col: "#008AFF"
hover-col: "#0085A1"
```

### Navigation Menu

Update navigation links in `_config.yml`:
```yaml
navbar-links:
  Page Name: "pagename"
  Resources:
    - Link Name: "https://example.com"
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

For detailed feature documentation, see [requirements.md](requirements.md).

For Beautiful Jekyll theme documentation, visit [beautifuljekyll.com](https://beautifuljekyll.com).

## Project Status

### Current Features
- ✅ Professional profile page
- ✅ Appointment scheduling
- ✅ Contact form
- ✅ LinkedIn posts integration
- ✅ GitHub achievements showcase
- ✅ Responsive design
- ✅ Analytics tracking
- ✅ Custom domain

### Potential Enhancements
- ⏳ Blog posts (infrastructure ready, no posts yet)
- ⏳ Portfolio/Projects section
- ⏳ Resume/CV download
- ⏳ Newsletter subscription
- ⏳ Dark mode support

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

This website uses the [Beautiful Jekyll theme](https://github.com/daattali/beautiful-jekyll) which is licensed under the MIT License.

### Beautiful Jekyll License

Beautiful Jekyll is created by [Dean Attali](https://deanattali.com) and is licensed under the MIT License. See the [Beautiful Jekyll repository](https://github.com/daattali/beautiful-jekyll) for more details.

## Contact

- **Website**: [www.yourspraveen.com](https://www.yourspraveen.com)
- **Email**: praveen.palaniswamy@gmail.com
- **LinkedIn**: [praveenpalaniswamy](https://linkedin.com/in/praveenpalaniswamy)
- **GitHub**: [yourspraveen](https://github.com/yourspraveen)

## Acknowledgments

- [Beautiful Jekyll](https://beautifuljekyll.com) by Dean Attali for the excellent theme
- [Jekyll](https://jekyllrb.com) for the static site generator
- [GitHub Pages](https://pages.github.com) for free hosting
- [Koalendar](https://koalendar.com) for appointment scheduling
- [SociableKit](https://sociablekit.com) for LinkedIn integration
- [Formspree](https://formspree.io) for contact form processing

---

**Last Updated**: December 2025
