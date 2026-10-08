# Workspace Specification

## Active Plan: KYAF/BK Content and Layout Corrections

### Deployment scope

- Repository: `HeartBrains/kyafQ42026`, branch `master`.
- Public staging site: `https://dev.khaoyaiart.org`.
- WordPress source: `https://q42026.content.khaoyaiart.org`.
- `/bk/` maps to internal site ID `bkkk`; `/kyaf/` maps to `kyaf`.
- Changes are staging-only. Do not modify production repositories, WordPress endpoints, or hosting.
- Preserve unrelated worktree changes. Do not commit generated `out/`, credentials, SSH keys, or unrelated artifacts in a normal source change; CI rebuilds `out/` after the source push.

### Objective

Correct shared home, listing, detail, menu, footer, and related-content behavior for both Bangkok Kunsthalle (BK) and Khao Yai Art Forest (KYAF), with responsive behavior explicitly defined for desktop and mobile.

### Requirements

#### 1. Home hero hover treatment and controls

1. On both home pages, hovering a hero slide must keep the background image visible and apply a transparent dark overlay at 60% opacity (`rgba(0, 0, 0, 0.6)` or an equivalent existing design token), not replace the image with a solid grey background.
2. Remove the visible `1/8`-style gallery/slide count from the home hero. Do not remove accessible slide state from assistive technology unless it is only the visual counter.
3. Preserve the existing arrows, labels, links, keyboard focus, swipe behavior, autoplay, and reduced-motion handling unless another requirement changes them.

#### 2. Home hero image source

1. Home hero slides for both BK and KYAF must be populated from the existing WordPress hero API/data source for each section.
2. Each section’s configured hero image must map to the correct site and section; do not substitute a hard-coded unrelated image when an API value exists.
3. Define and preserve a safe loading fallback for missing/unavailable API images using the existing site asset or existing fallback mechanism.
4. Do not add a second content source or change the WordPress content model without evidence that the current hero API cannot provide the required data.

#### 3. Moving Image Program title typography

Normalize Moving Image Program title typography on both sites so titles are the same size and line-height at the same breakpoint across all listing/card locations. Match the established typography used by the other content categories and the existing mobile scale. Do not alter title copy, localization, card ordering, or responsive layout beyond the required typography normalization.

#### 4. Activities detail Additional Info typography

Reduce the Activities detail-page `Additional Info` typography by 22% from its current rendered size on both BK and KYAF. Apply the reduction only to the Additional Info block (date/time/location and equivalent metadata), not the page title, main body copy, curator text, CTA labels, or image credits. Preserve Thai line-height and responsive readability.

#### 5. Desktop sticky footer sizing and transition

At desktop breakpoints only:

1. Reduce the sticky footer menu logo by 25% from the current rendered size.
2. Reduce the sticky footer’s vertical space by 30% from the current setting while preserving legibility, hit areas, safe-area handling, and menu navigation.
3. Add a smooth slide-up transition when the sticky footer appears. Respect `prefers-reduced-motion` by disabling or minimizing the transition.
4. Keep existing mobile sticky-footer sizing and behavior unchanged except where explicitly required by the mobile requirements below.

#### 6. Related Content headings on all detail pages

1. On every applicable BK and KYAF detail page, change the related-section heading currently rendered as `Related Artists` or `Related Residency` to exactly `Residency`.
2. Apply the heading naming consistently to all related-content section titles so they match the corresponding primary navigation/content section names.
3. Preserve related-record grouping, editorial order, links, localization, card layout, and empty-state behavior. Do not change WordPress relationships as part of this heading-only requirement.

### Mobile-only requirements

#### M1. Home hero arrows

1. Hide the home hero arrow controls by default on mobile.
2. Reveal them through a deliberate hero-area interaction (tap/click; hover may be supported on hybrid devices) with a smooth, reduced-motion-aware transition.
3. Keep slide navigation accessible to keyboard and assistive-technology users, and preserve swipe navigation.

#### M2. Hamburger-menu site link preview

On mobile, tapping the cross-site logo/link in the hamburger menu must not immediately navigate. It must first display the same logo-and-picture preview interaction available on desktop; a subsequent explicit activation of the preview enters the destination site. Preserve an accessible direct-navigation fallback for keyboard and assistive-technology users, and ensure the menu can still be closed without entering the destination site.

#### M3. Detail gallery hero height

On mobile, for all BK and KYAF detail-page gallery/slideshow hero sections (`gallery_media`), force `height`, `min-height`, and `max-height` to `60vh`. Keep existing desktop detail-hero behavior unless another requirement specifies it. Prevent image distortion with the existing object-fit/overflow behavior.

