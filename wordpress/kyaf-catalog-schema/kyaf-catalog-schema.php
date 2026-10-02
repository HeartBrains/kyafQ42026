<?php
/**
 * Plugin Name: KYAF Catalog Schema
 * Description: Versioned activity taxonomy, editorial media fields, and curated related-content data for the KYAF/BKKK frontend.
 * Version: 0.7.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Author: HeartBrains
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const KYAF_CATALOG_POST_TYPES = array( 'exhibition', 'activity', 'residency_artist', 'blog_post', 'moving_image' );
const KYAF_CATALOG_RELATION_TYPES = array(
	'exhibition'       => 'Exhibition',
	'activity'         => 'Activity',
	'moving_image'     => 'Moving image',
	'residency_artist' => 'Artist / residency',
	'blog_post'        => 'Blog',
);

function kyaf_catalog_register_schema() {
	register_taxonomy(
		'activity_tag',
		array( 'activity' ),
		array(
			'labels'            => array(
				'name'          => 'Activity Tags',
				'singular_name' => 'Activity Tag',
			),
			'public'            => true,
			'hierarchical'      => false,
			'show_ui'           => true,
			'show_admin_column' => true,
			'show_in_rest'      => true,
			'rest_base'         => 'activity_tag',
			'rewrite'           => false,
		)
	);

	$string_fields = array(
		'video_embed_url'     => 'esc_url_raw',
		'secondary_image_url' => 'esc_url_raw',
		'hero_landscape_image'=> 'esc_url_raw',
		'hero_portrait_image' => 'esc_url_raw',
		'gallery_media'       => 'kyaf_catalog_sanitize_gallery_meta',
		'related_content_json'=> 'sanitize_textarea_field',
	);

	foreach ( KYAF_CATALOG_POST_TYPES as $post_type ) {
		foreach ( $string_fields as $key => $sanitize_callback ) {
			register_post_meta(
				$post_type,
				$key,
				array(
					'type'              => 'string',
					'single'            => true,
					'show_in_rest'      => true,
					'sanitize_callback' => $sanitize_callback,
					'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
						return current_user_can( 'edit_post', $post_id );
					},
				)
			);
		}

		foreach ( array( 'related_content_ids' ) as $array_key ) {
			register_post_meta(
				$post_type,
				$array_key,
				array(
					'type'         => 'array',
					'single'       => true,
					'show_in_rest' => array(
						'schema' => array(
							'type'  => 'array',
							'items' => array( 'type' => 'integer' ),
						),
					),
					'sanitize_callback' => 'kyaf_catalog_sanitize_ids',
					'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
						return current_user_can( 'edit_post', $post_id );
					},
				)
			);
		}
	}
}
add_action( 'init', 'kyaf_catalog_register_schema', 20 );

function kyaf_catalog_sanitize_ids( $value ) {
	if ( is_string( $value ) ) {
		$decoded = json_decode( $value, true );
		$value   = is_array( $decoded ) ? $decoded : preg_split( '/[\s,]+/', $value );
	}
	$values = is_array( $value ) ? $value : array();
	return array_values( array_unique( array_filter( array_map( 'absint', $values ) ) ) );
}

/**
 * Keep the legacy gallery_media contract: a comma-separated list of image URLs
 * or attachment IDs. Existing JetEngine galleries store URLs in this field.
 */
function kyaf_catalog_sanitize_gallery_meta( $value ) {
	if ( is_string( $value ) ) {
		$decoded = json_decode( $value, true );
		$value   = is_array( $decoded ) ? $decoded : preg_split( '/\s*,\s*/', trim( $value ) );
	}

	$items = is_array( $value ) ? $value : array();
	$clean = array();
	foreach ( $items as $item ) {
		if ( is_numeric( $item ) ) {
			$attachment_id = absint( $item );
			if ( $attachment_id && wp_attachment_is_image( $attachment_id ) ) {
				$clean[] = (string) $attachment_id;
			}
			continue;
		}

		if ( ! is_string( $item ) ) {
			continue;
		}
		$url    = esc_url_raw( trim( $item ) );
		$scheme = strtolower( (string) wp_parse_url( $url, PHP_URL_SCHEME ) );
		if ( $url && in_array( $scheme, array( 'http', 'https' ), true ) ) {
			$clean[] = $url;
		}
	}

	return implode( ',', array_values( array_unique( $clean ) ) );
}

