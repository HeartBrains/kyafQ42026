# KYAF Catalog Schema

Install this directory as a WordPress plugin on the **staging WordPress instance only**.

It provides:

- the REST-enabled `activity_tag` taxonomy and six approved terms;
- migration of recognized legacy `tags_en` values, with an admin review count;
- REST-visible video, gallery, hero, secondary-image, and relation fields;
- a simple editor meta box for the new fields;
- bidirectional related-post IDs and normalized `related_content_json` consumed by the frontend.

## Safe installation

1. Back up the staging database and `wp-content`.
2. Copy `kyaf-catalog-schema` into `wp-content/plugins/` on `q42026.content.khaoyaiart.org`.
3. Activate **KYAF Catalog Schema** in WordPress.
4. Review the migration notice and assign tags to any unmapped activities.
5. Edit representative posts in each content family and set related post IDs.
6. Confirm `activity_tag` and the new `meta` fields appear in the REST response.
7. Rebuild the staging frontend.

Deactivating the plugin unregisters the schema but deliberately preserves its terms and post meta. Restore the database backup to fully roll back migrated assignments.
