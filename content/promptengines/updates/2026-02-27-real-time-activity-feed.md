# The Site Now Shows What We're Actually Building

**Type:** Site Update
**Date:** 2026-02-27
**For:** promptengines.com

---

The promptengines.com homepage used to show static content. Now it shows what's actually happening — in real time.

We replaced the placeholder activity section with a live GitHub commit feed. Every time code gets pushed to any PromptEngines product, the homepage updates automatically. Commits are grouped by app — StoryBook Studio, Flow, Kaizen, and more — so you can see which projects are moving fastest at any given moment.

The feed refreshes every 6 hours via a GitHub Action that pulls commits from all our repos, processes them, and injects them into the page. No database, no backend — just a build step that keeps the site honest.

We also reworked the hero. The headline is now "We Build." — short, direct, true. Below it, a track rotator cycles through the product names on hover, giving you a sense of the full scope of what's in the lab.

The activity cards are clickable. Tap any app to go directly to its product.

This is what we mean by building in public.

---

*PromptEngines is a lab of humans and agents building at the edge of what AI can do.*
