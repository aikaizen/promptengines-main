# PromptEngines TODO

*Main: promptengines.com | Status: Multi-experiment incubator | Priority: High*

---

## 🔴 NEW EXPERIMENT: ANIMA (Complex Video-Making)

### Phase 1: Definition & Scoping (Week 1)
- [ ] **Define experiment scope**: What does "complex video-making" mean?
  - [ ] Multi-shot scenes?
  - [ ] Character consistency across frames?
  - [ ] Camera movements (pans, zooms, tracking)?
  - [ ] Audio synchronization?
  - [ ] Length targets (30s? 5min? Feature?)
- [ ] **Competitive analysis**: What exists? (Runway, Pika, Sora, etc.)
- [ ] **Technical feasibility**: GPU requirements, model availability
- [ ] **User interviews**: 5-10 target users, what do they need?

### Phase 2: Prototype (Weeks 2-4)
- [ ] **Build minimal demo**: Single feature working end-to-end
- [ ] **Test with 3 users**: Get feedback before building more
- [ ] **Define success metrics**: What proves viability?
  - [ ] Quality threshold (subjective ratings?)
  - [ ] Generation time (speed)
  - [ ] User completion rate
  - [ ] Willingness to pay

### Phase 3: Full Experiment Build (Weeks 5-8)
- [ ] **Core features**: Based on prototype learnings
- [ ] **User authentication**: Login, projects, saved work
- [ ] **Payment integration**: If charging, Stripe setup
- [ ] **Basic analytics**: Track usage, errors, conversions

---

## 🚀 EXPERIMENT RELEASE PROCESS

### Pre-Launch Checklist (Must Complete)

#### Technical Review
- [ ] **Security audit**: Andy reviews for common vulnerabilities
  - [ ] Input validation/sanitization
  - [ ] API key handling (no client-side exposure)
  - [ ] Rate limiting implemented
  - [ ] CORS configured correctly
  - [ ] Dependency audit (npm audit, pip check)
- [ ] **Performance test**: Load testing (can it handle 100 concurrent users?)
- [ ] **Error handling**: Graceful failures, user-friendly error messages
- [ ] **Mobile responsive**: Works on phones/tablets

#### Content Review
- [ ] **Marketing review**: Andy checks messaging
  - [ ] Anti-slop compliance (no hype, honest claims)
  - [ ] Clear value proposition
  - [ ] Pricing transparency (if applicable)
  - [ ] FAQ covers common questions
