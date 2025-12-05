# Personal Website Requirements

## Overview
This is a personal website for Praveen K Palaniswamy, built using Jekyll static site generator with the Beautiful Jekyll theme. The website serves as a professional portfolio and personal brand, showcasing achievements, providing contact information, and enabling appointment scheduling.

## Website Information
- **Domain**: www.yourspraveen.com
- **Repository**: yourspraveen.github.io
- **Theme**: Beautiful Jekyll v6.0.1
- **Static Site Generator**: Jekyll 3.9.3+
- **Hosting**: GitHub Pages

## Core Features

### 1. Navigation Structure
The website includes the following main pages accessible through the navigation bar:

#### Home Page (index.html)
- Landing page displaying LinkedIn profile posts
- Integrated SociableKit LinkedIn widget
- Shows recent professional activity and updates

#### About Me Page (aboutme.html)
- Professional profile section with:
  - Current position: Senior Manager at Capital One Financial Corporation
  - Educational background (MS in Computer Science from Illinois Institute of Technology, BE from Anna University)
  - Personal interests (travel, culinary experiences)
  - Link to legacy blog (blog.yourspraveen.com)
- Contact form section with:
  - Email link
  - Formspree-powered contact form
  - Fields: Email, Name, Message
  - Note indicating personal contact form

#### Appointments Page (appointments.html)
- Koalendar inline booking widget integration
- Allows visitors to schedule meetings/appointments
- URL: https://koalendar.com/e/meet-with-praveen-palaniswamy

#### Recognitions Page (achievements.md)
- Displays GitHub achievements and badges
- Current achievements:
  - Arctic Code Vault Contributor
  - Pull Shark
- Links to GitHub achievements tab

#### Resources Section
- External links to:
  - Beautiful Jekyll documentation
  - Markdown tutorial

### 2. Social Media Integration

#### Active Social Links (Footer)
- Email: Praveen.Palaniswamy@gmail.com
- GitHub: yourspraveen
- LinkedIn: praveenpalaniswamy
- Instagram: yourspraveen
- ORCID: 0009-0007-2933-3545

#### Social Sharing
- LinkedIn sharing enabled on posts
- Twitter, Facebook, Reddit, VK sharing available but disabled

### 3. Analytics & Tracking
- Cloudflare Analytics enabled (beacon token: f4fc10f5948041a3a023f32d43ad0e4e)
- Support for:
  - Google Analytics (gtag)
  - Google Tag Manager
  - Matomo/Piwik
  - Google Universal Analytics (deprecated)

### 4. Comment Systems Support
The theme supports multiple comment systems (currently not activated):
- Disqus
- Facebook Comments
- CommentBox
- Utterances (GitHub-based)
- Staticman
- Giscus

### 5. Design & Styling

#### Color Scheme
- Page background: #FFFFFF (white)
- Text color: #404040 (dark gray)
- Link color: #008AFF (blue)
- Hover color: #0085A1 (teal)
- Navbar background: #EAEAEA (light gray)
- Footer background: #EAEAEA (light gray)

#### Visual Elements
- Avatar/Profile image: /assets/img/avatar-icon.jpeg (circular)
- Navbar background image: /assets/img/bgimage.png
- Footer background image: /assets/img/bgimage.png
- Custom 404 page with South Park image

#### Custom CSS Files
- beautifuljekyll.css (main theme styles)
- beautifuljekyll-minimal.css (minimal layout styles)
- bootstrap-social.css (social media button styles)
- pygment_highlights.css (code syntax highlighting)
- staticman.css (comment system styles)
- aboutme.css (About Me page custom styles)
- appointments.css (Appointments page custom styles)
- achievement.css (Achievements page custom styles)

### 6. Blog Functionality

#### Blog Capabilities
- Support for blog posts in `_posts` directory
- Post pagination (5 posts per page)
- Tag categorization system
- Dedicated tags page (tags.html)
- RSS feed generation (feed.xml)
- Excerpt display on feed page (50 words)
- Read time estimation support
- Search functionality enabled

