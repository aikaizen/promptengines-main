# Lesson Plan Template

Standardized structure for all Flow Education lesson plans.

## Required Fields

### 1. Identification
- `lessonPlanId`: Unique identifier (e.g., `lp-001-kindergarten-letters`)
- `version`: Semantic versioning (e.g., `1.0.0`)
- `status`: `draft`, `mvp-active`, `pilot`, `production`, `archived`

### 2. Metadata
- `title`: Human-readable name
- `description`: What this lesson plan covers
- `author`: Creator/organization
- `createdAt`: ISO date
- `lastUpdated`: ISO date
- `tags`: Array of searchable keywords

### 3. Target Student
- `ageRange`: E.g., "5-6 years"
- `gradeLevel`: E.g., "Kindergarten", "Grade 1"
- `readingLevel`: E.g., "pre-reader", "early-reader", "independent-reader"
- `prerequisites`: What child should know before starting
- `deviceRequirements`: Object with tablet specs, audio needs, etc.

### 4. Pedagogical Focus
- `primaryDomain`: Main subject area (e.g., "Early Literacy")
- `secondaryDomains`: Array of supporting areas
- `learningTheory`: Pedagogical approach used
- `engagementTarget`: Time goal (e.g., "60 minutes independent")
- `adultSupervision`: Required supervision level

### 5. Curriculum Alignment
Array of standards objects:
- `framework`: CCSS, TEKS, etc.
- `code`: Standard identifier
- `description`: What the standard requires

### 6. Structure
- `totalDuration`: Sum of all lessons
- `lessonCount`: Number of lessons
- `lessons`: Array of lesson references
  - `lessonId`: Link to lesson manifest
  - `sequence`: Order (1, 2, 3...)
  - `title`: Lesson name
  - `duration`: Individual lesson time
  - `learningObjectives`: Array of specific goals
  - `skillsTargeted`: Array of skill categories
  - `prerequisites`: Array of required prior lessons
  - `assetsRequired`: Count of images/audio needed
  - `specialNotes`: Any unique considerations

### 7. Assessment
- `formative`: Continuous assessment method
- `summative`: Milestone check details

### 8. Adaptation Strategy
- Error handling rules
- Success handling rules
- Frustration detection
- Mastery thresholds

### 9. Assets Summary
- Total image count
- Total audio count
- Shared assets (reused across lessons)

### 10. Deployment
- Target platform
- Format
- Offline capability
- Cloud sync options

### 11. Success Metrics
- Engagement targets
- Learning targets
- Usability targets

### 12. Future Expansion
- Links to next lesson plans in sequence
- Status of future plans

---

## File Structure

```
lesson-plans/
├── lp-001-kindergarten-letters/
│   ├── plan.json           # This standardized structure
│   ├── overview.html       # Teacher-facing overview page
│   └── lessons/            # Symlinks or refs to actual lessons
│       ├── quest-001-letter-a/
│       ├── quest-002-letter-b/
│       └── ...
├── lp-002-kindergarten-advanced/
│   ├── plan.json
│   └── ...
└── TEMPLATE.json           # This template file
```

## Lesson Plan Statuses

- **draft**: In development, not ready for use
- **mvp-active**: Minimum viable product, being tested
- **pilot**: Deployed to pilot classrooms, collecting data
- **production**: Proven effective, approved for general use
- **archived**: Replaced by newer version, kept for reference

## Relationship to Lessons

Lesson Plan (lp-001) contains multiple Lessons (quest-001, quest-002...)

- Lesson Plan = Curriculum container (the "what" and "why")
- Lesson = Individual learning unit (the "how")
- Lesson Plan references Lessons by ID
- Lessons can belong to multiple Lesson Plans (reuse)
