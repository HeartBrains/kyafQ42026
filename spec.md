# Specification: Safe production-like duplicate of the site

## Objective

Create an isolated duplicate of this project so work can continue safely without changing the current live site. The duplicate includes:

- A separate Git repository containing the Next.js application and its deployment workflow.
- A new private GitLab project containing an independent working backup of the duplicate repository.
- A separate production-like hosting target for the static Next.js output.
- A cloned WordPress instance (database, media/uploads, themes/plugins, and configuration) used as the duplicate site's CMS.
- Separate domains/subdomains, credentials, secrets, deployment triggers, and operational ownership so the two systems can be operated independently.

The WordPress clone is an exact private copy as requested. It must remain access-restricted until ownership, DNS, SSL, and integration checks are complete.

The live website is strictly out of scope for mutation. The duplicate setup must be read-only against live systems and must fail closed if any repository, host, DNS, database, credential, or integration target resolves to production.

## Current system context

- Next.js App Router 16 with `output: "export"` and `trailingSlash: true`.
- Static files are generated in `out/` and currently deployed to Hostinger.
- GitHub Actions builds with Node 20 and commits `out/` back to the deployment branch.
- The frontend reads WordPress REST data from `https://content.khaoyaiart.org/wp-json/wp/v2` (or configured `WP_BASE_URL` / `NEXT_PUBLIC_WP_BASE_URL`).
- The application serves both `/bk/` (internal site ID `bkkk`) and `/kyaf/` URL spaces.
- Existing build-time secrets include WordPress URL/authentication and site/base URLs; these must not be copied into source control.

## Requirements

### Repository and source control

1. Create a new private repository from the current repository state, preserving history unless the owner explicitly chooses a fresh-history copy.
2. Use a distinct default branch and repository name; do not point the duplicate's automation at the original repository.
3. Copy source, public assets, configuration, workflow files, and the checked-in `out/` convention required by the current Hostinger deployment. Do not copy credentials, local `.env` files, or unrelated runtime state.
4. Update repository references, badges, deployment comments, and documentation so the duplicate is self-contained and clearly labeled as the duplicate environment.
5. Keep the original repository and its production branch untouched during the duplication.

### WordPress clone

1. Clone the WordPress database and all required filesystem content, including uploads, active theme, plugins, custom code, and multisite configuration if present.
2. Preserve post types, taxonomies, media references, permalinks, users/roles, and site configuration so the duplicate exposes the same REST API shape and content.
3. Replace the clone's canonical URL/home URL and hard-coded production URLs with the duplicate WordPress URL, using a reversible search/replace procedure that does not corrupt serialized values.
4. Configure the duplicate REST endpoint and credentials for the duplicate frontend only.
5. Keep the copy private behind host-level access control (or equivalent) while migration and verification are in progress.
6. Because this is an exact private copy, preserve integrations only after confirming they are intentionally shared or have duplicate-safe credentials/endpoints. Record any integration that must remain pointed at production and obtain explicit approval before enabling it.

### GitLab backup copy

1. Create a new private GitLab project for the duplicate repository backup.
2. Copy the duplicate repository's source and history into GitLab as an independent working copy; this is not a two-way mirror and must not be used by deployment automation.
3. Keep GitLab project visibility private and grant access only to approved maintainers.
4. Define a repeatable manual backup procedure (for example, push the selected duplicate branch/tags to GitLab) and record the last successful backup commit and timestamp.
5. Define a restore procedure that can clone the GitLab project into a fresh repository and verify that the source, history, workflows, and configuration are usable.
6. Do not copy CI secrets, host credentials, `.env` files, database dumps, or WordPress uploads into the GitLab repository. Store WordPress backups in approved encrypted backup storage instead.

### Hosting and deployment isolation

