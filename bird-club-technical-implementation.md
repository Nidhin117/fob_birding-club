# Bird Watching Club Website — Technical Implementation Guide

## 1. Technical Objective

Implement a mobile-first, lightweight static website for a bird-watching club.

The first development milestone must focus on UX and use local static fallback data for all walk information.

Database connectivity must be disabled initially.

The data layer should be designed so that a future configuration flag can switch walk data from local fallback data to an external data source without requiring major changes to UI components.

## 2. Recommended Stack

Preferred:

- Astro
- HTML
- CSS
- Minimal client-side JavaScript
- Netlify for static hosting
- Git/GitHub for source control

Future:

- Supabase or another lightweight external data source for walk data

Avoid introducing React/Vue/Svelte unless a specific interactive requirement justifies it.

Prefer Astro components rendered to static HTML.

## 3. Architecture Principle

Separate presentation from the walk data source.

UI components must not know whether walk data comes from:

- A local static file
- A remote API
- Supabase
- Another future data source

Use a data-access abstraction.

Conceptually:

```text
UI Components
      |
      v
Walk Data Service
      |
      +-------------------+
      |                   |
      v                   v
Static Provider      Remote Provider
(initial)            (future)
```

## 4. Feature Flag

Introduce a configuration value such as:

```text
PUBLIC_USE_REMOTE_WALKS=false
```

Initial value:

```text
false
```

When false:

- Use local fallback walk data.
- Make no database/API request for walks.

When true:

- Attempt to retrieve walks from the configured remote source.
- If the remote request fails, gracefully fall back to local data where practical.

Do not hard-code data-source decisions inside page components.

Environment configuration should contain any future remote endpoint or public client configuration.

Never commit secrets to the repository.

## 5. Suggested Project Structure

```text
src/
├── components/
│   ├── Header.astro
│   ├── Footer.astro
│   ├── Hero.astro
│   ├── SectionHeading.astro
│   ├── WalkCard.astro
│   ├── WalkList.astro
│   ├── Stats.astro
│   ├── GalleryPreview.astro
│   └── SocialLinks.astro
│
├── data/
│   ├── walks.json
│   ├── stats.json
│   └── gallery.json
│
├── services/
│   └── walks/
│       ├── index.ts
│       ├── staticWalkProvider.ts
│       └── remoteWalkProvider.ts
│
├── types/
│   └── walk.ts
│
├── layouts/
│   └── BaseLayout.astro
│
├── pages/
│   ├── index.astro
│   ├── about.astro
│   ├── walks.astro
│   ├── gallery.astro
│   ├── stats.astro
│   └── join.astro
│
└── styles/
    └── global.css

public/
├── images/
│   ├── hero/
│   ├── walks/
│   └── gallery/
└── icons/
```

Adjust structure if required by the chosen Astro version, but preserve separation between UI, data, and data providers.

## 6. Walk Data Model

Use a consistent typed model.

Example:

```typescript
export interface Walk {
  id: string;
  title: string;
  location: string;
  date: string;
  description?: string;
  speciesCount?: number;
  participantCount?: number;
  ebirdUrl?: string;
  registrationUrl?: string;
  image?: string;
}
```

Use ISO date format:

```text
YYYY-MM-DD
```

Avoid requiring a manually maintained `past` or `upcoming` status if the status can be derived from the date.

## 7. Static Fallback Data

Initial development must use local fallback data.

Example `walks.json`:

```json
[
  {
    "id": "hesaraghatta-2026-08",
    "title": "Hesaraghatta Bird Walk",
    "location": "Hesaraghatta",
    "date": "2026-08-09",
    "description": "A morning bird walk exploring the grasslands."
  },
  {
    "id": "saul-kere-2026-06",
    "title": "Saul Kere Bird Walk",
    "location": "Saul Kere",
    "date": "2026-06-21",
    "description": "A community bird walk around the lake.",
    "speciesCount": 36,
    "participantCount": 12
  }
]
```

