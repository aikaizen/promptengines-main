# Developer Portfolio Craft — SKILL.md

Create websites that demonstrate exceptional development craft through design, animation, and attention to detail.

## Core Principles

### 1. Typography as Architecture
- **Primary**: System font stack (-apple-system, Inter, or bespoke)
- **Monospace**: JetBrains Mono, Fira Code, or similar for code/technical elements
- **Scale**: Dramatic size contrast (14px labels vs 72px headlines)
- **Treatment**: ALL CAPS for section labels, sentence case for body
- **Tracking**: Wide letter-spacing (0.08em–0.15em) on uppercase text

### 2. Motion is Mandatory
Every interaction has feedback:
- **Hover**: Subtle transforms (translateY(-2px)), opacity shifts, color transitions
- **Scroll**: Parallax effects, staggered reveals, fade-ins
- **Load**: Sequential animations (0.1s delay between elements)
- **Easing**: `cubic-bezier(0.23, 1, 0.32, 1)` for smooth deceleration

### 3. Visual Hierarchy Through Restraint
- **Colors**: 2-3 maximum. One dominant, one accent, one muted.
- **Borders**: Thin (1px), subtle (rgba or low-opacity), used for definition not decoration
- **Spacing**: Generous. 4rem+ between sections. Let content breathe.
- **Containers**: Max-width constraints (800–1200px), generous padding.

### 4. The "Code Aesthetic"
Elements that signal "this was built by developers":
- **Visual code blocks**: Dark backgrounds, monospace, colored syntax
- **ASCII/text diagrams**: System architecture in text
- **Terminal-style elements**: `$` prompts, command syntax, file paths
- **Grid systems**: CSS Grid with visible guides or implied structure
- **Status indicators**: Live/online dots, version numbers, commit hashes

### 5. Micro-Interactions
- Buttons that "feel" physical (subtle press states)
- Links with animated underlines (draw on hover)
- Cards that lift on hover
- Staggered list reveals
- Smooth scrolling (native or Lenis)

### 6. The Dark Mode Default
- **Background**: Near-black (#09090b, #0a0a0a)
- **Text**: High contrast white/gray (#fafafa, #e4e4e7, #a1a1aa)
- **Accent**: One saturated color (orange, cyan, violet)
- **Muted**: Low-opacity whites for secondary text

### 7. Content Presentation
- **Asymmetric layouts**: Break the grid intentionally
- **Generous whitespace**: More empty space than content
- **Layered depth**: Shadows, z-index, overlapping elements
- **Texture**: Subtle grain, noise, or gradient overlays

## Implementation

### HTML Structure
```html
<section class="hero">
  <span class="label">SECTION LABEL</span>
  <h1 class="headline">Massive Headline</h1>
  <p class="lede">Supporting text with more breathing room.</p>
</section>
```

### CSS Patterns
```css
/* The archetypal section */
.section {
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* The label */
.label {
  font-family: var(--mono);
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--text-muted);
  margin-bottom: 1rem;
}

/* The headline */
.headline {
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 600;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

/* Staggered animation base */
.stagger > * {
  animation: fadeInUp 0.6s ease backwards;
}
.stagger > *:nth-child(1) { animation-delay: 0.0s; }
.stagger > *:nth-child(2) { animation-delay: 0.1s; }
.stagger > *:nth-child(3) { animation-delay: 0.2s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Application to Flow Education

### Manifesto Page
- **Hero**: Full viewport height, massive typography, minimal elements
- **Code blocks**: Visual syntax highlighting for "curriculum as code"
- **Scroll animations**: Sections reveal as you scroll
- **Status indicators**: Version badges, "last updated" timestamps

### Main Splash
- **Asymmetric hero**: Text left, interactive demo right
- **Hover states**: Every clickable element responds
- **Grid reveals**: Feature cards animate in sequence
- **Live indicator**: "Currently in pilot" badge with pulsing dot

### Key Pages
- Use consistent section headers (label + headline + body)
- Include at least one "visual code" block per page
- Add scroll-triggered animations
- Maintain 2-3 color palette strictly

## Quality Checklist

- [ ] Typography has dramatic scale contrast
- [ ] All interactive elements have hover states
- [ ] Animations use custom easing (not default ease)
- [ ] Dark mode is the default
- [ ] At least one code-aesthetic element per page
- [ ] Staggered reveals on lists/grids
- [ ] Generous whitespace (no cramped sections)
- [ ] Micro-interactions on all buttons/links
- [ ] Consistent 2-3 color palette
- [ ] Monospace used for technical/label elements
