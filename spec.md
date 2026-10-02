# Workspace Specification

## Gallery Editor UI: Use JetEngine Field Without Duplicate Panel

### Objective

Avoid confusing editors with two controls for the same gallery by hiding the catalog plugin’s custom “Primary Gallery Images” panel while keeping the existing JetEngine `gallery_media` field as the editor-facing control.

### Requirements

1. Do not register or display the catalog plugin’s custom “Primary Gallery Images” meta box on supported post types.
2. Keep the JetEngine `gallery_media` field available as the sole gallery editor for exhibitions, activities, moving image, artists/residency, and blog records.
3. Keep the existing `gallery_media` metadata key, accepted URL/attachment-ID formats, sanitizer, REST exposure, and frontend mapping unchanged.
4. On detail pages, `gallery_media` remains the primary gallery source. If it yields no usable images, the older `gallery` text field remains the fallback. If neither contains images, preserve the existing featured-image or empty-gallery behavior.
5. Listing cards may use the first `gallery_media` image as their hover image; `gallery_media` remains distinct from the featured/cover-image field.
6. Do not rewrite stored gallery data. Deploy only the catalog plugin PHP change to staging WordPress; do not deploy static-site output or production systems.

### Constraints

- Preserve the existing metadata key `gallery_media`, its JetEngine configuration, and accepted URL/attachment-ID formats.
- Do not rewrite or migrate existing WordPress gallery records.
- Remove only the custom plugin editor panel and assets that are exclusively used by it; retain gallery sanitization and REST/frontend support.
- Do not confuse the gallery with the featured image, which remains the listing/default image and the fallback when no gallery image is available.
- No frontend, gallery display, listing hover, static-site build, or production deployment behavior changes are in scope.

### Architecture

```text
WordPress JetEngine gallery control
  └─ `gallery_media` metadata
       ├─ detail gallery/carousel (primary source)
       ├─ legacy `gallery` metadata (fallback only)
       └─ first gallery image may be used for listing-card hover

Featured image remains separate and supplies the listing/default image or
the detail-page fallback when neither gallery field has usable images.
```

JetEngine remains responsible for the WordPress gallery editor control. The catalog-schema plugin continues registering/sanitizing the `gallery_media` metadata and exposing it to REST, but must not add its own competing editor panel. The frontend mapper in `lib/wp-mappers.ts` reads `gallery_media` first and reads legacy `gallery` only if the primary field provides no usable images. Detail templates then render the mapped gallery, with existing featured-image fallback behavior.

### Implementation steps

1. Remove the catalog plugin’s custom “Primary Gallery Images” meta-box registration and its panel-only uploader assets.
2. Keep the JetEngine `gallery_media` field, plugin metadata registration/sanitizer, REST exposure, and frontend mapping intact.
3. Verify PHP syntax and confirm the plugin no longer renders/enqueues the duplicate panel while retaining existing gallery behavior.

### Success criteria

- Only one editor-facing gallery control remains: JetEngine’s `gallery_media` field.
- The plugin no longer shows its duplicate “Primary Gallery Images” panel or loads its uploader assets.
- Gallery data, REST behavior, detail galleries, listing hover images, and featured-image fallback remain unchanged.
- PHP syntax validation passes; no WordPress records or production/static-site deployment state are changed.

---

## Previously Specified Feature: Mobile Detail Galleries and WordPress Gallery Uploads

> Earlier implementation plan retained for context. The “Gallery Editor UI” section above governs the current request to use JetEngine’s existing gallery control without a duplicate plugin panel.

### Objective

Make gallery uploads easy and reliable for WordPress editors, make uploaded WordPress media the primary gallery source on both sites, and cap detail-page hero sliders at 50vh on mobile so landscape images have more room in the viewport.

This is a planning document only. No application or WordPress code has been changed as part of this update.

### Requirements

#### WordPress gallery editor

1. Replace the current comma-separated `gallery_media` ID text input with a WordPress media-library gallery control in the post editor sidebar.
2. Show the control prominently as the primary gallery-editing field for all catalog post types supported by the plugin: exhibitions, activities, moving image, artists/residency, and blog, on both `/bk/` (`bkkk`) and `/kyaf/` (`kyaf`).
3. Editors can select/upload multiple images, see selected-image previews, remove images, and preserve/reorder the gallery sequence before saving.
4. Persist the ordered WordPress attachment IDs in the existing `gallery_media` post meta field as an integer array compatible with the existing REST schema. Protect saves using WordPress capabilities and nonces.
5. Do not delete or rewrite existing values in the legacy URL-text `gallery` field as part of this change.

#### Front-end gallery source and presentation

