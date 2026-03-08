# A/B Testing Analytics Setup

## Google Optimize (Free Tier)

**Step 1: Create Optimize Account**
1. Go to https://optimize.google.com
2. Link to Google Analytics 4 property
3. Create container: "StoryBook Studio Landing"

**Step 2: Create A/B Test**
- Test name: "Landing Page Variant Test"
- URL: https://storybookstudio.promptengines.com/
- Variants: 4 (A, B, C, D)
- Traffic allocation: 25% each
- Duration: 14 days minimum

**Step 3: Set Goals**
Primary: CTA click rate
Secondary: Time on page, Scroll depth, Return visits

---

## Vercel Edge Config (Alternative)

If using Vercel Edge Config for split testing:

```javascript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Check for existing variant cookie
  let variant = request.cookies.get('landing-variant')?.value;
  
  if (!variant) {
    // Random assignment
    const variants = ['a', 'b', 'c', 'd'];
    variant = variants[Math.floor(Math.random() * variants.length)];
    
    // Set cookie for consistency
    const response = NextResponse.rewrite(new URL(`/landing-page-${variant}.html`, request.url));
    response.cookies.set('landing-variant', variant, { maxAge: 60 * 60 * 24 * 30 }); // 30 days
    return response;
  }
  
  return NextResponse.rewrite(new URL(`/landing-page-${variant}.html`, request.url));
}

export const config = {
  matcher: ['/'],
};
```

---

## GA4 Event Tracking

**Custom Events to Track:**

```javascript
// CTA clicks
gtag('event', 'cta_click', {
  'event_category': 'engagement',
  'event_label': 'create_book_button',
  'variant': document.body.dataset.variant || 'a'
});

// Scroll depth
gtag('event', 'scroll', {
  'event_category': 'engagement',
  'event_label': '50_percent',
  'variant': document.body.dataset.variant
});

// Time on page (tracked automatically)
// Bounce rate (tracked automatically)
```

---

## Decision Matrix

| Metric | Variant A | Variant B | Variant C | Variant D | Winner |
|--------|-----------|-----------|-----------|-----------|--------|
| CTA Click Rate | % | % | % | % | ? |
| Avg Time on Page | s | s | s | s | ? |
| Scroll Depth | % | % | % | % | ? |
| Conversion | % | % | % | % | ? |

**Winner Selection:** Highest CTA click rate + positive qualitative feedback

---

## Implementation Steps

1. Add GA4 tracking code to all variant HTML files
2. Set up Optimize experiment
3. Deploy variants to separate paths (/a/, /b/, /c/, /d/) or use middleware
4. Run test for 14+ days
5. Analyze results
6. Implement winner as default