1. Provision a separate production-like host/site for the exported Next.js files, with its own document root, SSH/deployment credentials, domain or subdomain, SSL certificate, and backups.
2. Create a separate CI/CD workflow or repository secrets set for the duplicate. It must build from the duplicate repository and publish only to the duplicate host.
3. Configure duplicate values for `WP_BASE_URL`, `NEXT_PUBLIC_WP_BASE_URL`, `WP_AUTH_USER`, `WP_AUTH_PASS`, `BKKK_BASE_URL`, `KYAF_BASE_URL`, and `SITE_URL` through secret/configuration management.
4. Ensure cache/CDN, robots, sitemap, analytics, webhooks, cron jobs, and deploy triggers are distinguishable from production and cannot overwrite production artifacts.
5. Do not change production DNS or deployment credentials as part of the duplication. DNS cutover, if later requested, is a separate change with rollback instructions.
6. Add a deployment preflight that prints and validates the repository, branch, destination host, document root, WordPress base URL, and site URLs; abort if any value matches a live production target.
7. Use separate deploy keys/tokens with no permission to the live repository, live host, live database, or live WordPress administration.
8. Keep the duplicate on a distinct hostname and document root; do not use production DNS records, redirects, shared writable directories, or shared deployment artifacts.

### Verification and rollback

1. Capture pre-copy identifiers and backups for the source repository, WordPress database/files, and current production deployment configuration.
2. Verify that the duplicate builds from a clean checkout and that generated pages consume the duplicate WordPress API.
3. Verify both site URL spaces (`/bk/` and `/kyaf/`), representative list/detail pages, images, language behavior, sitemap, robots file, and the smart 404 behavior.
4. Verify that the original site still serves its original content and that no duplicate build can publish to it.
5. Document a rollback by disabling the duplicate deployment, restoring the duplicate host/database from backup, and deleting only duplicate DNS/secrets/resources.

## Constraints

- No implementation or production mutation is part of this specification phase.
- The duplicate must be isolated before any code or content fixes are tested.
- The WordPress copy is private and exact; do not anonymize or selectively omit content unless a later approved change supersedes this requirement.
- Credentials and tokens must remain in secret storage; never commit them to Git or place them in `public/` or `out/`.
- WordPress URL replacement must be serialization-safe and preserve attachment paths and REST responses.
- Existing URL mappings remain authoritative: `/bk/` maps to `bkkk`, and `/kyaf/` maps to `kyaf`.
- The static-export limitation remains: new WordPress slugs require a rebuild unless handled by the runtime smart 404 shell.
- Any outbound email, payment, webhook, analytics, or third-party write operation must be explicitly reviewed before enabling it on the clone.
- The duplicate must be independently recoverable without relying on production resources or credentials.
- The GitLab project is an independent backup/working copy only; no automatic two-way synchronization or deployment from GitLab is required.
- No duplicate build, deploy, migration, URL replacement, cron job, webhook, or integration may write to the live website or its WordPress instance.
- Live credentials are never copied, reused, mounted, or granted to duplicate CI, hosting, WordPress, or GitLab operations.
- The default posture is deny-by-default: duplicate services may read a live source only for the controlled copy operation, then must be disconnected from live endpoints.

## Target architecture

```text
Duplicate Git repository
        |
        | CI build (Node 20, npm ci, npm run build)
        | secrets point only to duplicate services
        v
Duplicate static host  <-- separate domain/subdomain + SSL + document root
        |
        | browser fetches / build-time REST requests
        v
Duplicate WordPress host
        |-- cloned database
        |-- cloned wp-content/uploads
        |-- cloned plugins/themes/custom code
        |-- private REST API + duplicate credentials
        `-- reviewed integrations and scheduled jobs

Independent GitLab backup project (private, manual push/restore path)
        ^
        | selected source/history backup; no deployment relationship
        |