1. Treat successfully resolved `gallery_media` attachment IDs as the primary gallery. Preserve their editorial order and use that gallery without appending legacy URL entries.
2. For legacy records with no valid/resolved `gallery_media` items, continue to use the existing URL-text `gallery` field as a backward-compatible fallback.
3. If neither source provides images, retain each detail page's existing featured-image/empty-gallery behavior; this feature does not change empty-gallery semantics.
4. On mobile viewports, cap the complete hero/gallery slider area on every detail page on both sites at a maximum height of `50vh`.
5. Apply the mobile cap across exhibition, activity, moving-image, artist/residency, and blog detail pages. Keep carousel navigation, slide order, and single-image behavior unchanged.
6. Preserve current image-fit/cropping behavior and current desktop sizing; this request changes the mobile maximum height only.

### Constraints

- Keep `/bk/` mapped to internal site ID `bkkk`, and `/kyaf/` mapped to `kyaf`.
- Retain `gallery_media` as the stable CMS/REST field and its ordered integer-ID shape; do not introduce a public unauthenticated write endpoint.
- Keep the legacy `gallery` URL string readable for existing posts. Uploaded media takes precedence; legacy URLs are used only when no valid uploaded media resolves.
- Apply one consistent mobile height rule to every supported detail template while avoiding unrelated changes to page layouts, carousel behavior, or desktop presentation.
- Use staging WordPress (`q42026.content.khaoyaiart.org`) and staging site (`dev.khaoyaiart.org`) for verification. Production CMS/hosting changes are out of scope.
- WordPress plugin deployment and static-site deployment are separate workflows. Do not deploy either as part of this planning task; later implementation must follow `AGENTS.md` and the repository deployment instructions.
- Before writing application code, follow the repository's requirement to read the relevant Next.js guides under `node_modules/next/dist/docs/`.
- Preserve unrelated existing worktree changes; this specification update does not authorize changing application code or generated `out/` files.

### Architecture

```text
WordPress editor sidebar
  └─ media-library gallery selector
       └─ ordered attachment IDs in `gallery_media`
            └─ existing REST field (integer array)
                 └─ batch media resolver in the front end
                      ├─ use resolved uploaded media as the primary gallery
                      └─ fall back to legacy URL-text `gallery` when empty
                           └─ detail-page carousel on BK and KYAF
                                └─ mobile slider maximum height: 50vh
```

The WordPress schema already exposes `gallery_media` as an array of integer attachment IDs, and the front-end fetch/mapping path already resolves those IDs to image URLs. The CMS currently renders the field as a plain comma-separated text input in the main catalog metabox, while the detail templates merge resolved media and URL text. The implementation should upgrade the editor control and adjust precedence in the existing mapping path, rather than add another gallery data field or endpoint.

Detail hero carousels are currently implemented in site-specific detail templates. Apply the mobile cap consistently across the five supported detail types on both sites, preferably through a shared style/helper where practical, while preserving each template's current image-fit behavior and desktop sizing.

### Implementation steps

1. **Confirm the current contracts and responsive breakpoint**
   - Review the catalog plugin's `gallery_media` registration/sanitizer, REST payload, media resolver, all detail templates, and the project's existing mobile breakpoint conventions.
   - Keep the current ordered integer-array REST contract and identify every supported BK/KYAF detail carousel.
2. **Build the WordPress sidebar media selector**
   - Replace the comma-separated text input with a media-library multi-select/uploader in the editor sidebar for every supported catalog post type.
   - Support preview, add/upload, remove, and reorder; save ordered attachment IDs to `gallery_media` with nonce/capability protection.
3. **Make uploaded media the primary front-end source**
   - Keep the existing batch media resolution path.
   - When one or more gallery attachment IDs resolve, use those URLs in the stored order and do not append legacy URLs.
   - When no uploaded media resolves, preserve support for the existing `gallery` URL-text field.
4. **Cap detail sliders on mobile**
   - Apply a 50vh maximum to the hero/gallery slider area at the existing mobile breakpoint in all exhibition, activity, moving-image, artist/residency, and blog detail templates for both sites.
   - Retain the existing crop/fit rules, navigation, dots, slide count, and desktop sizing.
5. **Verify on staging**
   - Test selecting, uploading, reordering, removing, saving, and reopening a multi-image gallery in the WordPress sidebar for representative post types.
   - Confirm the REST response stores ordered IDs and the site displays the uploaded images first; confirm a legacy-only record still renders its URL gallery.
   - Check mobile portrait and landscape images, one- and multi-slide galleries, and all supported detail-page types on both sites; confirm the slider never exceeds 50vh on mobile and desktop remains unchanged.
   - Run the configured staging build/deployment verification only after implementation is authorized and changes are ready.

