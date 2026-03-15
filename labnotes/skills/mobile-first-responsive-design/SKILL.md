# Mobile-First Responsive Design

Build A-grade mobile user experiences that don't sacrifice desktop quality. This skill covers testing methodology, common issues, and proven solutions for responsive web design.

## When to Use

- New website or page design
- Mobile UX audit and fixes
- Navigation redesign
- Grid/layout system overhaul
- Touch target compliance (WCAG)

## Testing Methodology

### 1. Multi-Viewport Testing

Test across these breakpoints as minimum:

```
- 375×812  (iPhone SE)      — Smallest mainstream device
- 390×844  (iPhone 12/13)   — Most common
- 430×932  (iPhone 14 Pro Max) — Largest phones
- 768×1024 (iPad Mini)      — Tablet threshold
- 1440×900 (Desktop)        — Verify no regression
```

### 2. Common Mobile Issues Checklist

| Check | Tool/Method | Pass Criteria |
|-------|-------------|---------------|
| Horizontal overflow | Browser devtools | No horizontal scroll at 375px |
| Touch target size | CSS inspection | All interactive elements ≥44×44px |
| Text readability | Visual inspection | Body text ≥12px, line-height ≥1.5 |
| Dropdown functionality | Manual test | Opens/closes on touch, doesn't overflow |
| Grid density | Screenshot review | Single column at 680px, readable cards |
| Navigation overflow | Visual inspection | Scrolls horizontally or hamburger menu |
| Form inputs | Manual test | Zooms properly, not cut off by keyboard |

## Critical Patterns

### Pattern 1: Touch Target Compliance (WCAG 2.1 AA)

**Standard:** 44×44px minimum for all interactive elements.

```css
/* Base: All interactive elements */
.btn, .nav-link, .dropdown-trigger, .card, .tag {
  min-height: 44px;
  min-width: 44px;
}

/* Mobile: Increase padding */
@media (max-width: 680px) {
  .btn {
    padding: 12px 18px;
    min-height: 44px;
  }
  
  .nav-link {
    padding: 10px 12px;
    min-height: 44px;
    min-width: 44px;
  }
  
  .dropdown-menu a {
    padding: 16px;
    min-height: 52px; /* Even larger for dropdown items */
  }
}
```

**Why it matters:** iOS Safari won't fire click events on elements <44px. Android is more forgiving but small targets frustrate users.

---

### Pattern 2: Mobile Dropdown Handling

**The Problem:** Desktop hover menus don't work on touch. `click` events have 300ms delay on mobile.

**The Solution:** Touch-optimized event handling with proper positioning.

```javascript
// Mobile-optimized dropdown handler
function initMobileDropdowns() {
  const dropdowns = document.querySelectorAll('.nav-dropdown');
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.dropdown-trigger');
    
    function toggle(e) {
      e.preventDefault();
      e.stopPropagation();
      
      // Close others
      dropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove('is-open');
      });
      
      dropdown.classList.toggle('is-open');
    }
    
    // Use touchstart for immediate response on mobile
    if (isTouch) {
      trigger.addEventListener('touchstart', toggle, { passive: false });
    }
    trigger.addEventListener('click', toggle);
    
    // Keyboard accessibility
    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle(e);
      }
    });
  });
  
  // Close on outside tap/click
  document.addEventListener(isTouch ? 'touchstart' : 'click', (e) => {
    dropdowns.forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('is-open');
    });
  });
  
  // Close on scroll (mobile optimization)
  window.addEventListener('scroll', () => {
    dropdowns.forEach(d => d.classList.remove('is-open'));
  }, { passive: true });
}
```

**CSS for Mobile Dropdown Positioning:**

```css
.dropdown-menu {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  min-width: 220px;
  z-index: 50;
}

@media (max-width: 680px) {
  .dropdown-menu {
    position: fixed;
    top: 110px;
    left: 12px;
    right: 12px;
    min-width: auto;
    max-width: calc(100% - 24px);
    max-height: calc(100vh - 130px);
    overflow-y: auto;
    -webkit-overflow-scrolling: touch;
  }
}
```

---

### Pattern 3: Grid Collapse Strategy

**Rule:** Single column at 680px for all content grids.

```css
/* Desktop */
.activity-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.articles-grid {
  grid-template-columns: repeat(3, 1fr);
}

/* Tablet */
@media (max-width: 900px) {
  .activity-grid,
  .articles-grid {
    grid-template-columns: 1fr;
  }
}

/* Small mobile - force single column */
@media (max-width: 680px) {
  /* All grids */
  .activity-grid,
  .articles-grid,
  .product-grid,
  .portfolio-grid,
  .portfolio-grid-3,
  .os-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  /* Card adjustments */
  .card {
    padding: 16px;
    min-height: auto; /* Let content dictate height */
  }
}
```

**Why 680px?** iPhone SE is 375px, but some Android devices hit 680px in landscape. This breakpoint catches all phones in all orientations.

---

### Pattern 4: Horizontal Pipeline → Vertical Stack

**Desktop:**
```
Prototype → Experiment → Product
```

**Mobile:**
```
Prototype
↓
Experiment
↓
Product
```