Duplicate Git repository
```

The duplicate frontend remains a static export. The duplicate WordPress instance is the content authority for its build and runtime API calls; it must not share write paths or deployment credentials with production.

## Implementation steps

1. **Inventory and freeze the source**
   - Record the source commit, active branch, deployment workflow, host details, environment variables, WordPress version, plugins/themes, cron jobs, integrations, DNS, and backup status.
   - Confirm the source repository is clean or record intentional uncommitted changes before copying.

2. **Create the repository duplicate**
   - Create the private destination repository and copy history/source from the recorded commit.
   - Change repository-specific names, URLs, workflow triggers, branch protections, and secret names as needed.
   - Confirm the duplicate workflow can never target the original repository or host.

3. **Create the GitLab backup project**
   - Create a new private GitLab project in the approved namespace.
   - Push the selected duplicate branch and tags, then record the backup commit and timestamp.
   - Verify the GitLab copy has no secrets and can be cloned independently.

4. **Clone WordPress**
   - Take verified database and filesystem backups.
   - Provision the separate WordPress host and restore the database/files.
   - Perform serialization-safe URL replacement, set duplicate site URLs, configure HTTPS, and validate REST endpoints and media URLs.
   - Recreate users/roles and integrations according to the exact-copy policy; keep the clone private during this phase.

5. **Connect the duplicate frontend**
   - Configure duplicate CI secrets and site URLs.
   - Update only environment/configuration references required to target the duplicate WordPress and static host.
   - Run a clean dependency install and static build; publish to the duplicate document root.

6. **Validate behavior and isolation**
   - Test representative pages and API responses listed in the success criteria.
   - Inspect generated HTML for duplicate URLs and absence of unintended production URLs.
   - Test deployment permissions, backups, logs, SSL, cache invalidation, robots/sitemap behavior, and rollback.
   - Run the deployment preflight with intentionally incorrect/live-target values and confirm it aborts safely.
   - Confirm production remains unchanged throughout by checking live content, deployment logs, DNS, filesystem timestamps, and WordPress audit logs where available.

7. **Handover and operationalize**
   - Record domains, access owners, secret locations, backup schedules, restore steps, integration decisions, and known differences.
   - Mark the duplicate ready for safe fixes only after explicit isolation sign-off.

## Success criteria

- A separate private repository exists with expected source history and no credentials committed.
- A new private GitLab project contains a verified independent copy of the duplicate repository, including expected history and no secrets.
- A separate production-like static host serves the duplicate frontend over HTTPS.
- The cloned WordPress instance is private, restores successfully from backup, and exposes the same required content types, media, users/roles, and REST API behavior as the source.
- The duplicate frontend builds cleanly with Node 20 and reads exclusively from the duplicate WordPress API.
- `/bk/` and `/kyaf/` routes, representative listing/detail pages, images, language switching, sitemap, robots, and smart 404 fallback work on the duplicate domain.
- CI/deployment credentials and triggers are isolated; a duplicate deployment cannot modify the original repository, host, database, or `out/` artifacts.
- Isolation checks prove that the duplicate cannot deploy to, write to, redirect traffic from, or alter content in the live website.
- Exact-copy integrations are documented and intentionally enabled or disabled; no unreviewed outbound side effects occur.
- Backups and a tested rollback procedure exist for the duplicate, and production health checks show no change after the exercise.
- A GitLab restore drill can recreate a usable working repository without access to the original repository or production credentials.

## Recorded decisions and pre-release inputs

- Destination repository is the private GitHub repository `HeartBrains/kyafQ42026`; verify its protected/default branch as part of release preparation.
- Duplicate frontend is approved as `https://dev.khaoyaiart.org`; duplicate WordPress is `https://q42026.content.khaoyaiart.org`.
- Hostinger is the duplicate static/WordPress host; deployment is through the isolated GitHub/Hostinger workflow rather than direct production access.
- Staging remains blocked from indexing throughout this work.
- Outbound integrations default to disabled on staging unless a staging-safe destination and owner approval are recorded.
- The GitLab backup is a new private project named `kyafQ42026`; its namespace/access owner and the backup retention/storage owner must be recorded before the backup and restore-drill steps are signed off. These are operational inputs, not reasons to weaken repository or staging isolation.

---

# KYAF v2 catalog and design implementation plan

## Scope and objective

Implement the KYAF/BKKK catalog and visual updates represented by the supplied September 2026 design references. Work happens first in the isolated `kyafQ42026` repository and staging environment:

- Frontend: `https://dev.khaoyaiart.org`
- WordPress staging: `https://q42026.content.khaoyaiart.org`
- Source repository: `HeartBrains/kyafQ42026`
- Production remains unchanged until a separately approved release.