### Constraints

- Implement in the shared components/styles where both sites use the same behavior; use site-specific components only where markup or content contracts differ.
- Reuse the existing hero API/data hooks, image assets, typography tokens, menu controls, sticky footer, and related-content renderer.
- Keep `/bk/`→`bkkk` and `/kyaf/`→`kyaf` routing intact. Do not add new routes or alter production mappings.
- Preserve accessibility: semantic links/buttons, focus styles, accessible slide state, touch targets, and reduced-motion behavior.
- Preserve WordPress as the content source. Do not expose new public write endpoints or commit credentials.
- Do not include generated `out/` in the source change; verify CI rebuilds staging output using Node 20 and the staging WordPress API.
- Before any push, review `git status`, remotes, target ancestry, and exact staged files. Push only to `https://github.com/HeartBrains/kyafQ42026.git` `master`.

### Architecture

```text
Staging WordPress hero API (q42026.content.khaoyaiart.org)
  └─ existing hooks/mappers
       └─ shared BK/KYAF home hero slide model
            ├─ API-backed section images + existing fallbacks
            ├─ image-preserving 60% hover overlay
            ├─ visual counter removed; accessible slide state retained
            └─ desktop/mobile arrow interaction and transitions

BK/KYAF detail pages
  ├─ existing gallery_media hero
  │    └─ mobile h/min/max = 60vh
  ├─ Activities Additional Info typography = current size × 0.78
  ├─ Moving Image title typography = shared category title scale
  └─ RelatedContentSection
       └─ normalized section titles, including exact “Residency” heading

BK/KYAF shell
  └─ sticky footer
       ├─ desktop logo scale = current × 0.75
       ├─ desktop vertical space = current × 0.70
       └─ reduced-motion-aware slide-up reveal
```

### Implementation steps

1. Audit the current `HeroDualSwitcher`, hero API hooks/mappers, BK/KYAF menu overlays, sticky footer, detail gallery wrappers, Moving Image listing cards, Activities detail metadata, and `RelatedContentSection`; record current computed classes/tokens and API field names.
2. Update home hero data resolution to use the existing per-section hero API values and explicit fallbacks. Update hover overlay opacity, remove only the visual slide counter, and implement desktop/mobile arrow visibility and transitions without breaking keyboard/swipe behavior.
3. Normalize Moving Image title classes against the established listing title scale. Apply the 22% Activities Additional Info reduction in a scoped style/class. Set mobile detail gallery hero height constraints to `60vh`.
4. Adjust desktop sticky-footer logo and spacing tokens by the specified percentages, add slide-up enter/exit motion, and add reduced-motion behavior.
5. Update all related-content heading labels to the primary section names, including exact `Residency`, while preserving data/grouping behavior.
6. Verify both `/bk/` and `/kyaf/` at desktop and mobile widths, API-backed hero images, hover/tap/focus states, swipe controls, typography, sticky-footer transitions, related headings, and detail-gallery heights. Run formatting/type/build checks available in the environment.
7. Review only intended source files, push to `HeartBrains/kyafQ42026/master`, confirm the GitHub Actions staging build succeeds, and verify the resulting pages on `https://dev.khaoyaiart.org`.

### Success criteria

- BK and KYAF home heroes use the configured per-section WordPress hero images; missing data uses the existing safe fallback.
- Hover preserves the image with a 60% transparent overlay; no solid-grey takeover appears; the visual `1/8` counter is gone while slide accessibility remains.
- Mobile arrows are hidden until hero interaction and animate smoothly; swipe, keyboard, focus, and reduced-motion behavior remain usable.
- Moving Image titles match the established category title size/line-height at each breakpoint.
- Activities detail Additional Info is exactly 22% smaller than its previous rendered scale, scoped only to that block.
- Desktop sticky footer logo is 25% smaller, vertical space is 30% smaller, and appearance uses a smooth slide-up transition with reduced-motion support.
- All related-content headings use the correct primary section names, with `Residency` used instead of `Related Artists`/`Related Residency`.
- Mobile detail gallery heroes have `height`, `min-height`, and `max-height` of `60vh` on both sites.
- No production domain or production WordPress endpoint changes are made.
- Staging CI completes successfully and the implemented behavior is visible at `https://dev.khaoyaiart.org`.

## Prior Plan (reference): Related-Content Type Groups and Carousel Controls

### Objective

Update the existing related-content presentation on current `/bk/` (`bkkk`) and `/kyaf/` (`kyaf`) detail pages so past records remain grouped with their own content type, and make overflowing related-record carousels visibly navigable with previous/next arrows.