### Success criteria

- Editors can manage the gallery through a prominent WordPress sidebar media-library control rather than entering comma-separated IDs.
- The selected gallery order persists as integer attachment IDs in `gallery_media` for all supported post types.
- Resolved `gallery_media` images are the primary gallery and are not mixed with stale legacy URL images; records without uploaded media continue to use legacy `gallery` URLs.
- Every supported BK and KYAF detail-page hero/gallery slider is at most 50vh tall on mobile, with current image-fit behavior and carousel interactions preserved.
- Desktop hero/gallery sizing and unrelated page content remain unchanged.
- Staging validation succeeds without changing production systems, credentials, or unrelated worktree files.

---

## Previously Specified Feature: Curated Related Records

### Objective

Let WordPress editors curate any number of related records for each eligible record on the Bangkok Kunsthalle (`/bk/`, internal site ID `bkkk`) and Khao Yai Art Forest (`/kyaf/`, internal site ID `kyaf`). Display those recommendations as portrait-image cards at the bottom of each corresponding detail page.

This document is an implementation plan only. No application or WordPress code has been changed as part of writing this specification.

### Requirements

#### Editorial relationships

1. Add a relationship selector to the WordPress edit screen for records of every supported type: exhibitions, activities, moving image, artists/residency, and blog.
2. Editors may select zero or more related records per record, with no fixed count limit. Selection must be searchable and support records from all five supported types.
3. Relationships are site-local: a `bkkk` record may link only to other `bkkk` records, and a `kyaf` record only to other `kyaf` records. The editor UI must not offer records from the other site.
4. Selection order is editorial order and is preserved on the front end. Do not generate automatic recommendations from tags or other metadata.
5. Prevent a record from linking to itself and remove duplicate selections.

#### Detail-page presentation

1. Render selected relationships on all eligible detail pages for both sites, reusing the existing `Related Content` section title and site language handling.
2. Place the section at the bottom of the detail page, after the main content, embedded video, and any existing detail sections. Do not show a second/duplicate related section.
3. Show all selected records in their editorial order. If none are selected or no valid records are returned, render no recommendation section.
4. Use portrait images with an approximately 3:4 aspect ratio. Keep the existing responsive card layout, image loading behavior, typography, and visual treatment consistent with the current site design.
5. Each card links to the correct detail route for its record type under the current site prefix. Artists/residency records use the existing artists detail route.
6. Preserve the card title and any optional category/date metadata currently supported. Use the appropriate English or Thai title.

#### Supported type-to-route mapping

| WordPress record type | Front-end relation type | Detail route segment |
|---|---|---|
| Exhibition | `exhibitions` | `exhibitions` |
| Activity | `activities` | `activities` |
| Moving image | `moving-image` | `moving-image` |
| Artist / residency | `residency` | `artists` |
| Blog | `blog` | `blog` |

### Constraints

- Keep `/bk/` mapped to internal site ID `bkkk` and `/kyaf/` mapped to `kyaf`.
- WordPress remains the editorial source of truth; the front end must not hard-code recommendation lists.
- Keep the existing REST response contract compatible where practical. The current mapper reads `related_content_json` or `related_content`; introduce a normalized REST shape or adapter without breaking legacy records during migration.
- Include stable record identifiers, slug, type, site, bilingual title, and featured image in the front-end relationship payload. Optional category/date fields may be included where available.
- Filter out cross-site, unsupported-type, self, duplicate, or malformed relationships defensively in the front end, even if the editor UI already prevents them.
- Do not expose a public unauthenticated WordPress write endpoint for relationship updates. Use the authenticated WordPress editor and existing secure CMS mechanisms.
- WordPress/CMS changes are separate from the static Next.js deploy. Use staging WordPress for development and verification; production WordPress and production hosting remain out of scope.
- Do not commit credentials or stale generated `out/` output. Normal source deployment is handled by the staging GitHub Actions workflow.
- Implementation must follow the repository's current Next.js guidance in `node_modules/next/dist/docs/` before changing application code.

### Architecture

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

### Implementation steps

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

### Success criteria

- Editors can select and order any number of records from the five supported types for each eligible post in WordPress.
- The editor only offers same-site candidates; no recommendation can navigate from `/bk/` to `/kyaf/` or vice versa.
- All five types work as sources and destinations on both sites, with artists/residency linking to the artists route.
- Detail pages render the selected cards once at the bottom, after video and other sections, with portrait images and correct bilingual titles.
- Selection order is maintained; self-links, duplicates, invalid types, malformed entries, and empty relationship fields produce no bad cards.
- Existing content without relationship data continues to build and render normally.
- Staging build and deployment workflow succeeds, with no production systems or credentials changed.