function kyaf_catalog_activate() {
	kyaf_catalog_register_schema();
	$terms = array(
		'talks-lectures' => 'Talks & Lectures',
		'performances'   => 'Performances',
		'screening'      => 'Screening',
		'workshops'      => 'Workshops',
		'gastronomy'     => 'Gastronomy',
		'sound'          => 'Sound',
	);
	foreach ( $terms as $slug => $name ) {
		if ( ! term_exists( $slug, 'activity_tag' ) ) {
			wp_insert_term( $name, 'activity_tag', array( 'slug' => $slug ) );
		}
	}
	kyaf_catalog_map_legacy_activity_tags();
	flush_rewrite_rules();
}
register_activation_hook( __FILE__, 'kyaf_catalog_activate' );

function kyaf_catalog_deactivate() {
	flush_rewrite_rules();
}
register_deactivation_hook( __FILE__, 'kyaf_catalog_deactivate' );

function kyaf_catalog_normalize_tag( $value ) {
	$slug = sanitize_title( str_replace( '&', 'and', $value ) );
	$aliases = array(
		'talk'               => 'talks-lectures',
		'talks'              => 'talks-lectures',
		'lecture'            => 'talks-lectures',
		'lectures'           => 'talks-lectures',
		'talks-and-lectures' => 'talks-lectures',
		'performance'        => 'performances',
		'performances'       => 'performances',
		'screenings'         => 'screening',
		'workshop'           => 'workshops',
		'food'               => 'gastronomy',
	);
	return $aliases[ $slug ] ?? $slug;
}

function kyaf_catalog_map_legacy_activity_tags() {
	$allowed = array( 'talks-lectures', 'performances', 'screening', 'workshops', 'gastronomy', 'sound' );
	$posts = get_posts(
		array(
			'post_type'      => 'activity',
			'post_status'    => 'any',
			'posts_per_page' => -1,
			'fields'         => 'ids',
		)
	);
	$mapped = 0;
	$unmapped = array();
	foreach ( $posts as $post_id ) {
		$legacy = (string) get_post_meta( $post_id, 'tags_en', true );
		$terms = array_values(
			array_intersect(
				$allowed,
				array_map( 'kyaf_catalog_normalize_tag', array_filter( array_map( 'trim', explode( ',', $legacy ) ) ) )
			)
		);
		if ( $terms ) {
			wp_set_object_terms( $post_id, $terms, 'activity_tag', true );
			++$mapped;
		} else {
			$unmapped[] = $post_id;
		}
	}
	update_option(
		'kyaf_catalog_migration_report',
		array( 'mapped' => $mapped, 'unmapped' => $unmapped, 'timestamp' => time() ),
		false
	);
}

function kyaf_catalog_add_meta_boxes() {
	foreach ( KYAF_CATALOG_POST_TYPES as $post_type ) {
		add_meta_box( 'kyaf-catalog-fields', 'KYAF Catalog Fields', 'kyaf_catalog_render_meta_box', $post_type, 'normal', 'default' );
		add_meta_box( 'kyaf-catalog-gallery-media', 'Primary Gallery Images', 'kyaf_catalog_render_gallery_media_meta_box', $post_type, 'side', 'high' );
	}
}
add_action( 'add_meta_boxes', 'kyaf_catalog_add_meta_boxes' );