### Requirements

#### WordPress relationship data

1. Keep WordPress as the source of truth for related records. Editors already have an ordered, searchable relationship control, documented in `wordpress/kyaf-catalog-schema/README.md`.
2. Do not add a second relationship control, modify the CMS field, impose a relationship-count limit, or automatically invent recommendations. Render only the valid records selected in WordPress.
3. Preserve the existing normalized `related_content_json` contract, same-site relationship restrictions, editorial order, and existing front-end validation.

#### Related-content grouping

1. Render each selected record in the group for its record type, regardless of whether its status is current, upcoming, or past.
2. Remove the combined `Blogs & Archives` group and do not create an `Archives` group. Past exhibitions, activities, and moving-image records stay with their respective `Exhibitions`, `Activities`, and `Moving Image` groups. Blog records appear in a `Blogs` group.
3. Preserve the selected editorial order within each type group. For example, a Mooring record with six related Activities must show all six together in its Activities group, including any past Activities.
4. Apply the grouping consistently to all detail pages that use related content on both sites. Keep existing source-page rules: exhibition detail pages omit related exhibitions; other detail types may show their own type when selected.
5. Preserve same-site-only cards, valid type-to-route mappings, portrait imagery, bilingual titles, optional card metadata, and the existing no-valid-relations behavior (no related-content section).

#### Carousel controls

1. Keep each type group as a single horizontal row that supports touch swipe, horizontal trackpad/keyboard scrolling, and scroll snapping; cards must not wrap onto a second line.
2. When a group overflows horizontally, show previous/next arrow buttons straddling the left/right edges of the image row, vertically centered on the images. Each arrow advances or retreats by one card.
3. Show the previous arrow only when earlier records exist and the next arrow only when later records exist. Do not show arrows when the group fits without scrolling.
4. Hide the horizontal scrollbar while preserving touch swipe, scroll snapping, trackpad/keyboard scrolling, and arrow navigation.
5. Give arrow buttons accessible names and keyboard focus styling. Preserve the existing carousel on both `/bk/` and `/kyaf/` through the shared renderer.

### Constraints

- Limit this change to the existing related-content frontend presentation and its tests. The WordPress relationship selector already exists; do not add or replace it.
- Do not change relationship records in WordPress, auto-populate empty relationships, create reverse relationships, or change the same-site restriction.
- Keep `/bk/` mapped to `bkkk` and `/kyaf/` mapped to `kyaf`.
- Do not introduce a new KYAF Moving Image detail route as part of this grouping/presentation task; apply changes to current related-content routes and do not create links to unsupported destinations.
- Do not commit credentials or stale generated `out/`. Use the `HeartBrains/kyafQ42026` `master` deployment workflow if/when implementation is authorized and complete; CI builds static output and Hostinger serves the staging site.
- Preserve unrelated existing changes in the worktree.

### Architecture

```text
WordPress existing relation control
  └─ ordered, site-local record selections
       └─ normalized related_content_json
            └─ lib/wp-mappers.ts validates/maps selected records
                 └─ RelatedContentSection (shared on both sites)
                      ├─ filter/group by record type only (ignore status)
                      ├─ keep past items with their type; Blog is its own group
                      └─ one-line horizontal carousel per group
                           ├─ swipe/snap/scroll
                           └─ previous + next arrow controls when overflowing
```

The existing WordPress control stores ordered related records, with published records limited to supported types and the current site. The frontend mapper normalizes these values, and `RelatedContentSection` applies the site/type filters and renders the cards. Change the grouping key so status no longer diverts past records into an Archives group. Add arrow controls around the existing scrollable row, derive their enabled/disabled state from the track's scroll position, and scroll one card per activation. Do not change the CMS contract or mutate editorial relationships.

The current KYAF site has no Moving Image detail component or published KYAF Moving Image records. This plan does not create that route; existing supported type-to-route behavior remains unchanged.

### Implementation steps

1. Confirm the current relationship meta shape and shared related-content call sites for BK and KYAF; retain the WordPress selector documented by the catalog-schema README.
2. Update `RelatedContentSection` grouping to classify by record type only, remove the Archives grouping, and render Blog as its own group. Preserve type-group order and editorial ordering within each group.
3. Add accessible previous/next buttons to overflowing carousel rows. Measure overflow and scroll position, disable the relevant arrow at each boundary, and advance exactly one card per click while retaining swipe/scroll behavior.
4. Verify representative selected records across activities, exhibitions, moving image, residency/artists, and blogs; confirm past records remain with their type, the Mooring Activity example groups all six activities together, and no Archives group appears.
5. Verify both site prefixes, mobile swipe and desktop arrows, empty relationships, edge-disabled buttons, correct links, and the staging build/deploy workflow. Push only after implementation and verification; let the master CI workflow rebuild `out/` for Hostinger.

