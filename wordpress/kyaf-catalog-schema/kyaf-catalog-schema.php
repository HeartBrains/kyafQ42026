<?php
/**
 * Plugin Name: KYAF Catalog Schema
 * Description: Versioned activity taxonomy, editorial media fields, and bidirectional related-content data for the KYAF/BKKK frontend.
 * Version: 0.1.0
 * Requires at least: 6.5
 * Requires PHP: 8.0
 * Author: HeartBrains
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

const KYAF_CATALOG_POST_TYPES = array( 'exhibition', 'activity', 'residency_artist', 'blog_post', 'moving_image' );

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

		foreach ( array( 'gallery_media', 'related_content_ids' ) as $array_key ) {
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
	$values = is_array( $value ) ? $value : preg_split( '/[\s,]+/', (string) $value );
	return array_values( array_unique( array_filter( array_map( 'absint', $values ) ) ) );
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
	}
}
add_action( 'add_meta_boxes', 'kyaf_catalog_add_meta_boxes' );

function kyaf_catalog_render_meta_box( $post ) {
	wp_nonce_field( 'kyaf_catalog_save_fields', 'kyaf_catalog_nonce' );
	$fields = array(
		'video_embed_url'      => 'Video URL (YouTube or Vimeo)',
		'secondary_image_url'  => 'Secondary card image URL',
		'hero_landscape_image' => 'Hero landscape image URL',
		'hero_portrait_image'  => 'Hero portrait image URL',
		'gallery_media'        => 'Gallery media IDs (comma-separated)',
		'related_content_ids'  => 'Related post IDs (comma-separated)',
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
}

function kyaf_catalog_save_fields( $post_id ) {
	if ( ! isset( $_POST['kyaf_catalog_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['kyaf_catalog_nonce'] ) ), 'kyaf_catalog_save_fields' ) ) {
		return;
	}
	if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
		return;
	}
	if ( ! current_user_can( 'edit_post', $post_id ) || ! in_array( get_post_type( $post_id ), KYAF_CATALOG_POST_TYPES, true ) ) {
		return;
	}

	$url_fields = array( 'video_embed_url', 'secondary_image_url', 'hero_landscape_image', 'hero_portrait_image' );
	foreach ( $url_fields as $key ) {
		$value = isset( $_POST[ $key ] ) ? esc_url_raw( wp_unslash( $_POST[ $key ] ) ) : '';
		$value ? update_post_meta( $post_id, $key, $value ) : delete_post_meta( $post_id, $key );
	}

	$gallery = isset( $_POST['gallery_media'] ) ? kyaf_catalog_sanitize_ids( wp_unslash( $_POST['gallery_media'] ) ) : array();
	$related = isset( $_POST['related_content_ids'] ) ? kyaf_catalog_sanitize_ids( wp_unslash( $_POST['related_content_ids'] ) ) : array();
	$related = array_values( array_filter( $related, function ( $id ) use ( $post_id ) {
		return $id !== $post_id && in_array( get_post_type( $id ), KYAF_CATALOG_POST_TYPES, true );
	} ) );
	update_post_meta( $post_id, 'gallery_media', $gallery );
	kyaf_catalog_sync_relations( $post_id, $related );
}
add_action( 'save_post', 'kyaf_catalog_save_fields', 20 );

function kyaf_catalog_sync_relations( $post_id, $new_ids ) {
	$old_ids = kyaf_catalog_sanitize_ids( get_post_meta( $post_id, 'related_content_ids', true ) );
	update_post_meta( $post_id, 'related_content_ids', $new_ids );
	foreach ( array_diff( $old_ids, $new_ids ) as $removed_id ) {
		$reverse = array_values( array_diff( kyaf_catalog_sanitize_ids( get_post_meta( $removed_id, 'related_content_ids', true ) ), array( $post_id ) ) );
		update_post_meta( $removed_id, 'related_content_ids', $reverse );
		kyaf_catalog_refresh_related_json( $removed_id );
	}
	foreach ( $new_ids as $related_id ) {
		$reverse = kyaf_catalog_sanitize_ids( get_post_meta( $related_id, 'related_content_ids', true ) );
		if ( ! in_array( $post_id, $reverse, true ) ) {
			$reverse[] = $post_id;
			update_post_meta( $related_id, 'related_content_ids', $reverse );
		}
		kyaf_catalog_refresh_related_json( $related_id );
	}
	kyaf_catalog_refresh_related_json( $post_id );
}

function kyaf_catalog_refresh_related_json( $post_id ) {
	$type_map = array(
		'exhibition'       => 'exhibitions',
		'activity'         => 'activities',
		'residency_artist' => 'residency',
		'blog_post'        => 'blog',
		'moving_image'     => 'moving-image',
	);
	$items = array();
	foreach ( array_slice( kyaf_catalog_sanitize_ids( get_post_meta( $post_id, 'related_content_ids', true ) ), 0, 50 ) as $related_id ) {
		$post = get_post( $related_id );
		if ( ! $post || ! isset( $type_map[ $post->post_type ] ) ) {
			continue;
		}
		$image = get_the_post_thumbnail_url( $related_id, 'large' );
		$items[] = array(
			'id'       => (string) $related_id,
			'slug'     => $post->post_name,
			'type'     => $type_map[ $post->post_type ],
			'title'    => array( 'en' => get_the_title( $related_id ), 'th' => (string) get_post_meta( $related_id, 'title_th', true ) ),
			'date'     => (string) get_post_meta( $related_id, 'date_display_en', true ),
			'image'    => $image ?: (string) get_post_meta( $related_id, 'featured_image_url', true ),
			'category' => $post->post_type,
			'site'     => (string) get_post_meta( $related_id, 'site', true ),
		);
	}
	update_post_meta( $post_id, 'related_content_json', wp_json_encode( $items, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
}

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