function kyaf_catalog_enqueue_related_admin_script( $hook ) {
	if ( ! in_array( $hook, array( 'post.php', 'post-new.php' ), true ) ) {
		return;
	}
	$screen = get_current_screen();
	if ( ! $screen || ! in_array( $screen->post_type, KYAF_CATALOG_POST_TYPES, true ) ) {
		return;
	}
	wp_enqueue_media();
	wp_enqueue_script(
		'kyaf-catalog-related-content',
		plugin_dir_url( __FILE__ ) . 'related-content-admin.js',
		array(),
		'0.7.0',
		true
	);
	wp_enqueue_script(
		'kyaf-catalog-gallery-media',
		plugin_dir_url( __FILE__ ) . 'gallery-media-admin.js',
		array( 'media-editor' ),
		'0.7.0',
		true
	);
	wp_enqueue_style(
		'kyaf-catalog-gallery-media',
		plugin_dir_url( __FILE__ ) . 'gallery-media-admin.css',
		array(),
		'0.7.0'
	);
	wp_localize_script(
		'kyaf-catalog-gallery-media',
		'kyafCatalogGalleryMedia',
		array(
			'title'      => 'Select gallery images',
			'buttonText' => 'Use selected images',
			'moveUp'     => 'Move up',
			'moveDown'   => 'Move down',
			'remove'     => 'Remove image',
			'noImages'   => 'No gallery images selected.',
			'imageLabel' => 'Image',
		)
	);
	wp_localize_script(
		'kyaf-catalog-related-content',
		'kyafCatalogRelatedContent',
		array(
			'ajaxUrl' => admin_url( 'admin-ajax.php' ),
			'nonce'   => wp_create_nonce( 'kyaf_catalog_related_search' ),
			'messages' => array(
				'loading'  => 'Searching…',
				'empty'    => 'No matching records found on this site.',
				'failed'   => 'Search failed. Please try again.',
				'moveUp'   => 'Move up',
				'moveDown' => 'Move down',
				'remove'   => 'Remove',
			)
		)
	);
}
add_action( 'admin_enqueue_scripts', 'kyaf_catalog_enqueue_related_admin_script' );

function kyaf_catalog_related_item( $source_id, $related_id ) {
	$source_id  = absint( $source_id );
	$related_id = absint( $related_id );
	$source     = get_post( $source_id );
	$related    = get_post( $related_id );
	if ( ! $source || ! $related || $source_id === $related_id || 'publish' !== $related->post_status ) {
		return false;
	}
	if ( ! isset( KYAF_CATALOG_RELATION_TYPES[ $related->post_type ] ) ) {
		return false;
	}
	$site = (string) get_post_meta( $source_id, 'site', true );
	if ( ! in_array( $site, array( 'bkkk', 'kyaf' ), true ) || $site !== (string) get_post_meta( $related_id, 'site', true ) ) {
		return false;
	}

	$type_map = array(
		'exhibition'       => 'exhibitions',
		'activity'         => 'activities',
		'moving_image'     => 'moving-image',
		'residency_artist' => 'residency',
		'blog_post'        => 'blog',
	);
	$image = get_the_post_thumbnail_url( $related_id, 'large' );
	if ( ! $image ) {
		$image = get_post_meta( $related_id, 'featured_image_url', true );
		if ( is_array( $image ) ) {
			$image = reset( $image );
		}
		if ( is_numeric( $image ) ) {
			$image = wp_get_attachment_image_url( absint( $image ), 'large' );
		}
	}
	$image = is_string( $image ) ? esc_url_raw( $image ) : '';
	$title = get_the_title( $related_id );
	$date  = (string) get_post_meta( $related_id, 'date_display_en', true );
	if ( '' === $date ) {
		$date = get_the_date( 'j F Y', $related_id );
	}
	$status = sanitize_key( (string) get_post_meta( $related_id, 'status', true ) );
	$post_type_object = get_post_type_object( $related->post_type );

	return array(
		'id'       => (string) $related_id,
		'slug'     => $related->post_name,
		'type'     => $type_map[ $related->post_type ],
		'title'    => array(
			'en' => $title,
			'th' => (string) ( get_post_meta( $related_id, 'title_th', true ) ?: $title ),
		),
		'date'     => $date,
		'image'    => $image,
		'category' => $post_type_object ? $post_type_object->labels->singular_name : '',
		'status'   => in_array( $status, array( 'current', 'upcoming', 'past' ), true ) ? $status : '',
		'site'     => $site,
	);
}