### Success criteria

- No `Blogs & Archives` or `Archives` related-content group is rendered.
- Past records are displayed in their own type group alongside other selected records of that type; Blog records have a `Blogs` group.
- All six selected Activities on the Mooring example are presented together under Activities in their WordPress-selected order.
- Every overflowing group shows a previous arrow only when it can move backward and a next arrow only when it can move forward. Each arrow moves one card and straddles the corresponding image-row edge.
- Scrollbars stay hidden while swipe, snap, horizontal scrolling, keyboard access, portrait cards, localization, and same-site linking continue to work on applicable BK and KYAF detail pages.
- WordPress relationship data and controls are not changed, and no automatic recommendations are introduced.
- The staging build/deploy workflow succeeds before reporting the update deployed.

This section is the current implementation plan for related-content grouping and carousel controls. Historical specifications below remain for context where not superseded by these requirements.

## Hide Redundant WordPress Catalog Image URL Inputs

### Objective

Hide the circled `Secondary card image URL`, `Hero landscape image URL`, and `Hero portrait image URL` inputs from the WordPress “KYAF Catalog Fields” panel so editors are not confused by fields that do not affect the current frontend.

### Requirements

1. Remove the three inputs from the plugin's visible editor meta box. Keep the Video URL and Related records controls visible.
2. Preserve the metadata keys, registration, sanitization, REST exposure, and any existing frontend mapper behavior for the hidden fields.
3. Do not clear or migrate existing values. Hiding an input must not delete values when a record is saved.
4. Keep `gallery_media` as the separate JetEngine-managed detail gallery/slideshow field and retain featured-image behavior.
5. Update the plugin's settings-page help text so it no longer tells editors to look for hidden hero/secondary image fields.

### Constraints

- Only editor-facing field visibility and related explanatory text may change.
- Preserve all current metadata values and REST keys; no frontend rendering behavior changes.
- The `secondaryImage` mapper property may remain for compatibility even though no current component consumes it.

### Architecture

```text
WordPress plugin meta box
  ├─ visible: video URL + Related records
  └─ hidden inputs: secondary_image_url, hero_landscape_image, hero_portrait_image
       └─ stored metadata/REST registration remain intact

JetEngine gallery_media ─── REST/media resolution ── detail gallery/slideshow
featured image ──────────────────────────────────── listing/default image + fallback
```

The plugin continues to register, sanitize, and expose the hidden URL metadata; it simply stops rendering those three input rows in its editor meta box. The TypeScript mapper reads `secondary_image_url` into `secondaryImage`, but current page components do not render that property. The two hero-orientation keys have no mapper/component readers. The existing JetEngine `gallery_media` field remains the editor-facing detail gallery control.

### Implementation steps

1. Remove only the three redundant image URL inputs from the plugin meta box, retaining video and related-record controls.
2. Update the settings help text and bump the plugin patch version.
3. Run `php -l`, deploy the plugin file to staging over authorized SSH, and verify the plugin remains active and visible WordPress fields exclude the three inputs.

### Success criteria

- The three confusing URL inputs are absent from the WordPress editor panel; video and related-record controls remain.
- Existing stored values and REST-visible metadata remain intact.
- `gallery_media` and the featured image are clearly identified as separate, currently used image sources.
- Frontend behavior is unchanged.

## Uploaded Preview Media for Embedded Videos

### Objective

Let WordPress editors attach a custom image or short video preview to existing YouTube/Vimeo embeds. Show that preview in the current video area, and load the external player only after the visitor chooses to play the video.

### Editor field meaning

The WordPress field labeled **“Video preview image or clip”** is the thumbnail/poster shown before playback; it is not the YouTube/Vimeo URL or the video itself. Choose an image to show a still or animated thumbnail, or a short video clip to loop silently as the preview. Clicking **Play video** switches to the external video. The attachment is stored separately as `video_preview_media_id`, so it does not change the record’s `video_embed_url`, `gallery_media`, featured image, or detail-page gallery.

### Requirements

