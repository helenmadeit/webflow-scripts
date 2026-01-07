# 🧩 fc-dropdowns.js

Smart dropdown behavior for Webflow — built to make sections feel alive.

---

### 🚀 Features
- Opens the **default** dropdown when a section first appears.
- Remembers which dropdown the user opened last.
- Reopens the correct one when revisiting that section.
- Fully compatible with Webflow’s native dropdown logic.

---

### 🧠 Usage

1. Add the script to your Webflow project under  
   **Project Settings → Custom Code → Footer Code**

2. Republish your site.

3. Apply the following attributes in the Designer:

   ```html
   <div fc-section="features">
     <div fc-dropdown="default" class="w-dropdown">
       <div fc-dropdown-toggle="1" class="w-dropdown-toggle">...</div>
     </div>
   </div>

---

# 🧩 toc.js

Smart, accessible, auto-generated Table of Contents for long-form pages

## ✨ What it does

- Scans your content and generates a TOC from headings.
- Creates clean, unique anchor IDs automatically.
- Tracks scroll position with precise, jitter-free scrollspy.
- Syncs active state instantly using `aria-current`.
- Supports nested levels (H2 → H3 → H4) out of the box.
- Handles custom scroll offsets for sticky headers.
- Adds smooth scrolling with reduced-motion support.
- Requires zero dependencies and no build tools.
- Plays nicely with Webflow’s DOM and class system.

Built with accessibility first:
- Full keyboard navigation
- Screen reader-friendly landmarks and labels
- Proper focus management
- Touch-friendly interaction targets


## ⚙️ Configuration & Attributes

All behavior in `toc.js` is controlled via HTML data attributes.

| Attribute | Where to add | Purpose |
|----------|---------------|---------|
| `data-toc` | Outer TOC wrapper (`<aside>`) | Marks the TOC block |
| `data-content` | Content wrapper | Limits where headings are scanned |
| `data-toc-list` | TOC `<ul>` | Main container for generated items |
| `data-toc-template` | Single `<li>` inside TOC | Cloning template (auto-removed) |
| `data-toc-link` | `<a>` inside template | Scroll target + active sync |
| `data-toc-label` | Element inside link | Injects heading text |
| `data-headings` | `data-toc-list` | Adds extra levels (`h3, h4`) |
| `data-offset` | `data-toc-list` or `data-content` | Scroll offset for fixed headers |
| `[omit]` | Inside heading text | Excludes heading from TOC |
| `data-level` | Auto on `<a>` | Heading level for styling |
| `aria-current` | Auto on active `<a>` | Accessibility + active styling |
| `data-sublist` | Auto on nested `<ul>` | Identifies nested TOC lists |

### Priority Rules

- `data-toc-list[data-offset]` overrides `data-content[data-offset]`
- `H2` is always included
- `data-headings` only extends heading detection
- Template is removed automatically after mount

---

## 🧱 HTML Structure

### Table of Contents

```html
<!-- Page content -->
<div data-content>
  <h2>Section One</h2>
  <h2>Section Two</h2>
  <h3>Subsection</h3>
  <h4>Details</h4>
</div>

<!-- Table of Contents -->
<aside data-toc aria-labelledby="toc-heading">
  <div class="toc-wrapper">
    <h2 id="toc-heading">Table of contents</h2>

    <nav data-toc-scroll aria-label="Page sections">
      <ul data-toc-list>
        <!-- Template (required, auto-removed) -->
        <li data-toc-template>
          <a data-toc-link>
            <span data-toc-label></span>
          </a>
        </li>
      </ul>
    </nav>
  </div>
</aside>
```

---


# 🧩 srt-to-vtt-track.js

Small helper that loads .srt subtitle files, converts them to WebVTT format, and injects them as <track> elements into HTML5 <video> tags.
Designed as an infrastructure script. It does not depend on any video player implementation.

## What it does

- Finds all `<video>` elements with `data-subtitles-src`.
- Fetches the SRT file from the given URL.
- Converts SRT timestamps to valid WebVTT.
- Creates a `<track kind="subtitles">` element.
- Appends the track to the video.
- Leaves subtitles disabled by default (mode = "hidden").
- The browser then handles subtitles natively.

Basic usage

```html

<video data-subtitles-src="/subs/en.srt" controls>
  <source src="video.mp4" type="video/mp4">
</video>

<script src="https://cdn.jsdelivr.net/gh/helenmadeit/webflow-scripts/srt-to-vtt-track.js"></script>
```

That’s it.
After load, the video will have a subtitle track available in video.textTracks.