```css
.pipeline {
  display: flex;
  align-items: center;
}

.pipeline-stage {
  flex: 1;
  text-align: center;
  border: 1px solid var(--line);
}

.pipeline-arrow {
  padding: 0 12px;
}

@media (max-width: 680px) {
  .pipeline {
    flex-direction: column;
    gap: 0;
  }
  
  .pipeline-stage {
    width: 100%;
    border-radius: 8px !important;
    padding: 12px;
  }
  
  .pipeline-arrow {
    transform: rotate(90deg);
    padding: 8px 0;
  }
}
```

---

### Pattern 5: Navigation Scroll vs. Hamburger

**For 6-8 nav items:** Use horizontal scroll, not hamburger.

```css
.nav-links {
  display: flex;
  gap: 22px;
}

@media (max-width: 900px) {
  .nav-links {
    gap: 6px 10px;
    overflow-x: auto;
    flex-wrap: nowrap;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: none;
  }
  
  .nav-links::-webkit-scrollbar {
    display: none;
  }
}
```

**For 9+ nav items:** Consider hamburger menu with slide-out drawer.

---

### Pattern 6: Text Truncation

**Prevent overflow while keeping UI clean:**

```css
/* Single line with ellipsis */
.truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0; /* Critical for flex containers */
}

/* Multi-line clamp */
.clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Flex item that truncates properly */
.flex-truncate {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
```

**Common bug:** Forgetting `min-width: 0` on flex items. Flex items won't shrink below their content size without it.

---

### Pattern 7: Viewport Meta Tag

**Correct:**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Never use:**
```html
<!-- Don't disable zoom - accessibility violation -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
```

---

## Common Mobile Anti-Patterns (Avoid)

### ❌ Anti-Pattern 1: Hover-Only Interactions
```css
/* DON'T */
.dropdown:hover .menu { display: block; }
```

### ❌ Anti-Pattern 2: Fixed Widths in Media Queries
```css
/* DON'T */
.rotator-value { min-width: 120px; }

/* DO */
.rotator-value { min-width: min(120px, 30vw); }
```

### ❌ Anti-Pattern 3: Removing Overflow Properties
```css
/* DON'T */
@media (max-width: 680px) {
  .commit-msg {
    font-size: 11px;
    white-space: nowrap;
    /* Missing: overflow, text-overflow, min-width */
  }
}
```

### ❌ Anti-Pattern 4: Desktop-Only Grids
```css
/* DON'T */
@media (max-width: 900px) {
  .grid { grid-template-columns: 1fr; }
}
/* Missing: 680px breakpoint for extra safety */
```

---

## Testing Checklist (Copy-Paste)

```markdown
## Mobile UX Testing Checklist

### Viewports
- [ ] 375×812 (iPhone SE)
- [ ] 390×844 (iPhone 12/13)
- [ ] 430×932 (iPhone 14 Pro Max)
- [ ] 768×1024 (iPad Mini)
- [ ] 1440×900 (Desktop - no regression)

### Navigation
- [ ] All links have 44×44px touch targets
- [ ] Dropdowns open/close on touch
- [ ] Dropdowns don't overflow viewport
- [ ] No horizontal scroll at 375px

### Grids & Cards
- [ ] Single column at 680px
- [ ] Cards don't overflow container
- [ ] Text readable (≥12px)
- [ ] Images scale properly

### Content
- [ ] No text truncation mid-word
- [ ] Tables/pipelines stack vertically
- [ ] Feature tags wrap if needed
- [ ] Footer links stack properly

### Interactive
- [ ] Buttons easy to tap
- [ ] Form inputs zoom properly
- [ ] No 300ms tap delay
- [ ] Keyboard accessible

### Performance
- [ ] Passive event listeners for scroll
- [ ] No layout thrashing
- [ ] Images lazy-loaded
```

---

## Quick Reference: Breakpoint Strategy

```css
/* Desktop first - standard breakpoints */

/* Tablet: Major layout shifts */
@media (max-width: 900px) {
  /* 2-col → 1-col grids */
  /* Navigation scrolls horizontally */
  /* Container margins reduce */
}

/* Mobile: Fine-tuning */
@media (max-width: 680px) {
  /* Force single-column everything */
  /* Increase touch targets */
  /* Smaller typography */
  /* Vertical stacks for horizontal elements */
}
```

---

## Grade Self-Assessment

| Grade | Criteria |
|-------|----------|
| **A+** | All checkboxes above + 60fps scrolling, offline support, touch gestures |
| **A** | All checkboxes above, no horizontal overflow, 44px touch targets, single-column grids |
| **B** | Mostly responsive, minor overflow issues, some small touch targets |
| **C** | Responsive at 900px only, major issues at 375px |
| **D** | Desktop-only layout squeezed into mobile |
| **F** | Horizontal scroll, unreadable text, broken interactions |

---

## Examples from This Session

### Before (D+ Grade)
- Navigation: 6 items crammed, 10px touch targets
- Grids: 2 columns at 375px (170px cards, unreadable)
- Pipeline: Horizontal table overflow
- Dropdowns: Click only, no touch support

### After (A Grade)
- Navigation: 44px touch targets, horizontal scroll
- Grids: Single column at 680px, readable cards
- Pipeline: Vertical stack with rotated arrows
- Dropdowns: Touch events + proper positioning

---

## Files to Reference

- Example implementation: `archive/promptengines-main/index.html`
- Commits: `5ab1c5b`, `0db7470` for complete mobile overhaul

---

_This skill embodies patterns from WCAG 2.1 AA, iOS Human Interface Guidelines, and Material Design touch target standards._