function kyaf_catalog_valid_related_ids( $source_id, $related_ids ) {
	$valid = array();
	foreach ( kyaf_catalog_sanitize_ids( $related_ids ) as $related_id ) {
		if ( kyaf_catalog_related_item( $source_id, $related_id ) ) {
			$valid[] = $related_id;
		}
	}
	return $valid;
}

function kyaf_catalog_render_meta_box( $post ) {
	wp_nonce_field( 'kyaf_catalog_save_fields', 'kyaf_catalog_nonce' );
	$fields = array(
		'video_embed_url'      => 'Video URL (YouTube or Vimeo)',
		'secondary_image_url'  => 'Secondary card image URL',
		'hero_landscape_image' => 'Hero landscape image URL',
		'hero_portrait_image'  => 'Hero portrait image URL',
	);
	foreach ( $fields as $key => $label ) {
		$value = get_post_meta( $post->ID, $key, true );
		if ( is_array( $value ) ) {
			$value = implode( ', ', $value );
		}
		printf(
			'<p><label for="%1$s"><strong>%2$s</strong></label><br><input class="widefat" id="%1$s" name="%1$s" type="text" value="%3$s"></p>',
			esc_attr( $key ),
			esc_html( $label ),
			esc_attr( $value )
		);
	}

	$related_ids = kyaf_catalog_valid_related_ids( $post->ID, get_post_meta( $post->ID, 'related_content_ids', true ) );
	$related_items = array_values( array_filter( array_map( function ( $related_id ) use ( $post ) {
		return kyaf_catalog_related_item( $post->ID, $related_id );
	}, $related_ids ) ) );
	$related_ids = array_map( 'absint', array_column( $related_items, 'id' ) );
	?>
	<hr>
	<div class="kyaf-catalog-related" data-kyaf-related-control data-post-id="<?php echo esc_attr( $post->ID ); ?>" data-initial-items="<?php echo esc_attr( wp_json_encode( $related_items ) ); ?>">
		<p><strong>Related records</strong></p>
		<p class="description">Search published records on this site. Choose any number; the order below is the display order.</p>
		<label class="screen-reader-text" for="kyaf-catalog-related-search">Search related records</label>
		<input class="widefat" id="kyaf-catalog-related-search" type="search" autocomplete="off" placeholder="Search exhibitions, activities, moving image, artists, or blog…">
		<div data-related-status role="status" aria-live="polite"></div>
		<div class="kyaf-catalog-related-results" data-related-results aria-label="Related record search results" style="max-height:240px;overflow-y:auto;margin-top:8px"></div>
		<ol class="kyaf-catalog-related-selected" data-related-selected aria-label="Selected related records"></ol>
		<input type="hidden" name="related_content_ids" value="<?php echo esc_attr( wp_json_encode( $related_ids ) ); ?>" data-related-ids>
	</div>
	<?php
}

function kyaf_catalog_render_gallery_media_meta_box( $post ) {
	wp_nonce_field( 'kyaf_catalog_save_gallery_media', 'kyaf_catalog_gallery_nonce' );
	$gallery_items = kyaf_catalog_sanitize_gallery_meta( get_post_meta( $post->ID, 'gallery_media', true ) );
	?>
	<div class="kyaf-catalog-gallery" data-kyaf-gallery-control>
		<p class="description">Upload or select images for the detail-page gallery. Existing gallery images are retained; order the images below to set the slide order.</p>
		<input
			type="hidden"
			id="gallery_media"
			name="gallery_media"
			value="<?php echo esc_attr( $gallery_items ); ?>"
			data-gallery-ids
		>
		<ol class="kyaf-catalog-gallery-preview" data-gallery-preview aria-label="Selected gallery images"></ol>
		<p class="description" data-gallery-empty aria-live="polite">No gallery images selected.</p>
		<button type="button" class="button button-primary kyaf-catalog-gallery-add" data-gallery-add>
			Select or upload images
		</button>
	</div>
	<?php
}

