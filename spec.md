# Specification: Curated Related Records

## Objective

Let WordPress editors curate any number of related records for each eligible record on the Bangkok Kunsthalle (`/bk/`, internal site ID `bkkk`) and Khao Yai Art Forest (`/kyaf/`, internal site ID `kyaf`). Display those recommendations as portrait-image cards at the bottom of each corresponding detail page.

This document is an implementation plan only. No application or WordPress code has been changed as part of writing this specification.

## Requirements

### Editorial relationships

1. Add a relationship selector to the WordPress edit screen for records of every supported type: exhibitions, activities, moving image, artists/residency, and blog.
2. Editors may select zero or more related records per record, with no fixed count limit. Selection must be searchable and support records from all five supported types.
3. Relationships are site-local: a `bkkk` record may link only to other `bkkk` records, and a `kyaf` record only to other `kyaf` records. The editor UI must not offer records from the other site.
4. Selection order is editorial order and is preserved on the front end. Do not generate automatic recommendations from tags or other metadata.
5. Prevent a record from linking to itself and remove duplicate selections.

### Detail-page presentation

1. Render selected relationships on all eligible detail pages for both sites, reusing the existing `Related Content` section title and site language handling.
2. Place the section at the bottom of the detail page, after the main content, embedded video, and any existing detail sections. Do not show a second/duplicate related section.
3. Show all selected records in their editorial order. If none are selected or no valid records are returned, render no recommendation section.
4. Use portrait images with an approximately 3:4 aspect ratio. Keep the existing responsive card layout, image loading behavior, typography, and visual treatment consistent with the current site design.
5. Each card links to the correct detail route for its record type under the current site prefix. Artists/residency records use the existing artists detail route.
6. Preserve the card title and any optional category/date metadata currently supported. Use the appropriate English or Thai title.

### Supported type-to-route mapping

| WordPress record type | Front-end relation type | Detail route segment |
|---|---|---|
| Exhibition | `exhibitions` | `exhibitions` |
| Activity | `activities` | `activities` |
| Moving image | `moving-image` | `moving-image` |
| Artist / residency | `residency` | `artists` |
| Blog | `blog` | `blog` |

## Constraints

- Keep `/bk/` mapped to internal site ID `bkkk` and `/kyaf/` mapped to `kyaf`.
- WordPress remains the editorial source of truth; the front end must not hard-code recommendation lists.
- Keep the existing REST response contract compatible where practical. The current mapper reads `related_content_json` or `related_content`; introduce a normalized REST shape or adapter without breaking legacy records during migration.
- Include stable record identifiers, slug, type, site, bilingual title, and featured image in the front-end relationship payload. Optional category/date fields may be included where available.
- Filter out cross-site, unsupported-type, self, duplicate, or malformed relationships defensively in the front end, even if the editor UI already prevents them.
- Do not expose a public unauthenticated WordPress write endpoint for relationship updates. Use the authenticated WordPress editor and existing secure CMS mechanisms.
- WordPress/CMS changes are separate from the static Next.js deploy. Use staging WordPress for development and verification; production WordPress and production hosting remain out of scope.
- Do not commit credentials or stale generated `out/` output. Normal source deployment is handled by the staging GitHub Actions workflow.
- Implementation must follow the repository's current Next.js guidance in `node_modules/next/dist/docs/` before changing application code.

## Architecture

```text
WordPress editor (site-scoped selector; no count limit)
        |
        | stores ordered references to eligible WP records
        v
WordPress REST response
        |
        | normalized related records: id, slug, type, site,
        | title, featured image, optional category/date
        v
lib/wp-mappers.ts
        |
        | validate/map references into RelatedContentItem[]
        v
Detail pages for BK and KYAF
        |
        | existing RelatedContentSection, rendered last
        v
Responsive portrait recommendation cards (same-site links only)
```

The current `RelatedContentSection` is shared by exhibition, activity, moving-image, artist, and blog detail pages on both sites. It de-duplicates records, filters by site, and maps residency records to the artists route. The mapper currently parses JSON from WordPress meta. The implementation should extend this established path rather than add per-page recommendation implementations.

For the CMS field, use a WordPress/JetEngine relationship selector that can search across the supported record types while enforcing the current site and allowing an unrestricted number of relationships. If JetEngine cannot provide the required cross-type, site-scoped selector, document and implement the smallest authenticated WordPress admin/meta integration that exposes the same REST contract; do not add a public write API.

## Implementation steps

1. **Confirm CMS data shape**
   - Inspect the staging WordPress post types, site-identification metadata, and current `related_content_json` / `related_content` values.
   - Select the supported WordPress relationship-field implementation and define a stable REST representation for ordered references.
2. **Add the WordPress editor relationship control**
   - Add the selector for all five supported types on both sites.
   - Enforce site-local candidates, ordering, and self/duplicate prevention without a relationship count limit.
   - Ensure saved relationships are available in the REST data consumed by the static build and runtime detail shell.
3. **Normalize relationship data in the frontend**
   - Update `lib/wp-mappers.ts` and related types to consume the REST representation and preserve compatibility with valid legacy JSON metadata during migration.
   - Validate allowed types, site, IDs, slug, title, and image; preserve editorial order without truncating the relationship list.
4. **Update the shared recommendation presentation**
   - Keep `RelatedContentSection` as the shared renderer and retain its current translated title and card metadata.
   - Change image presentation to portrait 3:4 and ensure the section appears once, last, after video and other detail sections.
   - Confirm correct route mapping for each supported type on both site prefixes.
5. **Verify CMS, REST, and frontend end to end**
   - Create representative staging records for every supported type on both sites and test zero, one, and multiple relationships.
   - Confirm the editor rejects cross-site/self/duplicate selections and that the REST payload preserves all selected IDs in order with required display fields.
   - Verify rendered cards, links, localization, responsive layout, empty state, and static build through the configured GitHub Actions workflow.

## Success criteria

- Editors can select and order any number of records from the five supported types for each eligible post in WordPress.
- The editor only offers same-site candidates; no recommendation can navigate from `/bk/` to `/kyaf/` or vice versa.
- All five types work as sources and destinations on both sites, with artists/residency linking to the artists route.
- Detail pages render the selected cards once at the bottom, after video and other sections, with portrait images and correct bilingual titles.
- Selection order is maintained; self-links, duplicates, invalid types, malformed entries, and empty relationship fields produce no bad cards.
- Existing content without relationship data continues to build and render normally.
- Staging build and deployment workflow succeeds, with no production systems or credentials changed.