- [ ] **Design review**: Visual consistency with PromptEngines brand
  - [ ] Logo placement
  - [ ] Color scheme matches
  - [ ] Typography hierarchy
  - [ ] Dark zinc (#09090b) + orange (#F04D26) if following Lab aesthetic
- [ ] **Legal review**: Terms of service, privacy policy, cookie notice

#### Integration Checklist
- [ ] **Add to promptengines.com homepage**: 
  - [ ] Experiment card in experiments grid
  - [ ] Link to experiment subdomain
  - [ ] Brief description (2 sentences)
  - [ ] Status badge (Alpha/Beta/Live)
- [ ] **Add to Lab Notes**: 
  - [ ] Article about experiment launch
  - [ ] Technical deep-dive (how it works)
  - [ ] Signals tracking (if relevant)
- [ ] **Documentation**:
  - [ ] README in repo
  - [ ] User guide/help docs
  - [ ] API documentation (if applicable)
- [ ] **Analytics**:
  - [ ] Google Analytics 4 property
  - [ ] Custom events tracked (key actions)
  - [ ] Dashboard for monitoring

#### Operational
- [ ] **Domain/subdomain**: anima.promptengines.com or anima.pe
- [ ] **SSL certificate**: Auto-renewal configured
- [ ] **Monitoring**: Uptime alerts (Pingdom/UptimeRobot)
- [ ] **Backup strategy**: Data retention, disaster recovery
- [ ] **Support channel**: Email, Discord, or in-app chat
- [ ] **Feedback mechanism**: Built-in user feedback form

---

## 🧪 ACTIVE EXPERIMENTS (Status)

### StoryBook Studio
- [x] Launched (soft)
- [ ] Domain migration (storybookstudio.ai)
- [ ] Full marketing push

### Lab Notes
- [x] Redesign complete
- [ ] Progress bar standardization
- [ ] Automated build stream

### Kaizen
- [ ] Status check needed
- [ ] Integration with other experiments?

### Flow
- [ ] Status check needed

### Bible
- [ ] Status check needed

### Transcriber
- [ ] Status check needed

### Anima (NEW)
- [ ] Definition phase
- [ ] Prototype phase
- [ ] Full build

---

## 🏗️ INFRASTRUCTURE & SHARED SERVICES

### Authentication
- [ ] **Unified auth**: Single sign-on across all experiments
- [ ] **User profiles**: Shared profile data where appropriate
- [ ] **Cross-experiment access**: If user has account on X, smooth transition to Y

### Billing (if applicable)
- [ ] **Shared Stripe account**: Unified billing across experiments
- [ ] **Usage tracking**: Credits system (like StoryBook Studio's 100 free credits)
- [ ] **Subscription management**: Cross-experiment plans?

### Analytics
- [ ] **Unified GA4 property**: Cross-experiment tracking
- [ ] **Experiment comparison**: Which get most engagement?
- [ ] **Funnel analysis**: Discovery → Trial → Paid conversion

### Deployment
- [ ] **Consistent hosting**: All on Vercel? Mix based on needs?
- [ ] **CI/CD pipeline**: GitHub Actions for all repos
- [ ] **Staging environments**: preview-[branch].promptengines.com

---

## 📋 SHARED COMPONENTS

### Design System
- [ ] **Component library**: Shared React/Vue components
  - [ ] Buttons, forms, cards
  - [ ] Navigation patterns
  - [ ] Modal/dialog system
  - [ ] Loading states
- [ ] **Color tokens**: Zinc dark + orange accent (consistent)
- [ ] **Typography**: Outfit + JetBrains Mono (or system for all)

### Common Pages
- [ ] **About PromptEngines**: Who we are, what we do
- [ ] **Experiment directory**: All experiments, status, links
- [ ] **Blog/Updates**: Cross-experiment news
- [ ] **Careers**: If hiring
- [ ] **Contact**: Unified contact form

### Technical Utilities
- [ ] **Shared API client**: Standardized fetch/axios wrapper
- [ ] **Error tracking**: Sentry or similar (unified)
- [ ] **Logging**: Structured logging format
- [ ] **Feature flags**: LaunchDarkly or equivalent for gradual rollouts

---

## 🎯 2026 PRIORITIES

### Q1 (Jan-Mar)
- [ ] Launch Anima (video-making)
- [ ] Migrate StoryBook Studio to standalone domain
- [ ] Standardize experiment release process
- [ ] Launch unified auth system

### Q2 (Apr-Jun)
- [ ] Evaluate Kaizen/Flow/Bible/Transcriber status
- [ ] Sunset or revitalize dormant experiments
- [ ] Build shared component library
- [ ] Implement cross-experiment analytics

### Q3 (Jul-Sep)
- [ ] New experiment ideation
- [ ] Community building (Discord/newsletter)
- [ ] Partnership integrations

### Q4 (Oct-Dec)
- [ ] Year in review / annual report
- [ ] 2027 experiment roadmap
- [ ] Fundraising or revenue focus (if applicable)

---

## 📝 NOTES

**Experiment lifecycle**: Definition → Prototype → Build → Launch → Monitor → Iterate → Sunset (if no traction)  
**Sunset criteria**: < 100 users in 3 months, no revenue, better alternative exists, maintenance burden > value  
**Success criteria**: Engagement (DAU/MAU), Revenue, Strategic value (learning, positioning)  

**Andy handles**: Technical build, content, systems, automation  
**You handle**: Strategy, final approvals, partnerships, fundraising  
**Next discussion**: Anima scope definition — what exactly are we building?