The plan is organized by screen and implementation phase. The proposed 14-day calendar is intentionally omitted; delivery is controlled by dependency gates and acceptance criteria instead of fixed dates.

GA4 is deferred. No analytics property, Measurement ID, analytics events, or production tracking changes are required for this scope.

## Current technical baseline

- Next.js App Router with static export to `out/`.
- WordPress REST API is the currently working content transport; the frontend must continue to support the existing REST response shapes while the backend schema is prepared.
- WordPress taxonomy, relations, custom fields, and WPGraphQL are not configured yet.
- Hostinger pulls the duplicate repository's generated `out/` output for the staging frontend.
- The current duplicate build must remain pointed at staging WordPress and must not fall back to production endpoints.
- Preserve the repository's URL-to-site mapping: `/bk/` uses internal site ID `bkkk` and `components/bkkk/`; `/kyaf/` uses internal site ID `kyaf` and `components/kyaf/`. Any new CPT/detail route must also be registered in `app/not-found.tsx` when runtime fallback support is required.
- Existing source contains some absolute production or placeholder service URLs outside the main content adapter. Phase 0 must inventory every outbound browser/build request, including contact submission and tracking, and replace, disable, or explicitly approve it for staging. Staging must never submit a form or analytics/conversion event to production.

## Requirements by screen

### 1. Home page

- Add a two-state hero switcher for Khao Yai Art Forest and Bangkok Kunsthalle.
- Use the correct hero image, title/mark, overlay treatment, and soft fade transition for each state.
- Place the vector logo/mark at the lower-right of the hero at desktop and the corresponding safe position on mobile.
- Make slideshow/hero items deep-link to the relevant section or detail route; links must be keyboard accessible and preserve normal browser navigation.
- Remove the content sections marked for removal in the design reference and rebalance bottom spacing.
- Keep the footer visually anchored after the hero/slideshow boundary without covering content or trapping keyboard focus.
- Preserve both `/kyaf/` and `/bk/` site modes and their language behavior.
- Default `/kyaf/` to the Khao Yai state and `/bk/` to the Bangkok Kunsthalle state. The switcher is user-controlled and does not auto-rotate. Each state links only to an approved route within its matching site prefix.

### 2. Activities listing/archive

- Add the activity tag control with `All`, `Talks & Lectures`, `Performances`, `Screening`, `Workshops`, `Gastronomy`, and `Sound`.
- Render the control as a horizontal, touch-scrollable strip on narrow screens.
- Filter cards client-side without a full document reload.
- Synchronize the selected tag with `?tag=<slug>`; loading a shared URL must restore the same filter.
- Define empty, loading, error, and reset states.
- Keep the existing site filter (`kyaf`/`bkkk`) and current/upcoming/past grouping behavior intact unless the approved design explicitly changes it.
- Browser Back/Forward, direct reload, and copied URLs must retain the filter. Missing or unknown tags must fall back to `All` without an error or redirect loop.

### 3. Activity and exhibition detail pages

- Recompose the detail view as an editorial two-column layout: summary/date/meta on the left and long-form/editorial content on the right.
- Collapse to a readable single-column layout on mobile.
- Support an optional video embed with an accessible large play affordance and safe aspect ratio.
- Support a responsive image gallery with stable dimensions, captions/credits where supplied, and no layout shift.
- Establish title and supporting-information hierarchy from the design tokens.
- Add card hover/focus treatment for secondary imagery or short preview media only when that asset exists; never hide the primary title/link.
- Keep detail routes statically buildable and retain the smart 404/runtime fallback behavior for newly added slugs.
- Validate video providers/URLs before embedding, use privacy-conscious embed settings where the provider supports them, and show a non-broken fallback when a video is unavailable.
- Require meaningful image alternative text and optional captions/credits from WordPress; decorative images use empty alternative text.

### 4. Related-content section

