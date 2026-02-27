# Hero Product Buttons Design

## Summary

Replace the two hero CTAs ("Enter the Lab" and "See Active Builds") with a horizontal row of 5 pill-style product buttons linking to each PromptEngines product subdomain.

## Buttons

| Order | Label            | URL                                    |
|-------|------------------|----------------------------------------|
| 1     | Kaizen           | https://kaizen.promptengines.com       |
| 2     | Storybook Studio | https://storybookstudio.promptengines.com |
| 3     | Flow             | https://flow.promptengines.com         |
| 4     | Lab              | https://lab.promptengines.com          |
| 5     | Consulting       | https://consulting.promptengines.com   |

## Styling

- Pill-shaped (high border-radius), outlined style
- Border color: `var(--line)` or theme equivalent
- Text color: inherits from theme (`var(--text)`)
- Hover: fill with `var(--accent)`, text goes dark
- Compact padding, all buttons same size
- `flex-wrap: wrap` with `justify-content: center`
- Gap between buttons for spacing

## Responsive Behavior

- Desktop: all 5 in one row
- Tablet: wraps to 3+2
- Mobile: wraps naturally, stacks as needed

## Theme Compatibility

Uses existing CSS variables so all 6 theme variants (default, terminal, military, gallery, hacker, pixel) get correct colors automatically. Theme-specific overrides for button colors follow existing `.btn-secondary` patterns.

## Scope

Apply to all 6 theme variant files: index.html, v1.html, v3.html, v4.html, v5.html, v6.html.

## What Gets Removed

- "Enter the Lab" button
- "See Active Builds" button
- The `#activity` and `#projects` sections remain on the page as scrollable content
