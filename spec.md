# Workspace Specification

## Active Plan: Assess and Upgrade kyafQ42026 WordPress to 7.1 (or 6.9 fallback)

### Objective

Determine the current WordPress core version on the `kyafQ42026` main/staging installation and upgrade it to the newest supported stable branch that passes compatibility checks. The preferred target is the current 7.1 maintenance release; use the latest 6.9 maintenance release only if a verified plugin/theme or hosting incompatibility blocks 7.1. Keep the static frontend repository and production WordPress systems unchanged unless separately approved.

### Version recommendation

Prefer WordPress **7.1.x** for this staging installation, specifically the latest 7.1 maintenance release available at execution time. WordPress.org lists 7.1 as the actively maintained branch and lists 7.1.2 as the latest release; 6.9 remains available as a maintained older branch with 6.9.9 listed in the release archive. [WordPress release archive](https://wordpress.org/download/releases/) The recommendation is conditional on compatibility testing: 7.1's editor, media, responsive-style, and accessibility changes require validation against JetEngine, the custom catalog plugin, the active theme, REST routes, and the frontend build. If those checks fail, choose the latest 6.9.x security/maintenance release as the interim target and document the blocker.

### Target environment

- WordPress API: `https://q42026.content.khaoyaiart.org`
- Frontend/deployment consumer: `HeartBrains/kyafQ42026` on `master`
- Hostinger static site: `https://dev.khaoyaiart.org`
- Scope: the kyafQ42026 main/staging WordPress installation only

### Requirements

1. Establish the installed WordPress core version, PHP version, database version, active theme, active plugins, multisite status, REST/API health, and available disk space before changing anything.
2. Confirm the installed version and compare it with the selected target: latest stable 7.1.x by default, or latest 6.9.x only when 7.1 compatibility evidence is insufficient. If the installation is already on the selected/current branch, do not perform a redundant core upgrade.
3. Create and verify recoverable backups of the database, `wp-content`, and the current WordPress core state before the upgrade. Record backup timestamps and locations without committing credentials or backup data to Git.
4. Check the active theme, active plugins, custom post types, JetEngine fields, REST routes, authentication, media handling, and the frontend's required API responses for the selected WordPress branch (7.1.x preferred, 6.9.x fallback).
5. Upgrade WordPress core only through the authorized WordPress administration/WP-CLI/Hostinger procedure. Do not silently upgrade unrelated plugins, themes, PHP, or database settings as part of this plan.
6. Preserve all existing content, custom fields, media, permalinks, REST routes, staging-only indexing settings, and the `q42026` API contract.
7. After the upgrade, run WordPress health checks and verify representative REST endpoints used by the frontend, including catalog records, media, menus/site configuration, related-content metadata, mailing-list behavior, and any protected routes that require authentication.
8. If frontend compatibility changes are needed, implement them separately in the `kyafQ42026` source repository and deploy through its normal `master` GitHub Actions workflow. Do not manually commit stale `out/` output unless the documented CI fallback is required after a confirmed workflow failure.
9. Define a tested rollback path before execution: restore the database and `wp-content`, restore the prior core version, and confirm the staging API and frontend can recover.

### Constraints

- This plan is for `q42026.content.khaoyaiart.org` only. Production WordPress, production APIs, production hosting, and `khaoyaiart-next` are out of scope.
- Do not expose or store SSH private keys, WordPress credentials, API passwords, salts, database dumps, or backup URLs in the repository, logs, or `spec.md`.
- Do not modify WordPress content or relationship records while testing. Any synthetic test record must be explicitly approved, isolated, and removed afterward.
- Do not change the WordPress REST schema, custom post type names, JetEngine field keys, mailing-list route, CORS behavior, or indexing policy without a separate requirement.
- Do not upgrade plugins/themes or change PHP/database versions automatically; compatibility remediation requires a separate decision and test result.
- Keep the frontend's static deployment isolated: WordPress plugin changes are deployed separately over authorized Hostinger SSH, while frontend source changes go through `HeartBrains/kyafQ42026/master`.
- Respect the repository's existing deployment guidance: CI builds with Node 20, consumes the staging WordPress API, commits generated `out/`, and Hostinger serves `dev.khaoyaiart.org`.

### Architecture

```text
kyafQ42026 WordPress staging
  ├─ core/version + PHP/database + active extensions
  ├─ active theme/plugins + custom post types/JetEngine fields
  ├─ REST API + auth/CORS + mailing-list route
  └─ database + wp-content backup
           │
           ├─ preflight compatibility and backup verification
           ├─ controlled WordPress 7.1.x core upgrade
           │    └─ latest 6.9.x fallback only if compatibility blocks 7.1
           └─ post-upgrade health/API/content checks
                    │
                    v
          kyafQ42026 static frontend build
                    │
                    v
          Hostinger: https://dev.khaoyaiart.org
```

WordPress remains the source of truth for content and metadata. The frontend consumes the existing REST contract and is not rebuilt until post-upgrade API checks show that the contract remains compatible. WordPress core upgrade operations and frontend static deployment remain separate change paths.

### Implementation steps

1. Inspect the current staging installation and document WordPress core, PHP, database, theme/plugin, multisite, and disk-space versions; capture the current API and frontend health baseline.
2. Inventory compatibility-sensitive integrations: custom post types, JetEngine fields, catalog metadata, REST routes, mailing-list plugin, authentication, media endpoints, menus/site configuration, and any scheduled jobs.
3. Create database and file backups, verify that they are readable/restorable, record checksums or equivalent verification, and document the exact rollback commands/procedure.
4. Confirm the maintenance window and authorized upgrade mechanism, then upgrade only WordPress core to the selected target on q42026 staging: latest 7.1.x by default, latest 6.9.x if the documented compatibility gate fails.
5. Run WordPress Site Health/WP-CLI checks, inspect logs for new PHP/database errors, verify admin login and editor save/read behavior, and exercise representative REST API requests without mutating production-like content.
6. Run the kyafQ42026 static build workflow against the upgraded staging API. Verify representative `/bk/` and `/kyaf/` pages, detail records, images/galleries, video previews, related content, menus, mailing-list submission behavior, and indexing-disabled headers.
7. If all checks pass, document the resulting versions and deployment run. If checks fail, stop frontend rollout, use the prepared rollback path, and record the failing integration and evidence before proposing remediation.

### Success criteria

- The current WordPress version is recorded, and the decision to upgrade or remain on the current version is evidence-based.
- If an upgrade is approved and needed, q42026 runs the selected WordPress branch (7.1.x preferred; latest 6.9.x fallback) with verified backups and a documented rollback path.
- Existing content, media, custom fields, REST routes, authentication, CORS, mailing-list behavior, and staging indexing policy remain functional.
- No production WordPress or production site is changed.
- The kyafQ42026 GitHub Actions build completes successfully against the upgraded staging API, and Hostinger serves the resulting static output at `https://dev.khaoyaiart.org`.
- Any incompatibility is isolated, reproducible, and documented; no unreviewed plugin/theme/PHP/database upgrades are bundled into the core upgrade.


## Active Plan: Landing-Style Site Link Preview from Main Menu

### Objective

On both `/bk/` and `/kyaf/`, let visitors preview the corresponding site cover from the existing site-name link in the open main navigation. Hovering a site name reveals that site's existing landing-page cover image across the full viewport and shows the matching landing-page logo. The site links align to the right side of the navigation footer for easier activation. The normal menu appearance is restored when the pointer enters the left half of the viewport. Clicking the site name navigates directly to that site.

### Requirements

1. Apply the interaction to the cross-site links in both existing menu overlays: “Khao Yai Art Forest” links to `/kyaf/`, and “Bangkok Kunsthalle” links to `/bk/`.
2. On desktop pointer hover, display the matching existing landing-page cover image as a full-viewport background preview: Bangkok Kunsthalle uses the existing BK landing cover; Khao Yai Art Forest uses the existing KYAF landing cover.
3. While a preview is active, show the matching white landing-page logo above the decorative cover layer, using the same logo artwork as the landing page.
4. Keep the open menu and its links visible and usable above the preview and logo, with adequate contrast. The preview changes only the visual background/logo; it does not navigate or otherwise alter the menu state.
5. Align the site-name links to the right side of the navigation footer while keeping search and language controls functional.
6. Restore the normal menu appearance, including its original menu background and hidden preview logo, when the pointer enters the left half of the viewport. Closing the menu also clears the preview.
7. Clicking/tapping either site-name link navigates to its corresponding site route. Do not require a separate click target or change the destination.
8. Make the preview available on keyboard focus of the site-name link and clear it when focus leaves the link/menu context. Preserve visible focus treatment and normal keyboard navigation.
9. On touch devices, where hover is unavailable, keep the site-name links as ordinary direct navigation links; do not require a preview action before navigation.
10. Use a smooth, reduced-motion-aware transition consistent with the landing page's existing image fade. Keep the cover and logo decorative to assistive technology; retain accessible site names on the links.
11. Remove the duplicate landing-hero site selector labels and the bottom “Explore …” site link. The main navigation site links are the only cross-site navigation controls required for this interaction.

### Constraints

- Limit the change to the BK and KYAF frontend menu overlays and related shared styling as needed.
- Reuse the current landing-page cover assets and existing site routes; do not introduce new images, WordPress fields, or content-fetch behavior.
- Keep the menu's existing navigation, search, language switcher, close behavior, and responsive layout intact.
- Do not change the root site chooser or the automatic home hero slideshow.
- Preserve unrelated existing worktree changes; do not include `out/` or unrelated artifacts in a future source push.

### Architecture

```text
BK / KYAF Header menu button
  └─ existing MenuOverlay
       ├─ existing cross-site name link
       │    ├─ hover / keyboard focus → site-specific full-viewport cover preview
       │    └─ click / tap → /bk/ or /kyaf/
       ├─ pointer enters viewport's left half → clear preview, restore normal overlay
       └─ close overlay → clear preview
```

Add an overlay-local preview state to each site's `MenuOverlay`. Render the selected landing-cover image in a decorative, full-screen layer behind the menu content, keeping navigation above it. Connect each site's existing site-name link to the matching preview state while preserving its current destination. Clear preview state when the pointer crosses into the viewport's left half or the overlay closes. Keep focus-based preview behavior accessible and avoid hover-only requirements on touch input.

### Implementation steps

1. Verify the landing-page image asset used for each site and confirm the site-name link locations and destinations in both menu overlays.
2. Add the full-viewport image preview and transition to the existing BK and KYAF menu overlays, preserving the current menu foreground and contrast.
3. Wire pointer hover, left-half pointer reset, keyboard focus/blur, overlay-close reset, and direct site-link navigation.
4. Verify both menu overlays at desktop and mobile widths, including pointer transition to the left half, focus/keyboard use, reduced motion, close/reset, and correct `/bk/` and `/kyaf/` destinations.
5. Run the relevant checks and review the exact diff. When implementation is authorized and complete, follow the staging `HeartBrains/kyafQ42026/master` workflow; Hostinger deploys from that branch.

### Success criteria

- Hovering or keyboard-focusing either site-name link shows the correct existing landing cover across the viewport without hiding or disabling menu navigation.
- Moving the pointer into the left half restores the normal open-menu background; closing the overlay leaves no preview state behind.
- Clicking/tapping “Khao Yai Art Forest” navigates to `/kyaf/`; clicking/tapping “Bangkok Kunsthalle” navigates to `/bk/`.
- Touch users can navigate directly without hover, and keyboard users can identify/focus/activate both links.
- Existing menu controls, root landing chooser, and hero slideshow are unchanged.
- The landing hero no longer renders the circled duplicate site labels or bottom Explore link; slide arrows, the active site's imagery, and the main navigation remain available.

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

## Uploaded Preview Media for Embedded Videos, Including Blog Posts

### Objective

Let WordPress editors attach a custom image or short video preview to YouTube/Vimeo embeds on every supported catalog record, including blog posts. Show that preview in detail video players and, for blog listings, lazily on card hover; load the external player only after the visitor chooses to play the video.

### Editor field meaning

The WordPress field labeled **“Video preview image or clip”** is the thumbnail/poster shown before playback; it is not the YouTube/Vimeo URL or the video itself. Choose an image to show a still or animated thumbnail, or a short video clip to loop silently as the preview. Clicking **Play video** switches to the external video. The attachment is stored separately as `video_preview_media_id`, so it does not change the record’s `video_embed_url`, `gallery_media`, featured image, or detail-page gallery.

### Requirements

1. Show a WordPress Media Library upload/select control labeled **“Video preview image or clip”** alongside **Video URL** in **KYAF Catalog Fields** for `exhibition`, `activity`, `blog_post`, and `moving_image` records. This includes both BK and KYAF blog posts, which share the `blog_post` post type.
2. Allow one optional preview attachment per record. Support static JPEG/PNG/WebP images, animated GIF/WebP images, and short MP4/WebM video clips. Do not promise animated-JPEG behavior; browser support is inconsistent.
3. Keep the preview separate from `video_embed_url`, `gallery_media`, and the featured image. Store a media attachment ID in a dedicated field such as `video_preview_media_id`; expose the resolved preview URL and MIME type through the existing WordPress REST flow.
4. When a valid YouTube/Vimeo URL and preview image are present, display the image in the existing 16:9 video area with an accessible Play video control. When a preview clip is present, show it muted, inline, and looping as a preview; the Play video control must load the YouTube/Vimeo player, not replace it with the preview clip.
5. Do not load the YouTube/Vimeo iframe until the visitor clicks Play. If no custom preview is set, preserve the existing black Play video screen and its click-to-load behavior.
6. On both BK and KYAF blog listing pages, request a blog's preview only when its card is hovered. Show supported images/GIFs as images and MP4/WebM clips muted and inline while hovered; pause clips when hover ends. Keep the featured image initially visible and retain the first gallery image as the fallback if no usable preview is assigned. Do not request preview media for every blog card during initial page load.
7. Do not render a preview in detail or listing views when the record has no valid video URL.
8. Keep preview video short, honor the staging WordPress upload-size/type policy, and avoid changing global server upload limits without separate approval. Lazy-load or defer preview files where practical and pause preview clips when not visible.
9. Preserve existing video URL validation, embed allowlist, consent behavior, gallery slideshows, and saved media. Require normal WordPress edit/upload permissions; do not create an unauthenticated upload or metadata-write endpoint.

### Constraints

- Add the preview editor control to blog posts without adding any new post type or route. Keep current supported detail-page scope: BK and KYAF Exhibitions and Activities, BK Moving Image, and blog detail pages for both sites. Do not create a new KYAF Moving Image route.
- Uploads go through WordPress Media Library and staging WordPress only. Do not send the preview through the static-site repository or store video binaries in Git.
- Validate that the selected attachment is an allowed image/video MIME type and belongs to the current WordPress installation; keep the metadata API protected by WordPress edit permissions.
- Existing records with a video URL and no preview must continue to work without editor changes.
- Uploading, changing, or removing a preview must not mutate the actual YouTube/Vimeo URL, gallery order, or featured image.
- The current gap is in `wordpress/kyaf-catalog-schema/kyaf-catalog-schema.php`: preview metadata is already registered and saved for all catalog post types, and the media script is enqueued for them, but the editor's render condition currently limits the picker to `exhibition`, `activity`, and `moving_image`. Include `blog_post` without changing unrelated editor controls.
- Deploy the WordPress plugin change separately to staging over authorized SSH, lint it with PHP, and deploy any frontend changes through the `kyafQ42026/master` build workflow. Production systems remain out of scope.

### Architecture

```text
WordPress editor
  ├─ Video URL (YouTube/Vimeo) ─ video_embed_url
  └─ Media Library preview picker ─ video_preview_media_id
       available on exhibition, activity, blog_post, moving_image
                   │
                   └─ protected REST metadata + attachment URL/MIME
                         ├─ detail fetch/mapping ─ shared VideoPlayerEmbed
                         │    ├─ image/GIF: poster before Play
                         │    └─ clip: muted inline preview; Play loads external video
                         └─ lazy blog-card request on hover (both sites)
                              ├─ image/GIF: hover image
                              └─ clip: muted preview while hovered
```

The staging plugin already registers `video_preview_media_id`, validates and saves it for every catalog type, and enqueues the Media Library script on each catalog editor. The defect is that `kyaf_catalog_render_meta_box()` omits `blog_post` from the conditional that renders the picker, so blog editors see Video URL and Related records but no preview control. Add `blog_post` to that render condition; do not introduce another metadata key or upload mechanism. The existing REST and frontend code resolves the attachment URL/MIME. Detail players use the preview as a poster/clip before explicit Play; blog-listing cards fetch preview metadata only on hover and preserve their featured/gallery fallback.

### Implementation steps

1. Extend the preview-picker render condition in `kyaf_catalog_render_meta_box()` to include `blog_post`; verify the existing media script, metadata registration, authorization, validation, and save path cover BK and KYAF blog records. Keep the Video URL and Related records controls unchanged.
2. Bump the plugin version/script cache version as appropriate, and update the plugin README/help text to state that blog posts support the same optional preview field.
3. Verify in WordPress that a BK blog post and a KYAF blog post both show the picker next to Video URL. Select/upload, save, reopen, replace, and remove a JPEG/GIF and an MP4/WebM preview; confirm invalid MIME types are rejected and the saved attachment ID survives refresh.
4. Confirm public REST responses expose `video_preview_media_id`; verify the frontend resolves the matching attachment URL/MIME. Test blog detail poster/clip and Play behavior, plus listing hover's lazy request, image/GIF display, muted clip pause-on-leave, and featured/gallery fallback. Confirm no preview appears without a valid video URL.
5. PHP-lint and deploy the plugin separately to staging over authorized SSH. Run the frontend static build through the configured `kyafQ42026/master` workflow if frontend source changes are needed. Do not deploy to production.

### Success criteria

- Editors can upload/select and remove one preview asset next to Video URL in WordPress for exhibitions, activities, moving-image records, and blog posts on both sites.
- Static and animated supported images render as previews; MP4/WebM clips preview muted, inline, and looping without audio.
- Clicking Play loads the record's existing YouTube/Vimeo video; the uploaded preview does not replace or alter the source video.
- On both blog listing pages, preview metadata/media is loaded only after hovering a card; supported image/GIF previews display and video clips play muted only while hovered, with gallery fallback when no preview is available.
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

---

## SEO and AEO Audit: BK and KYAF Sites

**Audit date:** 2026-10-04

**Scope:** Read-only review of the public production URLs at `https://khaoyaiart.org/` and both site prefixes (`/bk/`, `/kyaf/`), plus the current staging deployment at `https://dev.khaoyaiart.org/`. The audit covers source in this repository and live crawler-facing output. No application code or hosting configuration was changed.

### Objective

Establish whether both sites currently support technical SEO and answer-engine discovery, record verified gaps, and define a safe staging-first remediation plan. “AEO” here means discoverability and answerability through crawlable, accurate, well-structured public content; it is not a ranking guarantee or a separate metadata standard.

### Audit findings

| Area | Observed state | Assessment |
|---|---|---|
| Page metadata | Shared helpers provide page titles, descriptions, canonicals, Open Graph, and Twitter cards; home and listing metadata is present on live pages. | Good foundation, but production canonicals for both site prefixes and their details duplicate the prefix: `/bk/bk/...` and `/kyaf/kyaf/...`. |
| Dynamic detail metadata | A live BK exhibition detail rendered an empty title (`| Bangkok Kunsthalle / Khao Yai Art Forest`) and no description, although its visible H1 and content loaded after JavaScript. `str()` returns an empty string, so `str(data?.title) ?? slug` does not fall back to the slug. | High-priority correctness issue. Make fallbacks non-empty and ensure CMS/API misses cannot publish blank metadata. |
| Robots / index policy | Production `robots.txt` allows all user agents, and production pages are `index, follow`. Staging `robots.txt` disallows all and staging metadata is `noindex, nofollow`. | Production is crawl-permitted. Staging's restriction is intentional and must remain; do not promote the staging `public/robots.txt` policy to production. |
| Production sitemap discovery | Production `robots.txt` advertises three `bkkkapp.com` sitemap URLs; the two subdomains tested failed DNS resolution. The active `https://khaoyaiart.org/sitemap.xml` responds but is not the sitemap URL advertised in production `robots.txt`. | Broken/stale sitemap references can prevent consistent discovery. |
| Sitemap coverage | The active root sitemap lists 36 URLs, including sitemap endpoints as if they were content pages. The live `/bk/sitemap.xml` and `/kyaf/sitemap.xml` each list only static routes (17 and 16 entries respectively), with no published detail URLs. | Publish one coherent active-domain sitemap index, include eligible published detail pages, and exclude sitemap endpoints from ordinary URL entries. |
| Structured data | Organization JSON-LD is present on the two site home pages. The source has ExhibitionEvent and BreadcrumbList helpers for exhibition/activity details, but a sampled live BK exhibition detail had no JSON-LD after hydration. Blog and artist details have no corresponding Article/Person markup in source. | Partial, inconsistent coverage. Validate that data is present in the actual built HTML, truthful, and useful for each content type. |
| Entity identity | Homepage Organization `sameAs` Instagram URLs do not match the profile URLs used by the site footer on either site. | Reconcile canonical social profile URLs with the owner before updating entity markup. |
| Rendered content / AEO | The sampled production detail's initial HTML had no H1/body content; the browser showed a loading state first, then rendered the H1 and full text after client-side loading. Production `robots.txt`'s wildcard allow also permits `OAI-SearchBot`. | Content becomes readable after JavaScript, but first-response HTML is a weaker basis for crawlers and answer engines. Prioritize meaningful static HTML and clear page structure. Crawler permission does not guarantee inclusion or citation. |
| Language targeting | The document root declares `lang="en"`; EN/TH changes are client-side on the same URL, with no distinct language URLs or `hreflang` alternates. | Thai content is not independently addressable as a search landing page. Do not emit misleading `hreflang`; a locale-URL decision is needed before implementing separate language SEO. |
| Measurement | No Search Console ownership, URL Inspection results, index coverage report, or AI referral analysis was available in this audit. | This is a technical-readiness review, not a ranking, indexing, or AI-citation performance report. |

### Requirements

1. Build canonical URLs from the correct environment origin and exactly one site prefix. Every canonical and `og:url` must match the final public URL and trailing-slash convention for that page.
2. Give every indexable route a non-empty, distinct, factual title and description. Dynamic metadata must use a sensible fallback when WordPress data is absent, and social-card URLs/alt text must resolve correctly.
3. Keep staging explicitly non-indexable (`Disallow: /` and `noindex`) and free of staging-to-production sitemap leakage. Do not change production indexing policy from this staging project without a separate approved release.
4. For production, maintain crawl access for search and answer engines the owner wants to reach. `OAI-SearchBot` is currently allowed by the wildcard rule; make the choice about `GPTBot`/training policy explicit rather than silently changing it.
5. Provide a single consistent production sitemap discovery path on `khaoyaiart.org`; it must include each eligible canonical static and published detail URL once, exclude noindex/staging URLs and sitemap endpoints, and use meaningful content modification dates.
6. Render primary page content in the static HTML response where the build has WordPress content: a clear H1, descriptive text, and visible entity facts (artist/author, dates, venue/location, and media details as applicable). Do not rely only on client-side loading for the main answer.
7. Add only content-matching structured data: site identity on each home page, breadcrumbs on details, and appropriate Article/Person/Video/Event descriptions where the visible page supports them. Keep schema facts consistent with the page and WordPress source; validate rather than promise a rich result.
8. Preserve existing routes and keep production repositories, WordPress, hosting, analytics, and crawler policy unchanged unless separately approved. Do not create Thai locale routes or `hreflang` until the owner approves a URL strategy.
9. Make important content answer-friendly through editorially accurate summaries, descriptive headings, attribution, dates, locations, and accessible link/image labels. No hidden keyword text or unreviewed generated claims.

### Constraints

- Current project is `HeartBrains/kyafQ42026` and its normal build target is staging. `/bk/` maps to internal ID `bkkk`; `/kyaf/` maps to `kyaf`.
- The site is a Next.js static export built from WordPress REST data and served from `out/`; metadata helpers are in `lib/seo.ts`, JSON-LD helpers in `lib/JsonLd.tsx`, global metadata in `app/layout.tsx`, and sitemap routes/configuration in `app/**/sitemap.ts` and `next-sitemap.config.js`.
- The staging `robots.txt` deliberately blocks all crawlers. Keep it that way during staging work; staging is not an SEO preview environment.
- Root and site-prefix sitemaps are generated through multiple mechanisms today. The implementation must consolidate their public discovery behavior without deleting valid content routes.
- The language switch currently changes client-side state on one URL. Separate indexable English/Thai pages require an owner-approved URL/content strategy; until then, scope this plan to correct English-default metadata and honest language signaling.
- Search Console access and production release approval are not available in this task. Final indexing and performance validation must be done by an authorized site owner after a production release.

### Architecture

```text
WordPress REST content ── build-time static export ── Hostinger pages
                                      │
                ┌─────────────────────┼─────────────────────┐
                ▼                     ▼                     ▼
       metadata URL builder     JSON-LD by page type    sitemap index
         lib/seo.ts               lib/JsonLd.tsx          app/**/sitemap.ts
                │                     │                     │
                └────────────── exact environment config ────┘
                                      │
                 staging: blocked + noindex; production: approved crawl policy
```

Use a single explicit origin/prefix map for canonical and sitemap generation so environment origins and `/bk` or `/kyaf` are joined once. Keep page-specific metadata close to App Router pages, but centralize URL normalization, safe non-empty fallbacks, and schema construction. The build output is the deploy artifact, so validation must inspect both the generated HTML and deployed response—not only client-rendered DOM.

### Implementation steps

1. **Baseline and guardrails**
   - Capture the public URL inventory and representative home, listing, and detail routes for each site.
   - Add automated checks for canonical origin/prefix, duplicate or blank titles, sitemap host/index consistency, staging noindex, and staging exclusion from production URLs.
   - Confirm the staging-only deployment workflow and the separate production boundary before changing source.
2. **Fix canonical and metadata generation**
   - Normalize `SITE_URL`, `BKKK_BASE_URL`, and `KYAF_BASE_URL` semantics and join paths once.
   - Correct `generateMetadata` fallback behavior for exhibitions, activities, moving image, artists, and blogs; ensure valid per-record titles/descriptions and social image fallbacks.
   - Verify `canonical`, Open Graph URL, and Twitter values for root, both site homes, list pages, and representative detail pages.
3. **Repair crawl and sitemap configuration**
   - Remove obsolete/unresolvable sitemap hosts from the production robots configuration and advertise the actual production sitemap index.
   - Build one index on the production host that includes both site maps or all canonical URLs; ensure dynamic published WordPress details are included and sitemap routes do not appear as content.
   - Keep the staging robots/noindex behavior and confirm its generated sitemap never lists production URLs.
4. **Make content and structured data consistent**
   - Inspect static HTML for H1, summary, and main content; move/reuse build-time WordPress data so the core answer is present before hydration.
   - Add or repair schema for the actual page entities (Organization/WebSite, BreadcrumbList, BlogPosting/Article, Person, VideoObject, and exhibition/event only when applicable); reconcile `sameAs` with verified official profiles.
   - Validate JSON-LD against Schema.org and Google tools, and only target Google rich-result features when their content and required fields apply.
5. **Improve localization and AEO readiness without fabricating variants**
   - Keep English-default content coherent and add accurate summaries/headings/attribution/media context to the source-driven pages.
   - Record the separate decision on whether Thai should have distinct URLs. If approved later, add reciprocal `hreflang`, localized metadata/content, and matching sitemap alternates together.
   - Preserve the current broad public crawler access unless the owner directs a separate training-crawler policy change; verify `OAI-SearchBot` access explicitly.
6. **Verify staging and hand off production checks**
   - Build/deploy staging through the configured GitHub Actions workflow; inspect generated and live HTML, robots, sitemap XML, canonicals, titles, descriptions, and schema for both sites.
   - Check that staging remains non-indexable and its sitemaps do not disclose production URLs.
   - Report Search Console URL Inspection/index coverage and Search Analytics as owner-run post-release checks; do not claim SEO ranking or AI citation improvements from technical validation alone.

### Success criteria

- `/bk/` and `/kyaf/` pages and details emit a single correct canonical URL, with no duplicated prefix, and matching Open Graph URLs.
- All sampled indexable pages have meaningful non-empty titles/descriptions; CMS-missing records still have useful fallbacks instead of an empty title.
- Production `robots.txt` advertises only reachable, same-host sitemap URLs; those sitemaps cover all eligible published detail pages and do not list sitemap endpoints as pages.
- Staging remains blocked from indexing, has `noindex`, and exposes no production URLs in its sitemap output.
- Main headings/content are available in the initial static HTML as well as after hydration; visible content and JSON-LD agree.
- Structured data validates for applicable types, has accurate entity/social details, and does not assert unverified event, author, venue, or media facts.
- `OAI-SearchBot` is permitted on the approved public site, while any GPTBot training policy remains an explicit owner decision.
- No Thai `hreflang` is emitted until there are distinct approved language URLs; the current language-switch limitation is documented.
- Staging build/deploy and SEO checks pass. Search Console/indexing status and actual AI citations are separately reported as unavailable until owner access/measurement is supplied.

### References

- [Google Search Central: Block indexing with `noindex`](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Google Search Central: General structured data guidelines](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [Google Search Central: Multilingual and multi-regional sites](https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites)
- [Google Search Central: Event structured data](https://developers.google.com/search/docs/appearance/structured-data/event)
- [OpenAI: Publishers and Developers FAQ](https://help.openai.com/en/articles/12627856-publishers-and-developers-faq)

---

## CMS Updates and Search Index Refresh Audit

**Audit date:** 2026-10-04
**Target:** `HeartBrains/kyafQ42026` on `master`, staging WordPress `q42026.content.khaoyaiart.org`, and staging frontend `dev.khaoyaiart.org`.

### Objective

Determine what a WordPress publish/edit currently refreshes: the website's own search results, the static site output and sitemaps, or external search-engine indexes. Treat these as separate systems; a site rebuild or sitemap update is not proof that Google or another crawler indexed a URL.

### Implementation status

- Updated the deploy-trigger source default and settings-page default to `HeartBrains/kyafQ42026`, and corrected the fine-grained PAT guidance to require repository `Contents: write` access.
- Updated the packaged `public/bkkk-deploy-trigger.zip` to match the plugin PHP source.
- Added the `blog_post` REST collection to BK and KYAF site search, and made the search dialogs refresh data whenever opened.
- Local source/archive checks pass. A full build/PHP lint could not run in this workspace because Node/npm and PHP are unavailable.
- The plugin has not been installed/configured on staging WordPress: SSH authentication was unavailable, and saved WordPress options may override the source fallback. Live trigger behavior remains unverified.

### Verified findings

| System | Current behavior in source | Result |
|---|---|---|
| CMS-to-build trigger | `wp-plugin/bkkk-deploy-trigger/bkkk-deploy-trigger.php` listens to `transition_post_status` in `auto` mode for published records and dispatches `wp_content_updated`; it also has a delete hook. The watched types include exhibitions, activities, moving image, residency artists, team members, blog posts, press items, posts, and pages. | A CMS save/update can request a rebuild if the plugin is installed and active, the mode is `auto`, and the dispatch succeeds. |
| Trigger target/configuration | The plugin requires a GitHub token. In this implementation, the checked-in fallback is corrected to `HeartBrains/kyafQ42026`; a constant or already-saved WordPress option can still override it. | The source default now targets the current repo, but the active staging plugin, trigger mode, token presence, and saved/constant repo override could not be confirmed here. Do not claim the live trigger is working until tested. Never record the token. |
| Static rebuild | `.github/workflows/deploy.yml` listens for `repository_dispatch` type `wp_content_updated`, builds with the q42026 WordPress endpoint and `dev.khaoyaiart.org` URL defaults, commits generated `out/` to `master`, and uses `GH_PAT` so the output push can notify Hostinger. | With a correctly targeted dispatch and valid secrets, CMS changes rebuild the staged static pages and generated sitemap output; Hostinger's Git deployment can then publish the pushed output. This pipeline is conditional on a successful workflow and Hostinger sync. |
| Website's own search | BK and KYAF `SearchDialog` components fetch `getFullSearchData()` when opened. Their search-data modules fetch published WordPress REST records in the browser and filter records by site metadata; this is a live client-side collection, not a generated JSON search-index artifact. This implementation adds the `blog_post` REST collection to both site indexes. | A fresh search open fetches current CMS content; a dialog already open does not poll/refetch. Blog records are now included in source for both sites, subject to the public REST endpoint returning them. |
| External search engines | The staging workflow sets `NEXT_PUBLIC_ALLOW_INDEXING=false`; `app/layout.tsx` turns that into `noindex,nofollow`. Staging `public/robots.txt` also disallows all crawlers. | The staging site is intentionally not indexable. A CMS-triggered build does not change this policy and does not itself update Google's index. The production indexing decision/build is separate. |
| Sitemap / crawler indexing | BK and KYAF sitemap routes fetch WordPress records at static-build time. Google describes a sitemap as a discovery hint, not a guarantee; recrawling may take days to weeks and inclusion is not guaranteed. | A successful rebuild can refresh sitemap contents for crawlers, but the crawler must revisit and independently decide whether/how to index each URL. |

The WordPress core documentation confirms `transition_post_status` also fires when an already-published post is edited without a status change, which supports the plugin's update hook. That describes hook behavior, not proof that the staging plugin is active or its GitHub API request succeeded.

### Requirements

1. Report the three outcomes separately: website-internal search refresh, generated static HTML/sitemap refresh, and Google/other external indexing. Never call these all “the search index.”
2. Before describing CMS-triggered rebuilds as operational, verify that the deployed staging plugin is active, set to `auto` (or document that editors must use its manual publish control), has a valid repository-dispatch credential, and targets `HeartBrains/kyafQ42026` rather than relying on the legacy source default.
3. Prove the integration end to end using an authorized, reversible staging content change: observe one `wp_content_updated` event, a successful Actions build, updated expected files/sitemap in the `out/` commit, and Hostinger serving the new version. Do not create or modify content without approval; use a specifically approved test record if a live test is needed.
4. Keep staging `Disallow: /` and `noindex,nofollow`. Do not submit staging URLs to search engines or remove the staging indexing guard as part of this audit.
5. Include published blog posts in the website's own search on both BK and KYAF via the `blog_post` REST endpoint, and refresh the results data each time the search dialog opens. Verify site filtering, pagination, language behavior, and failure states.
6. Keep Google/Search Console recrawl and index status as separate post-release checks. Submit/maintain the production sitemap and use URL Inspection only for URLs the owner controls; do not promise immediate crawling, indexing, ranking, or AEO citations.
7. Do not change production repositories, WordPress, hosting, robots policy, or crawler policy under this staging audit. Keep credentials out of specs, logs, and commits.

### Constraints

- Repo-side implementation is authorized: update the plugin source/package and BK/KYAF frontend search behavior. Do not mutate live WordPress settings/content or production systems as part of this code change.
- The authoritative frontend repo is `HeartBrains/kyafQ42026`, not the legacy repo named by the WordPress plugin's checked-in default.
- Live staging WordPress option values and plugin activation were not verifiable from this workspace. Preserve this as an explicit unknown until confirmed in WordPress admin or through authorized read-only access.
- The GitHub workflow's defaults point to q42026 WordPress and dev site, and explicitly turn indexing off. Any production build/publishing path needs a separate, reviewed configuration and deployment.
- Public-search crawler behavior is controlled by the public site's served HTML headers/meta, robots policy, reachable canonical sitemap, and the crawler's own processing—not just the WordPress update hook.

### Architecture

```text
WordPress publish/edit
  ├─ website search: browser fetches site-filtered REST collections on each SearchDialog open
  │    └─ blog_post is included for BK and KYAF; already-open dialogs do not poll
  └─ optional deploy trigger (must be active + auto + correct repo + credential)
       └─ repository_dispatch: wp_content_updated
            └─ kyafQ42026 GitHub Actions static build from q42026 WordPress
                 ├─ static HTML and sitemap files generated into out/
                 ├─ out/ committed/pushed to master
                 └─ Hostinger Git deployment publishes staging output

Staging output: robots Disallow + noindex → intentionally excluded from external indexing
Production output: separate approved crawl policy → sitemap aids discovery;
                  Google/crawlers choose crawl/index timing and inclusion
```

Keep the internal search data path (client-side WordPress REST requests) distinct from build output and crawler indexing. Do not introduce a static search artifact unless separately approved; verify blog search and confirm whether CMS-triggered deployment works in the live staging configuration.

### Implementation steps

1. **Confirm the live dispatch settings without exposing secrets**: verify plugin activation, auto/manual mode, repository target set to `HeartBrains/kyafQ42026`, token/credential validity, and that repository dispatch is enabled. If access is unavailable, report this as unverified rather than infer it from source defaults.
2. **Deploy the plugin source/package separately**: install the updated plugin package to staging WordPress only through authorized access, set/verify the repository option if an existing value overrides the default, and preserve the token outside the repository.
3. **Test the rebuild chain safely**: after approval for a staging content test, verify the WordPress event, `wp_content_updated` dispatch, Actions success, new/updated static record and sitemap, pushed `out/`, and Hostinger deployment. Record run IDs/timestamps, not credentials.
4. **Verify internal search behavior**: test a fresh dialog open after a representative CMS update and confirm the matching published blog appears for the correct site/language, with no cross-site results. Test both sites' other supported record types and API-failure behavior.
5. **Verify crawler safeguards/discovery**: inspect served staging `robots.txt`, rendered robots meta, canonicals, and sitemap contents after rebuild; confirm they remain staging-only and noindex. For production, check its separately deployed production URLs/sitemaps and Search Console status after an approved release.
6. **Report the result by system**: state whether CMS edits update the internal search view, static site output/sitemap, and external search listings; list remaining config or access blockers and avoid claiming crawler indexing based only on a successful build.

### Success criteria

- The live CMS trigger is either proven to dispatch automatically to `HeartBrains/kyafQ42026` and reach Hostinger, or clearly reported as unverified/disabled with the exact configuration step remaining.
- An approved staging publish/edit produces updated static page output and sitemap through the expected workflow; no manual stale `out/` push is used as a substitute.
- The search dialog refreshes WordPress-backed data whenever it opens, and published blog-post records are included on both sites with correct site/language behavior.
- Staging continues to serve `Disallow: /` and `noindex,nofollow`, and staging URLs do not enter a production sitemap or index submission.
- External search-engine indexing is described as crawler-controlled and not guaranteed by CMS publish, a GitHub Actions build, or sitemap submission.

### References

- [WordPress Developer Resources: `wp_transition_post_status()`](https://developer.wordpress.org/reference/functions/wp_transition_post_status/)
- [WordPress Developer Resources: `transition_post_status` hook](https://developer.wordpress.org/reference/hooks/transition_post_status/)
- [Google Search Central: Ask Google to recrawl URLs](https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl)
- [Google Search Central: Sitemap overview](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview)