#### Markdown Features
- GitHub Flavored Markdown (GFM) support
- Syntax highlighting with Rouge
- MathJax support for LaTeX formulas
- Kramdown parser

### 7. SEO & Meta
- Site title: "Home"
- Author: Praveen K Palaniswamy
- RSS description: "This website is a virtual proof that I'm awesome"
- Sitemap generation
- Title on all pages enabled
- Custom 404 error page

### 8. Third-Party Integrations

#### Koalendar
- Purpose: Appointment scheduling
- Integration: Inline widget
- Location: appointments.html

#### SociableKit
- Purpose: Display LinkedIn posts
- Widget ID: 25545218
- Location: index.html (home page)

#### Formspree
- Purpose: Contact form processing
- Form ID: mnnpwaoy
- Location: aboutme.html contact section
- Features: Spam protection (_gotcha field), custom success message

### 9. Responsive Design
- Mobile-first approach
- Bootstrap-based responsive grid
- Optimized for both desktop and mobile devices
- Navigation bar shrinks on scroll

### 10. Development & Build

#### Dependencies
- jekyll (>= 3.9.3)
- jekyll-paginate (~> 1.1)
- jekyll-sitemap (~> 1.4)
- kramdown (~> 2.3)
- kramdown-parser-gfm (~> 1.1)
- webrick (~> 1.8)

#### Configuration
- Timezone: America/New_York
- Permalink structure: /:year-:month-:day-:title/
- Default layout: page

## Technical Requirements

### Browser Support
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement approach

### Performance
- Static site generation for fast loading
- Optimized CSS and JavaScript
- Image optimization
- Cloudflare Analytics for lightweight tracking

### Security
- HTTPS (via GitHub Pages)
- Spam protection on contact forms
- No server-side code execution

## Content Management

### Adding New Content
1. Blog posts: Create markdown files in `_posts` directory with format `YYYY-MM-DD-title.md`
2. Pages: Create markdown or HTML files in root directory
3. Images: Store in `/assets/img/` directory
4. Custom CSS: Add to `/assets/css/` directory
5. Custom JavaScript: Add to `/assets/js/` directory

### YAML Front Matter
All pages require YAML front matter with available parameters:
- title, subtitle, tags
- cover-img, thumbnail-img
- comments, mathjax, readtime
- share-title, share-description, share-img
- author, layout, and more

## Future Enhancement Possibilities

### Potential Features to Consider
1. Blog posts - Currently no posts are published
2. Dark mode support (available in Beautiful Jekyll paid plans)
3. Newsletter subscription
4. Portfolio/Projects section
5. Testimonials section
6. Resume/CV download
7. Photography/Gallery section
8. Speaking engagements page
9. Publications/Papers section
10. Certifications showcase

### Integration Opportunities
1. Google Analytics for detailed visitor tracking
2. Comment system activation for blog posts
3. Newsletter platform (Mailchimp, ConvertKit)
4. GitHub Projects showcase
5. Medium cross-posting
6. Twitter feed integration
7. YouTube video embeds
8. Podcast hosting

## Maintenance Requirements

### Regular Updates
- Theme updates (Beautiful Jekyll)
- Jekyll version updates
- Security patches for dependencies
- Content updates (achievements, profile information)
- LinkedIn widget data refresh

### Monitoring
- Cloudflare Analytics dashboard
- Form submission monitoring (Formspree)
- Appointment bookings (Koalendar)
- Broken link checks
- Mobile responsiveness testing

## Deployment

### GitHub Pages
- Automatic deployment on push to master branch
- Custom domain configured (CNAME file)
- SSL/TLS certificate provided by GitHub

### Build Process
- Jekyll builds site on push
- No custom CI/CD required
- Uses GitHub Actions for workflow automation

## Compliance & Legal
- Privacy considerations for analytics
- Contact form data handling
- Third-party service terms compliance
- MIT License from Beautiful Jekyll theme