These values are placeholders and should be easy to replace with real club data.

## 8. Walk Classification

Create reusable logic to classify walks.

Conceptually:

```typescript
const upcomingWalks = walks
  .filter((walk) => new Date(walk.date) >= today)
  .sort(byDateAscending);

const pastWalks = walks
  .filter((walk) => new Date(walk.date) < today)
  .sort(byDateDescending);
```

Be careful with timezone/date parsing. Prefer comparing normalized calendar dates rather than relying on ambiguous local midnight parsing.

The same classification logic should work regardless of the data provider.

## 9. Walk Data Service

Expose a single function to the rest of the application.

Example:

```typescript
getWalks(): Promise<Walk[]>
```

Internally:

```text
if USE_REMOTE_WALKS
    try remote provider
    catch -> fallback provider
else
    static provider
```

The UI should only call the common service.

This allows database integration later without redesigning the pages.

## 10. Important Static-Site Consideration

Astro code executed only at build time will not retrieve newly added remote walk data until Netlify performs another deployment.

Therefore, when dynamic walk data is enabled in the future, frequently changing walk data must be fetched at runtime from the visitor's browser if the goal is to update walks without triggering Netlify deployments.

The initial static implementation does not need this runtime behavior.

Design the future remote provider accordingly.

Possible future flow:

```text
Browser
   |
   +--> Static website from Netlify
   |
   +--> Walk data directly from Supabase/API
```

Do not proxy routine walk-data requests through a Netlify Function unless there is a specific requirement for it.

## 11. Remote Data Loading UX

When remote data is eventually enabled:

1. Render the page structure immediately.
2. Show a subtle loading state for dynamic walk content if necessary.
3. Fetch remote data.
4. Render walk information.
5. Handle empty results gracefully.
6. Handle network/API failures gracefully.

A failed remote request must not break the overall website.

For an empty upcoming-walk list, show a message directing visitors to social channels.

## 12. Homepage Implementation

Keep the homepage primarily static.

Recommended sections:

```text
Header
Hero
Who We Are
What We Do
Our Journey
Recent Walks
Gallery Preview
Walk With Us
Social Links
Footer
```

Only `Recent Walks` may eventually depend on remote data.

Do not make the entire homepage dependent on a database/API request.

Limit recent walks displayed on the homepage to approximately 2–3 entries.

## 13. Our Walks Page

Use one `/walks` page.

Do not implement individual walk pages initially.

Structure:

```text
Our Walks

Upcoming
- upcoming walk cards
OR
- "More walks coming soon" fallback

Past Walks
- reverse chronological walk summary
```

Keep walk cards concise.

Do not require every optional field.

The component must render cleanly when only title, location, and date are available.

## 14. Image Strategy

Images are likely to be the largest source of bandwidth.

Requirements:

- Prefer AVIF where supported, with WebP fallback if practical.
- Provide responsive image sizes.
- Use a smaller hero asset for mobile.
- Lazy-load below-the-fold images.
- Do not lazy-load the primary above-the-fold hero if it is the Largest Contentful Paint element.
- Set explicit width and height/aspect ratio to reduce layout shift.
- Keep gallery images off the homepage except for a small preview.
- Use thumbnails rather than loading full-resolution images into gallery grids.

Suggested targets:

```text
Hero mobile:
~800 px wide

Hero desktop:
~1600 px wide

Gallery thumbnails:
~400 px wide

Full gallery images:
~1200–1600 px wide
```

Optimize final file sizes based on visual quality rather than blindly enforcing dimensions.

## 15. JavaScript Strategy

Keep client-side JavaScript minimal.

JavaScript should primarily be used for:

- Mobile navigation
- Optional gallery lightbox
- Future runtime walk-data fetching

Prefer CSS for:

- Layout
- Responsive design
- Hover/focus states
- Simple transitions