- Add a reusable `RelatedContentSection` to detail pages for exhibitions, activities, residency, archives/blog, and moving-image content.
- Display related cards with image, title, date, content type, and available tag/category.
- Support bidirectional relations from WordPress and map them to stable frontend route types.
- Hide the section when no related content exists; do not render an empty heading or spacer.
- Keep cards keyboard accessible and ensure hover behavior has an equivalent focus treatment.
- Preserve editor-defined relation order, display at most three cards per related-content group, deduplicate records, prevent the current record from relating to itself, and ensure every card resolves to the correct `/bk/` or `/kyaf/` route. If stored order is unavailable, use newest published first with ID as a stable tie-breaker.

### 5. Global visual/performance system

- Define shared design tokens for the supplied palette and spacing; keep tokens in one source rather than scattering literal values.
- Load Prompt and Inter using a font-swap strategy with appropriate fallbacks and Thai readability.
- Reserve image dimensions/aspect ratios to reduce cumulative layout shift.
- Preserve static-host `.htaccess` behavior and verify cache rules do not cache HTML or stale deployment manifests incorrectly.
- Measure performance in staging after the visual work. Lighthouse ≥90 and LCP <1.5s are targets, not a reason to hide content or degrade accessibility.
- Defer GA4 and custom event instrumentation until a separate approved analytics task supplies the Measurement ID and event ownership.

## WordPress/backend work (prerequisite)

Backend schema is currently unconfigured. Before frontend filtering and relations are considered complete:

1. Create a non-hierarchical `activity_tag` taxonomy and expose it on the activity CPT. Use stable English slugs: `talks-lectures`, `performances`, `screening`, `workshops`, `gastronomy`, and `sound`. `All` is a UI state, not a stored term.
2. Map existing activity records to the taxonomy and produce a reviewable mapping report for AE/client approval.
3. Add custom fields for video embed URL, gallery/media, hero landscape/portrait assets, and any secondary-card image/preview fields required by the design.
4. Configure bidirectional relations among the five content families: exhibitions, activities, residency, archives/blog, and moving-image. Record relation direction, cardinality, and empty-state behavior.
   - Required initial relation pairs from the supplied brief are exhibition ↔ activity, exhibition ↔ residency, exhibition ↔ archive/blog, activity ↔ residency, and activity ↔ archive/blog.
   - The schema must technically permit editor-selected relationships between any of the five families, including moving image. Seed/migrate only the five explicitly supplied pairs above; additional pairs remain empty until editors create them.
5. Decide and document the API contract. WPGraphQL may be enabled for relations if it is approved and tested, but the first implementation must not break the currently working REST API. A REST adapter is required until GraphQL queries and permissions are verified in staging.
   - Map editorial names to the actual REST slugs used by this repository, including `activity`, `exhibition`, `moving_image`, `residency_artist`, and `blog_post`, and verify both `kyaf` and `bkkk` site filters.
6. Test authenticated and unauthenticated read access, pagination, media URLs, taxonomy filtering, relation queries, and staging CORS before frontend integration.
7. Take a WordPress staging backup before schema migration and record a rollback procedure for taxonomy, fields, and relations.

## Frontend architecture

```text
WordPress staging schema
  |-- activity_tag taxonomy
  |-- video/gallery/secondary-image fields
  |-- bidirectional relations
  `-- REST contract (GraphQL adapter optional after verification)
             |
             v
Data adapter layer
  |-- normalize taxonomy, relation, media, and date shapes
  |-- preserve existing site/CPT mappings
  `-- return typed empty/loading/error states
             |
             +--> HeroDualSwitcher / slideshow links
             +--> ActivityTagFilter + URL search params
             +--> editorial detail layout + video/gallery
             +--> RelatedContentSection
             `--> shared cards, design tokens, fonts, and footer
             |
             v