function kyaf_catalog_search_related_posts() {
	check_ajax_referer( 'kyaf_catalog_related_search', 'nonce' );
	$source_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;
	$source    = get_post( $source_id );
	if ( ! $source || ! in_array( $source->post_type, KYAF_CATALOG_POST_TYPES, true ) || ! current_user_can( 'edit_post', $source_id ) ) {
		wp_send_json_error( array( 'message' => 'You cannot edit this record.' ), 403 );
	}
	$site  = (string) get_post_meta( $source_id, 'site', true );
	$query = isset( $_POST['query'] ) ? sanitize_text_field( wp_unslash( $_POST['query'] ) ) : '';
	if ( ! in_array( $site, array( 'bkkk', 'kyaf' ), true ) || strlen( $query ) < 2 ) {
		wp_send_json_success( array() );
	}

	$results = get_posts( array(
		'post_type'              => array_keys( KYAF_CATALOG_RELATION_TYPES ),
		'post_status'            => 'publish',
		'posts_per_page'         => 20,
		's'                      => $query,
		'post__not_in'           => array( $source_id ),
		'orderby'                => 'title',
		'order'                  => 'ASC',
		'no_found_rows'          => true,
		'update_post_meta_cache' => true,
		'meta_query'             => array(
			array(
				'key'     => 'site',
				'value'   => $site,
				'compare' => '=',
			),
		),
	) );
	$items = array_values( array_filter( array_map( function ( $result ) use ( $source_id ) {
		return kyaf_catalog_related_item( $source_id, $result->ID );
	}, $results ) ) );
	wp_send_json_success( $items );
}
add_action( 'wp_ajax_kyaf_catalog_search_related_posts', 'kyaf_catalog_search_related_posts' );

function kyaf_catalog_save_fields( $post_id ) {
	$valid_fields_nonce = isset( $_POST['kyaf_catalog_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kyaf_catalog_nonce'] ) ), 'kyaf_catalog_save_fields' );
	$valid_gallery_nonce = isset( $_POST['kyaf_catalog_gallery_nonce'] )
		&& wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kyaf_catalog_gallery_nonce'] ) ), 'kyaf_catalog_save_gallery_media' );
	if ( ! $valid_fields_nonce && ! $valid_gallery_nonce ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) || ! in_array( get_post_type( $post_id ), KYAF_CATALOG_POST_TYPES, true ) ) {
		return;
	}

	if ( $valid_fields_nonce ) {
		$url_fields = array( 'video_embed_url', 'secondary_image_url', 'hero_landscape_image', 'hero_portrait_image' );
		foreach ( $url_fields as $key ) {
			$value = isset( $_POST[ $key ] ) ? esc_url_raw( wp_unslash( $_POST[ $key ] ) ) : '';
			$value ? update_post_meta( $post_id, $key, $value ) : delete_post_meta( $post_id, $key );
		}

		$related = isset( $_POST['related_content_ids'] ) ? kyaf_catalog_sanitize_ids( wp_unslash( $_POST['related_content_ids'] ) ) : array();
		$related = kyaf_catalog_valid_related_ids( $post_id, $related );
		update_post_meta( $post_id, 'related_content_ids', $related );
		kyaf_catalog_refresh_related_json( $post_id );
	}

	if ( $valid_gallery_nonce ) {
		$gallery = isset( $_POST['gallery_media'] ) ? kyaf_catalog_sanitize_gallery_meta( wp_unslash( $_POST['gallery_media'] ) ) : '';
		update_post_meta( $post_id, 'gallery_media', $gallery );
	}
}
add_action( 'save_post', 'kyaf_catalog_save_fields', 20 );