Avoid large UI libraries for basic interactions.

## 16. Styling

Use a mobile-first responsive CSS strategy.

Visual direction:

- Modern outdoor community
- Minimal nature-inspired palette
- Strong typography
- Generous whitespace
- Restrained rounded corners
- Subtle borders
- Minimal shadows
- Photography as the primary visual personality

Prefer a system font stack initially to avoid external font requests.

Example:

```css
font-family:
  Inter,
  ui-sans-serif,
  system-ui,
  -apple-system,
  BlinkMacSystemFont,
  "Segoe UI",
  sans-serif;
```

Do not require Inter to be downloaded unless it is self-hosted intentionally.

## 17. Accessibility

Implement:

- Semantic HTML
- Correct heading hierarchy
- Keyboard-accessible navigation
- Visible focus states
- Accessible hamburger menu
- Descriptive image alt text
- Sufficient color contrast
- Reduced-motion support where animations exist
- Touch targets appropriate for mobile devices

Do not use bird species names alone as alt text when the photograph's context is important.

## 18. Performance

Target a lightweight initial page load.

Guidelines:

- Minimize JavaScript.
- Optimize images.
- Avoid unnecessary third-party scripts.
- Avoid autoplay media.
- Avoid loading gallery assets globally.
- Avoid external font requests initially.
- Use browser caching for static assets.
- Load only assets required by the current page.

Run Lighthouse during development with particular attention to mobile performance.

## 19. Netlify Deployment Strategy

Production deployments consume credits and should be treated as a limited resource.

Avoid using production deployments as a content-management mechanism for frequently changing walk data.

During development:

- Use local development extensively.
- Validate changes locally before pushing.
- Batch changes where practical.
- Be mindful of workflows that automatically trigger production deploys for every commit.

Consider using branch/deploy configuration appropriate to the repository workflow so routine development does not unnecessarily create successful production deployments.

The final deployment model should be:

```text
Website code/design change
        |
        v
Netlify deployment


Routine walk-data change
        |
        v
External data update
        |
        v
No Netlify deployment
```

## 20. Future Database Integration

Database integration is explicitly deferred.

When ready:

1. Create/configure the remote walk data source.
2. Implement `remoteWalkProvider`.
3. Configure public environment variables.
4. Enable runtime client-side fetching.
5. Test loading, empty, and error states.
6. Verify static fallback behavior.
7. Enable the feature flag.

Possible configuration:

```text
PUBLIC_USE_REMOTE_WALKS=true
```

The UI should require little or no modification at this stage.

## 21. Initial Acceptance Criteria

The first milestone is complete when:

- The site runs locally.
- All primary pages exist.
- Mobile navigation works.
- The homepage communicates the club's identity clearly.
- The design is polished on common mobile screen sizes.
- Desktop layouts are responsive and visually balanced.
- Walks are displayed from static fallback data.
- Upcoming and past walks are classified correctly.
- Empty upcoming-walk state works.
- No database is required.
- No remote walk API calls are made.
- Gallery images are optimized and lazy-loaded appropriately.
- The site remains usable with JavaScript disabled except for explicitly interactive enhancements.
- Lighthouse performance and accessibility are reviewed.
- The codebase is structured so remote walk data can be enabled later without rewriting UI components.

## 22. Implementation Priority for Coding Agent

Work in this order:

1. Establish project structure and base layout.
2. Implement global mobile-first design system.
3. Build header and responsive navigation.
4. Build homepage UX using placeholder/static content.
5. Build reusable walk components.
6. Implement static walk provider and classification logic.
7. Build Our Walks page.
8. Build About, Gallery, Stats, and Join Us pages.
9. Optimize responsive behavior.
10. Optimize images and loading behavior.
11. Review accessibility.
12. Review mobile Lighthouse results.
13. Do not implement database connectivity yet.

The coding agent should prioritize a polished UX and maintainable component structure over adding backend functionality.