1. Add a WordPress Media Library upload/select control alongside the existing Video URL field for every existing detail page that renders `VideoPlayerEmbed`: BK and KYAF Exhibitions and Activities, plus BK Moving Image details.
2. Allow one optional preview attachment per record. Support static JPEG/PNG/WebP images, animated GIF/WebP images, and short MP4/WebM video clips. Do not promise animated-JPEG behavior; browser support is inconsistent.
3. Keep the preview separate from `video_embed_url`, `gallery_media`, and the featured image. Store a media attachment ID in a dedicated field such as `video_preview_media_id`; expose the resolved preview URL and MIME type through the existing WordPress REST flow.
4. When a valid YouTube/Vimeo URL and preview image are present, display the image in the existing 16:9 video area with an accessible Play video control. When a preview clip is present, show it muted, inline, and looping as a preview; the Play video control must load the YouTube/Vimeo player, not replace it with the preview clip.
5. Do not load the YouTube/Vimeo iframe until the visitor clicks Play. If no custom preview is set, preserve the existing black Play video screen and its click-to-load behavior.
6. Do not render a preview by itself when the record has no valid video URL.
7. Keep preview video short, honor the staging WordPress upload-size/type policy, and avoid changing global server upload limits without separate approval. Lazy-load or defer the preview clip where practical and pause it when it is not visible.
8. Preserve existing video URL validation, embed allowlist, consent behavior, gallery slideshows, and saved media. Require normal WordPress edit/upload permissions; do not create an unauthenticated upload or metadata-write endpoint.

### Constraints

- This applies only to current detail pages that already render `VideoPlayerEmbed`; do not create a new KYAF Moving Image route.
- Uploads go through WordPress Media Library and staging WordPress only. Do not send the preview through the static-site repository or store video binaries in Git.
- Validate that the selected attachment is an allowed image/video MIME type and belongs to the current WordPress installation; keep the metadata API protected by WordPress edit permissions.
- Existing records with a video URL and no preview must continue to work without editor changes.
- Uploading, changing, or removing a preview must not mutate the actual YouTube/Vimeo URL, gallery order, or featured image.
- Deploy the WordPress plugin change separately to staging over authorized SSH, lint it with PHP, and deploy frontend changes through the `kyafQ42026/master` build workflow. Production systems remain out of scope.

### Architecture

```text
WordPress editor
  ├─ existing video_embed_url (YouTube/Vimeo URL)
  └─ Media Library selection ─ video_preview_media_id
          │                         │
          └──── protected REST metadata + attachment URL/MIME ────┐
                                                                   v
lib/wp-api.ts + lib/wp-mappers.ts resolve preview data
          │
          v
shared VideoPlayerEmbed
  ├─ image attachment: render as poster with Play control
  ├─ video attachment: muted/inline/looping preview with Play control
  └─ click Play: replace preview with YouTube/Vimeo iframe
       no preview: retain current black Play video screen
```

The plugin owns the editor control, attachment validation, dedicated metadata key, and REST exposure. The fetch/mapping layer resolves the attachment's URL and MIME type for the shared player. The player selects image or video rendering from MIME type and retains the current explicit-click behavior for third-party embeds. Preview media does not become the record's gallery or cover image.

### Implementation steps

1. Add the protected preview attachment metadata and Media Library picker to the KYAF Catalog Fields editor UI for supported post types, preserving the Video URL input and existing metadata.
2. Validate and save one image/video attachment ID, add REST/media MIME resolution, and map preview URL/type into records consumed by current video-enabled detail templates.
3. Update `VideoPlayerEmbed` to render image or muted looping clip previews and transition to the external iframe only after a Play action; preserve the current fallback when preview media is absent.
4. Verify upload/select, replace, remove, save/reopen, MIME validation, existing video URLs, no-preview fallback, both languages/sites, and mobile/desktop layout. Confirm YouTube/Vimeo network requests remain deferred until Play.
5. PHP-lint and deploy the plugin separately to staging; run the frontend static build through the configured staging workflow. Do not deploy to production.

### Success criteria

- Editors can upload/select and remove one preview asset next to Video URL in WordPress for all current video-enabled detail records.
- Static and animated supported images render as previews; MP4/WebM clips preview muted, inline, and looping without audio.
- Clicking Play loads the record's existing YouTube/Vimeo video; the uploaded preview does not replace or alter the source video.
- Without preview media, the current black Play video screen works as before; invalid URLs and disallowed attachment MIME types are safely rejected/fallback.
- No iframe is requested before an explicit Play click, and existing gallery, featured-image, and video behavior stays intact.
- Staging plugin lint/deployment and frontend build succeed; production remains unchanged.

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

## Historical Initial Plan: Curated Related Records (Superseded by Active Plan Above)

> The relationship selector described below is already present in WordPress, as documented in `wordpress/kyaf-catalog-schema/README.md`. The active plan above is the current scope: keep that control and change only frontend grouping and carousel navigation. Do not follow historical steps below that propose adding or replacing the selector.

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