function kyaf_catalog_refresh_related_json( $post_id ) {
	$items = array();
	$related_ids = kyaf_catalog_valid_related_ids( $post_id, get_post_meta( $post_id, 'related_content_ids', true ) );
	foreach ( $related_ids as $related_id ) {
		$item = kyaf_catalog_related_item( $post_id, $related_id );
		if ( $item ) {
			$items[] = $item;
		}
	}
	update_post_meta( $post_id, 'related_content_json', wp_json_encode( $items, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
}

function kyaf_catalog_refresh_related_parents( $post_id, $post ) {
	if ( ! $post || ! in_array( $post->post_type, KYAF_CATALOG_POST_TYPES, true ) || wp_is_post_revision( $post_id ) || wp_is_post_autosave( $post_id ) ) {
		return;
	}
	$needle  = 'i:' . absint( $post_id ) . ';';
	$parents = get_posts( array(
		'post_type'      => KYAF_CATALOG_POST_TYPES,
		'post_status'    => array( 'publish', 'private', 'draft' ),
		'posts_per_page' => -1,
		'fields'         => 'ids',
		'meta_query'     => array(
			array(
				'key'     => 'related_content_ids',
				'value'   => $needle,
				'compare' => 'LIKE',
			),
		),
	) );
	foreach ( $parents as $parent_id ) {
		if ( absint( $parent_id ) !== absint( $post_id ) ) {
			kyaf_catalog_refresh_related_json( $parent_id );
		}
	}
}
add_action( 'save_post', 'kyaf_catalog_refresh_related_parents', 30, 2 );

function kyaf_catalog_admin_notice() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	$report = get_option( 'kyaf_catalog_migration_report' );
	if ( ! is_array( $report ) ) {
		return;
	}
	printf(
		'<div class="notice notice-info is-dismissible"><p>KYAF Catalog Schema mapped %1$d activities. %2$d activities still need a tag review.</p></div>',
		absint( $report['mapped'] ?? 0 ),
		count( $report['unmapped'] ?? array() )
	);
}
add_action( 'admin_notices', 'kyaf_catalog_admin_notice' );

function kyaf_catalog_add_settings_page() {
	add_options_page(
		'KYAF Catalog Schema',
		'KYAF Catalog',
		'manage_options',
		'kyaf-catalog-schema',
		'kyaf_catalog_render_settings_page'
	);
}
add_action( 'admin_menu', 'kyaf_catalog_add_settings_page' );

function kyaf_catalog_plugin_action_links( $links ) {
	$settings_url = admin_url( 'options-general.php?page=kyaf-catalog-schema' );
	array_unshift(
		$links,
		sprintf( '<a href="%s">%s</a>', esc_url( $settings_url ), esc_html__( 'Settings', 'kyaf-catalog-schema' ) )
	);
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'kyaf_catalog_plugin_action_links' );

function kyaf_catalog_count_activities() {
	$counts = wp_count_posts( 'activity' );
	$total  = 0;
	foreach ( get_post_stati() as $status ) {
		$total += isset( $counts->{$status} ) ? absint( $counts->{$status} ) : 0;
	}
	return $total;
}

function kyaf_catalog_count_untagged_activities() {
	$query = new WP_Query(
		array(
			'post_type'              => 'activity',
			'post_status'            => 'any',
			'posts_per_page'         => 1,
			'fields'                 => 'ids',
			'no_found_rows'          => false,
			'update_post_meta_cache' => false,
			'update_post_term_cache' => false,
			'tax_query'              => array(
				array(
					'taxonomy' => 'activity_tag',
					'operator' => 'NOT EXISTS',
				),
			),
		)
	);
	return absint( $query->found_posts );
}

function kyaf_catalog_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}

	$terms        = get_terms( array( 'taxonomy' => 'activity_tag', 'hide_empty' => false ) );
	$report       = get_option( 'kyaf_catalog_migration_report', array() );
	$total        = kyaf_catalog_count_activities();
	$untagged     = kyaf_catalog_count_untagged_activities();
	$tagged       = max( 0, $total - $untagged );
	$activities_url = admin_url( 'edit.php?post_type=activity' );
	$tags_url       = admin_url( 'edit-tags.php?taxonomy=activity_tag&post_type=activity' );
	$rest_url       = rest_url( 'wp/v2/activity_tag' );
	?>
	<div class="wrap">
		<h1><?php echo esc_html__( 'KYAF Catalog Schema', 'kyaf-catalog-schema' ); ?></h1>
		<p><?php echo esc_html__( 'Manage activity tags and confirm that the catalog fields are available to the staging frontend.', 'kyaf-catalog-schema' ); ?></p>

		<h2><?php echo esc_html__( 'Schema status', 'kyaf-catalog-schema' ); ?></h2>
		<table class="widefat striped" style="max-width: 760px">
			<tbody>
				<tr><th scope="row"><?php echo esc_html__( 'Plugin version', 'kyaf-catalog-schema' ); ?></th><td>0.7.0</td></tr>
				<tr><th scope="row"><?php echo esc_html__( 'Activity tags', 'kyaf-catalog-schema' ); ?></th><td><?php echo esc_html( sprintf( '%d tagged / %d total', $tagged, $total ) ); ?></td></tr>
				<tr><th scope="row"><?php echo esc_html__( 'Need tag review', 'kyaf-catalog-schema' ); ?></th><td><?php echo esc_html( (string) $untagged ); ?></td></tr>
				<tr><th scope="row"><?php echo esc_html__( 'Last activation migration', 'kyaf-catalog-schema' ); ?></th><td><?php echo esc_html( sprintf( '%d automatically mapped', absint( $report['mapped'] ?? 0 ) ) ); ?></td></tr>
				<tr><th scope="row"><?php echo esc_html__( 'REST endpoint', 'kyaf-catalog-schema' ); ?></th><td><a href="<?php echo esc_url( $rest_url ); ?>" target="_blank" rel="noopener noreferrer"><?php echo esc_html( $rest_url ); ?></a></td></tr>
			</tbody>
		</table>

		<p>
			<a class="button button-primary" href="<?php echo esc_url( $activities_url ); ?>"><?php echo esc_html__( 'Review activities', 'kyaf-catalog-schema' ); ?></a>
			<a class="button" href="<?php echo esc_url( $tags_url ); ?>"><?php echo esc_html__( 'Manage activity tags', 'kyaf-catalog-schema' ); ?></a>
		</p>

		<h2><?php echo esc_html__( 'Activity tag usage', 'kyaf-catalog-schema' ); ?></h2>
		<table class="widefat striped" style="max-width: 760px">
			<thead><tr><th><?php echo esc_html__( 'Tag', 'kyaf-catalog-schema' ); ?></th><th><?php echo esc_html__( 'Slug', 'kyaf-catalog-schema' ); ?></th><th><?php echo esc_html__( 'Activities', 'kyaf-catalog-schema' ); ?></th></tr></thead>
			<tbody>
			<?php if ( is_wp_error( $terms ) || empty( $terms ) ) : ?>
				<tr><td colspan="3"><?php echo esc_html__( 'No activity tags found.', 'kyaf-catalog-schema' ); ?></td></tr>
			<?php else : ?>
				<?php foreach ( $terms as $term ) : ?>
					<tr><td><?php echo esc_html( $term->name ); ?></td><td><code><?php echo esc_html( $term->slug ); ?></code></td><td><?php echo esc_html( (string) $term->count ); ?></td></tr>
				<?php endforeach; ?>
			<?php endif; ?>
			</tbody>
		</table>

		<h2><?php echo esc_html__( 'Where to edit catalog fields', 'kyaf-catalog-schema' ); ?></h2>
		<p><?php echo esc_html__( 'Open an Exhibition, Activity, Residency Artist, Blog Post, or Moving Image entry. The “KYAF Catalog Fields” box contains video, gallery, hero image, secondary image, and related-content fields.', 'kyaf-catalog-schema' ); ?></p>
	</div>
	<?php
}
