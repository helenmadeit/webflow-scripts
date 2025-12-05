(function () {
  const tocListEl = document.querySelector('[data-toc-list]');
  const contentEl = document.querySelector('[data-content]');
  if (!tocListEl || !contentEl) return;

  // ============================================================
  // OFFSET (from data-offset on content or toc)
  // ============================================================
  function getGlobalOffset() {
    const el =
      tocListEl.hasAttribute('data-offset')
        ? tocListEl
        : contentEl.hasAttribute('data-offset')
        ? contentEl
        : null;

    if (!el) return 0;

    const raw = el.getAttribute('data-offset').trim();
    const value = parseFloat(raw);

    if (isNaN(value)) return 0;

    if (raw.endsWith('rem')) {
      const rootFont = parseFloat(
        getComputedStyle(document.documentElement).fontSize
      );
      return value * rootFont;
    }

    return value;
  }

  const globalOffset = getGlobalOffset();

  // ============================================================
  // HEADING COLLECTION
  // ============================================================
  const extraHeadings = (tocListEl.getAttribute('data-headings') || '')
    .toLowerCase()
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  const selector = ['h2', ...extraHeadings].join(',');
  let headings = [...contentEl.querySelectorAll(selector)];

  // filter + omit handling
  headings = headings.filter(h => {
    const raw = h.textContent.trim();
    if (raw.startsWith('[omit]')) {
      h.textContent = raw.replace(/^\[omit\]\s*/i, '');
      return false;
    }
    return raw !== '';
  });

  if (!headings.length) return;

  // ============================================================
  // TEMPLATE
  // ============================================================
  const templateLi = tocListEl.querySelector('[data-toc-template]');
  if (!templateLi) return;
  templateLi.remove();

  // ============================================================
  // SLUGIFY + UNIQUE ID
  // ============================================================
  function slugify(text) {
    return text
      .toLowerCase()
      .trim()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '') // accents
      .replace(/[^\p{Letter}\p{Number}\s\-]/gu, '')
      .replace(/\s+/g, '-')
      .replace(/\-+/g, '-');
  }

  const usedIds = new Set();

  headings.forEach(h => {
    if (!h.id) {
      let base = slugify(h.textContent.trim()) || 'section';
      let id = base;
      let counter = 1;
      while (usedIds.has(id) || document.getElementById(id)) {
        id = `${base}-${counter++}`;
      }
      h.id = id;
      usedIds.add(id);
    }
  });

  // ============================================================
  // BUILD TOC TREE
  // ============================================================
  const parentStack = {};
  const headingToLink = new Map();

  headings.forEach(h => {
    const level = parseInt(h.tagName.substring(1), 10);
    const li = templateLi.cloneNode(true);
    const link = li.querySelector('a');
    const labelEl = li.querySelector('[data-toc-label]') || link;

    link.href = `#${h.id}`;
    link.setAttribute('data-toc-link', '');
    link.setAttribute('data-level', level);
    labelEl.textContent = h.textContent.trim();

    headingToLink.set(h.id, link);

    if (level === 2) {
      tocListEl.appendChild(li);
      parentStack[2] = li;
    } else {
      let parent = null;
      for (let p = level - 1; p >= 2; p--) {
        if (parentStack[p]) {
          parent = parentStack[p];
          break;
        }
      }
      const parentEl = parent || tocListEl;

      let subList = parentEl.querySelector('ul[data-sublist]');
      if (!subList) {
        subList = document.createElement('ul');
        subList.setAttribute('data-sublist', '');
        parentEl.appendChild(subList);
      }

      subList.appendChild(li);
      parentStack[level] = li;
    }
  });

  const tocLinks = [...document.querySelectorAll('[data-toc-link]')];

  // ============================================================
  // ACTIVE LINK MARKING
  // ============================================================
  function setActiveLink(active) {
    tocLinks.forEach(link => {
      const isActive = link === active;
      link.toggleAttribute('aria-current', isActive);
      link.classList.toggle('w--current', isActive);
    });

    scrollActiveLinkIntoView(active); 
  }

  // ============================================================
  // SMOOTH SCROLLING (slower & nicer)
  // ============================================================
  function scrollToHeading(target) {
    const rect = target.getBoundingClientRect();
    const absoluteTop = rect.top + window.pageYOffset;
    const top = absoluteTop - globalOffset;

    window.scrollTo({
      top,
      behavior: 'smooth'
    });
  }

  // ============================================================
  // CLICK HANDLER
  // ============================================================
  tocLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      e.stopImmediatePropagation();

      const id = link.getAttribute('href').substring(1);
      const target = document.getElementById(id);
      if (!target) return;

      scrollToHeading(target);
      setActiveLink(link);

      setTimeout(() => {
        if (!target.hasAttribute('tabindex'))
          target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }, 250);
    });
  });

  // ============================================================
  // SCROLLSPY (top-based, super-accurate)
  // ============================================================
function updateActiveOnScroll() {
  const vh = window.innerHeight;
  const lowerEdge = vh * 0.05;  // 5%
  const upperEdge = vh * 0.17;  // 17%

  let bestCandidate = null;
  let bestDistance = Infinity;

  // Find heading whose top is closest to upperEdge but not above it
  for (const h of headings) {
    const top = h.getBoundingClientRect().top - globalOffset;

    // only consider headings above the upperEdge
    if (top <= upperEdge) {
      const distance = Math.abs(upperEdge - top);

      if (distance < bestDistance) {
        bestDistance = distance;
        bestCandidate = h;
      }
    }
  }

  // If none found (unlikely), fallback to first heading
  if (!bestCandidate) bestCandidate = headings[0];

  const link = headingToLink.get(bestCandidate.id);
  if (link) setActiveLink(link);
}



  // throttle
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        updateActiveOnScroll();
        ticking = false;
      });
      ticking = true;
    }
  });

  updateActiveOnScroll();

  // ============================================================
  // SCROLLING INSIDE THE TOC CONTAINER
  // ============================================================

  // nice easing animation
  function animateScroll(el, to, duration = 600) {
    const start = el.scrollTop;
    const change = to - start;
    const startTime = performance.now();

    function easeOutQuad(t) {
      t /= duration;
      return -change * t * (t - 2) + start;
    }

    function step(now) {
      const elapsed = now - startTime;
      if (elapsed < duration) {
        el.scrollTop = easeOutQuad(elapsed);
        requestAnimationFrame(step);
      } else {
        el.scrollTop = to;
      }
    }

    requestAnimationFrame(step);
  }

  function scrollActiveLinkIntoView(activeLink) {
    const scrollBox = tocListEl.closest('[data-toc-scroll]');
    if (!scrollBox) return;

    const boxRect = scrollBox.getBoundingClientRect();
    const linkRect = activeLink.getBoundingClientRect();

    const isAbove = linkRect.top < boxRect.top;
    const isBelow = linkRect.bottom > boxRect.bottom;

    if (isAbove) {
      const target = scrollBox.scrollTop - (boxRect.top - linkRect.top) - 16;
      animateScroll(scrollBox, target);
    } else if (isBelow) {
      const target = scrollBox.scrollTop + (linkRect.bottom - boxRect.bottom) + 16;
      animateScroll(scrollBox, target);
    }
  }
})();
