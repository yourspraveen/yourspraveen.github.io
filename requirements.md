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

### 1. Dark Mode System
**Comprehensive Theme Switching:**
- Toggle button in navigation bar with moon/sun icons
- Instant theme switching with smooth transitions
- localStorage persistence across sessions and pages
- Automatic system preference detection (prefers-color-scheme)
- No flash of unstyled content (FOUC prevention)
- Keyboard accessible (Tab, Enter, Space)
- ARIA labels for screen readers

**Enhanced Styling:**
- All UI elements adapted for both modes
- Consistent box shadows and borders in both themes
- Text shadows for improved readability
- Enhanced contrast ratios meeting WCAG standards
- Smooth 0.3s color transitions

### 2. Navigation Structure
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

### 3. Footer Design
**Modern 3-Column Layout:**
- **Left Column**: Theme credit ("Powered by Beautiful Jekyll" - hidden when remove-ads: true)
- **Center Column**: Copyright information and author details
- **Right Column**: Social media icons in horizontal layout
- Ultra-slim design with optimized spacing
- Responsive design (stacks on mobile)
- Enhanced with box shadows and borders
- Filtered background images matching theme

**Dimensions:**
- Height: ~32px (60-70% reduction from original)
- Padding: 0.5rem top/bottom
- Compact line heights for efficiency

### 4. Social Media Integration

#### Active Social Links (Footer - Right Column)
- Email: Praveen.Palaniswamy@gmail.com
- GitHub: yourspraveen
- LinkedIn: praveenpalaniswamy
- Instagram: yourspraveen
- ORCID: 0009-0007-2933-3545

#### Social Sharing
- LinkedIn sharing enabled on posts
- Twitter, Facebook, Reddit, VK sharing available but disabled

### 5. Page Sections Design
**Consistent Box Layout:**
All content sections (About Me, Contact, Appointments, Achievements) feature:
- Rounded border boxes (8px radius)
- Semi-transparent backgrounds
- Consistent padding (1.5rem)
- Box shadows for depth
- Proper alignment within page layout
- Theme-adaptive colors

**Light Mode Boxes:**
- Background: rgba(255, 255, 255, 0.6)
- Border: #e1e4e8
- Shadow: rgba(0, 0, 0, 0.1)

**Dark Mode Boxes:**
- Background: rgba(45, 45, 45, 0.5)
- Border: #505050 (navbar-border-col)
- Shadow: rgba(0, 0, 0, 0.3)

### 6. Analytics & Tracking
- Cloudflare Analytics enabled (beacon token: f4fc10f5948041a3a023f32d43ad0e4e)
- Support for:
  - Google Analytics (gtag)
  - Google Tag Manager
  - Matomo/Piwik
  - Google Universal Analytics (deprecated)

### 7. Comment Systems Support
The theme supports multiple comment systems (currently not activated):
- Disqus
- Facebook Comments
- CommentBox
- Utterances (GitHub-based)
- Staticman
- Giscus

### 5. Design & Styling

#### Theme System
**Dual Theme Support:**
- Full dark mode implementation with toggle
- Enhanced light mode with improved contrast
- Smooth transitions between themes (0.3s)
- System preference detection on first visit
- localStorage persistence across sessions

#### Light Mode Color Scheme
- Page background: #FFFFFF (white)
- Text color: #404040 (dark gray)
- Link color: #008AFF (blue)
- Hover color: #0085A1 (teal)
- Navbar background: #EAEAEA (light gray) + lightened pattern
- Footer background: #EAEAEA (light gray) + lightened pattern

#### Dark Mode Color Scheme
- Page background: #1a1a1a (dark gray)
- Text color: #e0e0e0 (light gray)
- Link color: #64b5f6 (lighter blue)
- Hover color: #90caf9 (lighter blue)
- Navbar: #1f1f1f with pure white text (#ffffff)
- Footer: #1f1f1f with bright text (#d0d0d0)
- Borders: #505050 (medium-light gray)

#### Visual Elements
- Avatar/Profile image: /assets/img/avatar-icon.jpeg (circular with enhanced border in dark mode)
- Navbar background image: /assets/img/bgimage.png (auto-filtered for both modes)
- Footer background image: /assets/img/bgimage.png (auto-filtered for both modes)
- Custom 404 page with South Park image

#### Background Image Filtering
**Automatic adjustment without modifying source images:**
- **Light Mode**: Backgrounds brightened by 15%, reduced contrast, desaturated
- **Dark Mode**: Backgrounds darkened by 70%, increased contrast, desaturated
- Uses CSS filters with `::before` pseudo-elements
- Non-destructive and easily adjustable

#### Custom CSS Files
- beautifuljekyll.css (main theme styles)
- beautifuljekyll-minimal.css (minimal layout styles)
- **darkmode.css** (dark mode styles and light mode enhancements)
- aboutme.css (About Me page custom styles with box layout)
- appointments.css (Appointments page custom styles with box layout)
- achievement.css (Achievements page custom styles with CSS variables)
- bootstrap-social.css (social media button styles)
- pygment_highlights.css (code syntax highlighting)
- staticman.css (comment system styles)
- aboutme.css (About Me page custom styles)
- appointments.css (Appointments page custom styles)
- achievement.css (Achievements page custom styles)

### 8. Blog Functionality

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

### 9. SEO & Meta
- Site title: "Home"
- Author: Praveen K Palaniswamy
- RSS description: "This website is a virtual proof that I'm awesome"
- Sitemap generation
- Title on all pages enabled
- Custom 404 error page

### 10. Third-Party Integrations

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

### 11. Responsive Design
- Mobile-first approach
- Bootstrap-based responsive grid
- Optimized for both desktop and mobile devices
- Navigation bar shrinks on scroll

### 12. Development & Build

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

## Recently Implemented Features (December 2025)

### Dark Mode System
- ✅ Complete dark mode with toggle button
- ✅ localStorage persistence
- ✅ System preference detection
- ✅ Smooth transitions (0.3s)
- ✅ Background image filtering
- ✅ Comprehensive element coverage
- ✅ Accessibility features (keyboard, ARIA)
- ✅ No FOUC (flash of unstyled content)

### Design Enhancements
- ✅ Enhanced light mode with improved contrast
- ✅ 3-column footer layout
- ✅ Ultra-slim footer design (~70% height reduction)
- ✅ Consistent box styling across all sections
- ✅ Background image filtering for both themes
- ✅ Enhanced typography with text shadows
- ✅ Professional box shadows and borders

### Layout Improvements
- ✅ Proper section alignment across all pages
- ✅ Responsive footer with mobile stacking
- ✅ Inline social media icons
- ✅ Consistent spacing and padding
- ✅ Optimized line heights

## Future Enhancement Possibilities

### Potential Features to Consider
1. Blog posts - Currently no posts are published
2. Newsletter subscription
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
