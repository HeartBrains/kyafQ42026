# KYAF Catalog Schema

Install this directory as a WordPress plugin on the **staging WordPress instance only**.

It provides:

- the REST-enabled `activity_tag` taxonomy and six approved terms;
- migration of recognized legacy `tags_en` values, with an admin review count;
- REST-visible video, gallery, hero, secondary-image, and relation fields; `gallery_media` retains its legacy comma-separated URL values and also accepts attachment IDs for new uploads;
- a Media Library preview picker for supported video records, including blog posts, with the preview stored separately from the embed URL, featured image, and gallery;
- an editor meta box with searchable, ordered related-record selection;
- any number of one-way related records per item, limited to published exhibitions, activities, moving image, artists/residency, and blog records from the same site;
- normalized `related_content_json` consumed by the frontend.

## Safe installation

1. Back up the staging database and `wp-content`.
2. Copy `kyaf-catalog-schema` into `wp-content/plugins/` on `q42026.content.khaoyaiart.org`.
3. Activate **KYAF Catalog Schema** in WordPress.
4. Open **Settings → KYAF Catalog** (or click **Settings** beside the plugin) to review schema status.
5. Use **Review activities** to assign tags to any unmapped activities.
6. Edit representative posts in each content family. For exhibition, activity, moving image, and blog posts, the KYAF Catalog Fields box includes an optional video preview image/clip selector. Search for related records from the same site, select any number, and use the arrow controls to set display order.
7. Confirm `activity_tag` and the `meta` fields appear in the REST response; `gallery_media` should remain a comma-separated URL/ID string, not an integer array.
8. Rebuild the staging frontend.

Related links are directional: choosing a record does not automatically create a reverse link. The plugin validates the site, record type, publication status, duplicates, and self-links when saving; it does not impose a relationship count limit.

Deactivating the plugin unregisters the schema but deliberately preserves its terms and post meta. Restore the database backup to fully roll back migrated assignments.