Static Next.js export (`out/`) -> GitHub Actions -> Hostinger staging
```

Use small, reusable components rather than duplicating page-specific filtering, cards, relation mapping, or media logic. Keep browser-only state in client components and keep build-time data fetching resilient to empty or temporarily unavailable WordPress responses.

## Implementation phases and gates

### Phase 0 — baseline and safety

- Create a development branch from the tagged staging backup (`backup-staging-2026-09-23`) and keep production branches untouched.
- Capture screenshots and route/API baselines for home, activities, one activity detail, one exhibition detail, one residency, one blog/archive, and one moving-image page.
- Confirm staging-only environment variables and run the duplicate-target preflight.
- Inventory absolute URLs and network destinations in source and generated output. Contact forms, search, media, API requests, webhooks, analytics, and conversion tracking must use staging-safe destinations or be disabled with an explanatory UI.

**Gate A:** baseline pages, current build, staging API, and restore tag are recorded.

### Phase 1 — backend schema and content mapping

- Implement taxonomy, terms, field definitions, and relations in WordPress staging.
- Map existing content and verify REST/GraphQL responses.
- Obtain AE/client approval for taxonomy labels, relation semantics, and empty states.

**Gate B:** schema review passes and representative API fixtures are available.

### Phase 2 — home and shared visual foundations

- Add design tokens, fonts, image sizing, hero switcher, slideshow deep links, logo placement, removed sections, and footer behavior.
- Validate desktop, tablet, mobile, keyboard navigation, reduced motion, and both site modes.

**Gate C:** visual review passes against the supplied design references without regressions to existing routes.

### Phase 3 — activities and detail templates

- Build the tag filter and URL synchronization.
- Implement editorial detail layout, video embed, gallery, typography hierarchy, and card hover/focus behavior.
- Verify all existing detail route types and newly added staging content.

**Gate D:** activities and detail pages pass functional, responsive, accessibility, and build tests.

### Phase 4 — relations and performance

- Implement the normalized relation adapter and reusable related-content section.
- Add auto-hide behavior, route validation, media fallbacks, cache rules, and performance checks.
- Keep GA4 explicitly deferred.

**Gate E:** relation fixtures pass, empty states are correct, and performance/accessibility targets are measured.

### Phase 5 — QA, client review, and release preparation

- Run clean `npm ci` and `npm run build` with staging values.
- Validate generated `out/`, sitemap, robots policy, canonical URLs, asset paths, and Hostinger staging deployment.
- Run smoke tests on mobile and desktop and record defects in a feedback log.
- Fix approved feedback on the development branch, rebuild, and repeat verification.
- Create a release tag and obtain explicit production approval before merging or changing production services.

## End-to-end verification matrix

The implementation is not complete merely because it builds. Each row must have recorded evidence (automated result where practical, otherwise a screenshot/video and tester note).

| Area | Required checks | Pass condition |
|---|---|---|
| Environment isolation | Inspect source, built HTML/JS, and browser network log; exercise contact/search/media flows | No production WordPress, production form, production webhook, or analytics/conversion request is sent from staging |
| Home (`/`, `/kyaf/`, `/bk/`) | Both hero states, initial state, switch/fade, deep links, logo, removed content, footer, EN/TH | Matches approved reference; links resolve; no overlap, focus loss, or unexpected motion |
| Activities (`/kyaf/activities/`, `/bk/activities/`) | All six terms plus `All`; mouse, touch, keyboard; direct `?tag=` load; Back/Forward; invalid tag; empty/error state | Correct cards and URL state without full reload; grouping/site isolation remains correct |
| Detail routes | Representative activity and exhibition in both sites; long/short copy; missing video/gallery; new post added after build | Layout/media are resilient; static routes work; supported new slugs use the smart shell rather than a dead 404 |
| Related content | Representative and empty fixtures for exhibition, activity, residency, archive/blog, and moving image | Correct type/site route, ordering and limit; no duplicates/self-links; section absent when empty |
| Responsive/browser | 360px mobile, tablet, and desktop; current Chrome, Safari/WebKit, and Firefox | No clipped controls, unintended horizontal page scroll, unreadable Thai text, or inaccessible hover-only content |
| Accessibility | Keyboard-only journey, visible focus, semantic headings/links/buttons, alt text, reduced motion, basic contrast scan | All core functions work without a pointer and no serious automated accessibility violation remains |
| Static build/output | Clean install and build; inspect `out/`, asset paths, trailing slashes, sitemap, robots, canonical URLs, and representative generated routes | Build exits successfully; expected pages/assets exist; staging is noindex and has no production canonical/sitemap leak |
| Cache/deployment | Verify HTML response policy, immutable hashed assets, deployment webhook/Hostinger pull, and a changed build identifier | HTML can update immediately; versioned assets cache safely; deployed staging matches the tested commit |
| Performance | Run mobile Lighthouse on home, activities, and one media-rich detail page after a cold load | Results are recorded; target score ≥90 and LCP <1.5s, with CLS and accessibility regressions investigated |
| Rollback | Restore previous frontend release/tag and document WordPress schema/data rollback rehearsal | Previous staging version can be restored without touching production |

### Data fixtures required for verification

- At least one activity assigned to each of the six taxonomy terms, plus one untagged activity.
- One record with complete video/gallery/secondary-image data and one record with each optional field absent.
- Related-content fixtures for every supported relation pair, including empty, duplicate, cross-site, and attempted self-relation cases.
- English and Thai content with long titles, long paragraphs, missing translations, and media captions/credits.
- One post created after a static build to verify the documented rebuild/smart-shell behavior.

## Release evidence and decision record

- Record the exact frontend commit, WordPress backup identifier, schema version/config export, build log, deployed build identifier, and test timestamp.
- Attach the route/API baseline, responsive screenshots, browser/network isolation evidence, accessibility report, Lighthouse reports, and known-issues list.
- Record any approved exceptions with owner and follow-up task. Targets that are missed are not silently treated as passed.
- Production release remains a separate decision: client/AE sign-off, a production backup, environment-specific endpoint review, and an approved rollback window are required before merge/deployment.

## Constraints and non-goals

- No production WordPress, repository, DNS, analytics property, or live deployment changes are included.
- GA4 installation and custom events are deferred until a separate approved task provides a Measurement ID and data-governance decision.
- Do not require WPGraphQL for the first frontend milestone if REST can provide the verified contract; introduce GraphQL only after staging tests pass.
- Do not remove existing CPT routes, smart 404 behavior, bilingual behavior, or site mapping while changing the visual layouts.
- Avoid direct edits to third-party plugin files. Backend behavior belongs in plugin configuration, hooks, a custom plugin, or approved theme code.
- All WordPress schema changes require a staging backup and a reversible migration record.
- Static export means newly created slugs require a rebuild unless covered by the runtime smart shell.
- Staging must stay noindex and must not reference production sitemap URLs.
- Keep accessibility, reduced motion, keyboard focus, and Thai typography requirements in scope for every visual component.

## Acceptance and success criteria

- Home switcher, deep links, logo placement, removed sections, footer behavior, and responsive states match the approved design reference.
- Activities display the seven UI states, filter without full reload, preserve `?tag=`, and handle empty/error/loading states.
- Activity and exhibition details use the editorial two-column layout, responsive gallery, optional video, hierarchy, and accessible hover/focus behavior.
- All five content families can show related content from staging relations, and the section hides cleanly when empty.
- WordPress taxonomy, fields, relations, and API responses are documented, backed up, reviewed, and usable by the frontend.
- A clean staging build completes with no errors, and Hostinger serves the resulting static output from `dev.khaoyaiart.org`.
- Browser tests confirm content requests use `q42026.content.khaoyaiart.org`, never the production WordPress endpoint.
- Browser and built-output checks confirm staging sends no forms, webhooks, tracking, or conversion events to production; unavailable staging integrations are safely disabled and documented.
- Staging remains blocked from indexing and does not leak production sitemap URLs.
- Lighthouse and LCP targets are measured and reported, with no regression in route accessibility or content correctness.
- GA4 remains intentionally unconfigured and is tracked as a future task rather than an implicit requirement.
- A tagged backup and rollback instructions exist before each release candidate.
- Every end-to-end verification row has evidence tied to the tested commit and deployed staging build; unresolved failures are listed and approved before the phase gate can pass.

## Deliverables

- WordPress staging schema/configuration and content-mapping report.
- Reusable frontend components and typed data adapters.
- Updated page templates for home, activities, details, and related content.
- Design-token/font/image-performance updates.
- Automated build and staging deployment verification.
- QA checklist, screenshots, API fixtures, Lighthouse results, feedback log, and release/rollback tag.
