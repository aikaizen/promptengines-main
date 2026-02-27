# Hero Product Buttons Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the two hero CTAs with a horizontal row of 5 pill-style product buttons linking to PromptEngines subdomains.

**Architecture:** Simple CSS + HTML change across 7 static HTML files. The `.hero-actions` container keeps its flex layout but gets `justify-content: center` for centering. Two old buttons are replaced with 5 new `btn btn-product` links. A new `.btn-product` class provides pill styling that inherits from each theme's CSS variables.

**Tech Stack:** Static HTML, CSS custom properties

---

### Task 1: Update CSS in index.html

**Files:**
- Modify: `index.html:258-295` (main `.hero-actions` and `.btn` styles)
- Modify: `index.html:937-953` (mobile responsive styles)

**Step 1: Add `.btn-product` class and update `.hero-actions` in index.html**

Find the existing `.hero-actions` block (line ~258) and add `justify-content: center`. Then add a new `.btn-product` class after `.btn-secondary` (after line ~291):

```css
.btn-product {
  border-color: var(--line);
  color: var(--text);
  background: rgba(22, 34, 56, 0.35);
  border-radius: 999px;
  padding: 11px 20px;
  font-size: 11px;
}

.btn-product:hover {
  background: var(--accent);
  color: #121212;
  border-color: var(--accent);
}
```

**Step 2: Update mobile responsive styles in index.html**

In the `@media (max-width: 680px)` block (line ~937), change `.hero-actions` from `flex-direction: column; align-items: stretch;` to keep row direction with wrapping, and remove `width: 100%` from `.btn`:

```css
.hero-actions {
  justify-content: center;
}

.btn {
  width: auto;
}
```

**Step 3: Verify no theme-specific overrides need updating**

The theme overrides at lines ~1090, ~1136, ~1185 target `.btn-primary` and `.btn-secondary`. Since `.btn-product` inherits from `--line`, `--text`, and `--accent`, it works automatically. No changes needed to theme overrides.

---

### Task 2: Update hero HTML in index.html

**Files:**
- Modify: `index.html:1257-1260` (hero-actions div)

**Step 1: Replace the two buttons with 5 product buttons**

Replace:
```html
<div class="hero-actions">
  <a href="#activity" class="btn btn-primary">Enter the Lab</a>
  <a href="#projects" class="btn btn-secondary">See Active Builds</a>
</div>
```

With:
```html
<div class="hero-actions">
  <a href="https://kaizen.promptengines.com" class="btn btn-product" target="_blank">Kaizen</a>
  <a href="https://storybookstudio.promptengines.com" class="btn btn-product" target="_blank">Storybook Studio</a>
  <a href="https://flow.promptengines.com" class="btn btn-product" target="_blank">Flow</a>
  <a href="https://lab.promptengines.com" class="btn btn-product" target="_blank">Lab</a>
  <a href="https://consulting.promptengines.com" class="btn btn-product" target="_blank">Consulting</a>
</div>
```

**Step 2: Open index.html in browser and verify**

- All 5 buttons visible in a row on desktop
- Buttons are pill-shaped with outlined style
- Hover fills with accent color
- Resize to mobile width and confirm wrapping behavior
- Test with view switcher across themes

---

### Task 3: Apply same changes to v1.html

**Files:**
- Modify: `v1.html:249-291` (CSS)
- Modify: `v1.html:937-953` (mobile CSS)
- Modify: `v1.html:978-980` (HTML)

**Step 1: Add `.btn-product` CSS class** (same as Task 1 Step 1)

**Step 2: Update mobile responsive styles** (same as Task 1 Step 2)

**Step 3: Replace hero HTML** (same as Task 2 Step 1)

---

### Task 4: Apply same changes to v2.html

**Files:**
- Modify: `v2.html:249-291` (CSS)
- Modify: `v2.html:937-953` (mobile CSS)
- Modify: `v2.html:978-980` (HTML)

Same steps as Task 3.

---

### Task 5: Apply same changes to v3.html

**Files:**
- Modify: `v3.html:249-291` (CSS)
- Modify: `v3.html:937-953` (mobile CSS)
- Modify: `v3.html:978-980` (HTML)

Same steps as Task 3.

---

### Task 6: Apply same changes to v4.html

**Files:**
- Modify: `v4.html:249-291` (CSS)
- Modify: `v4.html:937-953` (mobile CSS)
- Modify: `v4.html:978-980` (HTML)

Same steps as Task 3.

---

### Task 7: Apply same changes to v5.html

**Files:**
- Modify: `v5.html:249-291` (CSS)
- Modify: `v5.html:937-953` (mobile CSS)
- Modify: `v5.html:978-980` (HTML)

Same steps as Task 3.

---

### Task 8: Apply same changes to v6.html

**Files:**
- Modify: `v6.html:249-291` (CSS)
- Modify: `v6.html:937-953` (mobile CSS)
- Modify: `v6.html:978-980` (HTML)

Same steps as Task 3.

---

### Task 9: Visual verification across all themes

**Step 1: Open each file in browser and verify**

Check each variant:
- `index.html` - Default/Elegant theme
- `v1.html` - Tech/Green theme
- `v2.html` - (verify theme)
- `v3.html` - Industrial/Military theme
- `v4.html` - Gallery White theme
- `v5.html` - Matrix Hacker theme
- `v6.html` - Pixel City theme

For each, confirm:
- 5 buttons visible and correctly labeled
- Pill shape and outlined style
- Hover effect uses theme accent color
- Mobile responsive wrapping works
- Links open correct subdomains in new tabs

**Step 2: Commit all changes**

```bash
git add index.html v1.html v2.html v3.html v4.html v5.html v6.html
git commit -m "Replace hero CTAs with product launcher buttons

Swap 'Enter the Lab' and 'See Active Builds' with 5 pill-style
product buttons: Kaizen, Storybook Studio, Flow, Lab, Consulting.
Each links to its subdomain. Responsive wrapping on mobile."
```
