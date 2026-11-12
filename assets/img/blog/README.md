# Blog Images Directory

This directory contains all images used in blog posts, organized by date to match the post structure.

## Folder Organization

Images are organized in a date-based folder hierarchy:

```
assets/img/blog/
└── YYYY/
    └── MM/
        └── DD/
            └── image.jpg
```

**Example:**
- Post location: `_posts/2025/12/05/welcome-to-my-blog.md`
- Image location: `assets/img/blog/2025/12/05/header.jpg`

**Benefits:**
- Images are grouped with their corresponding posts by date
- Easy to find and manage images for specific posts
- Cleaner directory structure as the blog grows
- Prevents filename conflicts across different posts

## Image Requirements

### Thumbnail Images (Required)
- **Purpose**: Displayed in blog listing cards
- **Dimensions**: 800x400px (2:1 aspect ratio)
- **Format**: JPEG, PNG, or WebP
- **File Size**: < 200KB (optimized for web)

### Cover Images (Optional)
- **Purpose**: Full-width banner on individual post pages
- **Dimensions**: 1200x600px (2:1 aspect ratio)
- **Format**: JPEG, PNG, or WebP
- **File Size**: < 300KB

### In-Content Images
- **Max Width**: 1000px
- **Format**: JPEG, PNG, SVG, or WebP
- **File Size**: < 500KB per image

## Naming Convention

Use descriptive, lowercase names with hyphens. Store them in date-based folders:
- ✅ `assets/img/blog/2025/12/05/welcome-post.jpg`
- ✅ `assets/img/blog/2025/12/15/python-tutorial-header.png`
- ✅ `assets/img/blog/2025/12/20/cybersecurity-overview.jpg`
- ❌ `assets/img/blog/IMG_1234.jpg` (no date folder)
- ❌ `assets/img/blog/2025/12/05/Screen Shot 2025-12-05.png` (poor naming)

## Image Optimization

Before uploading images, optimize them:

### Online Tools
- [TinyPNG](https://tinypng.com/) - PNG/JPEG compression
- [Squoosh](https://squoosh.app/) - Advanced image optimization
- [ImageOptim](https://imageoptim.com/) - Mac app for optimization

### Command Line
```bash
# Using ImageMagick
convert input.jpg -resize 800x400^ -gravity center -extent 800x400 output.jpg

# Using sips (Mac)
sips -z 400 800 input.jpg --out output.jpg
```

## Current Images

### Required Images
The following blog posts need images:

1. **assets/img/blog/2025/12/05/welcome-post.jpg** (for _posts/2025/12/05/welcome-to-my-blog.md)
   - Recommended: Technology/coding themed image
   - Dimensions: 800x400px
   - Can use stock photos from [Unsplash](https://unsplash.com/s/photos/technology)

## Stock Photo Resources

Free, high-quality images:
- [Unsplash](https://unsplash.com/) - Free photos
- [Pexels](https://pexels.com/) - Free stock photos
- [Pixabay](https://pixabay.com/) - Free images
- [Burst](https://burst.shopify.com/) - Free stock photos

### Recommended Search Terms
- Technology
- Coding
- Cybersecurity
- Programming
- Software Development
- Computer Science
- Innovation
- Data

## Adding Images to Posts

### 1. Create the date folder (if it doesn't exist)
```bash
mkdir -p assets/img/blog/2025/12/05
```

### 2. In Front Matter (Thumbnail)
```yaml
---
thumbnail-img: /assets/img/blog/2025/12/05/welcome-post.jpg
---
```

### 3. In Content
```markdown
![Descriptive alt text](/assets/img/blog/2025/12/05/example-image.jpg)
```

### 4. With Caption
```markdown
![Descriptive alt text](/assets/img/blog/2025/12/05/example-image.jpg)
*Figure 1: Caption explaining the image*
```

## Accessibility

Always include descriptive alt text:
- ✅ `![Python code example showing list comprehension](/assets/img/blog/python-code.jpg)`
- ❌ `![image](/assets/img/blog/python-code.jpg)`

## Dark Mode Considerations

Images should work well in both light and dark modes:
- Avoid pure white backgrounds
- Use subtle borders if needed
- Test images in both themes

## License & Attribution

- Only use images you have rights to use
- Provide attribution if required by license
- Keep a record of image sources

---

**Note**: Remember to add the actual image file `welcome-post.jpg` for the sample blog post before publishing!
