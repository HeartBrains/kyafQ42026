<?php
/**
 * Plugin Name: BK and KYAF Mailing List Signup
 * Description: Validates public mailing-list signups and stores them in the JetEngine mailing_list_subscriptions CCT.
 * Version: 1.0.0
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'rest_api_init', 'kyaf_mailing_list_register_route' );

function kyaf_mailing_list_register_route(): void {
	register_rest_route(
		'kyaf/v1',
		'/mailing-list',
		array(
			'methods'             => WP_REST_Server::CREATABLE,
			'callback'            => 'kyaf_mailing_list_subscribe',
			'permission_callback' => '__return_true',
			'args'                => array(
				'email'       => array( 'required' => true ),
				'source_site' => array( 'required' => true ),
				'website'     => array( 'required' => false ),
			),
		)
	);
}

function kyaf_mailing_list_subscribe( WP_REST_Request $request ) {
	$origin = get_http_origin();
	if ( $origin && ! kyaf_mailing_list_origin_allowed( $origin ) ) {
		return new WP_Error( 'mailing_list_origin_not_allowed', 'This origin is not allowed.', array( 'status' => 403 ) );
	}

	// Quietly accept honeypot submissions so automated senders cannot use responses to tune their requests.
	if ( trim( (string) $request->get_param( 'website' ) ) !== '' ) {
		return new WP_REST_Response( array( 'success' => true ), 200 );
	}

	$email = strtolower( sanitize_email( (string) $request->get_param( 'email' ) ) );
	$site  = sanitize_key( (string) $request->get_param( 'source_site' ) );

	if ( ! is_email( $email ) ) {
		return new WP_Error( 'mailing_list_invalid_email', 'Enter a valid email address.', array( 'status' => 400 ) );
	}

	if ( ! in_array( $site, array( 'bkkk', 'kyaf' ), true ) ) {
		return new WP_Error( 'mailing_list_invalid_site', 'The signup site is invalid.', array( 'status' => 400 ) );
	}

	if ( kyaf_mailing_list_rate_limited() ) {
		return new WP_Error( 'mailing_list_rate_limited', 'Please try again later.', array( 'status' => 429 ) );
	}

	global $wpdb;
	$table = $wpdb->prefix . 'jet_cct_mailing_list_subscriptions';
	$existing_id = $wpdb->get_var(
		$wpdb->prepare(
			"SELECT _ID FROM {$table} WHERE email = %s AND source_site = %s LIMIT 1",
			$email,
			$site
		)
	);

	// Treat a repeated signup as success without revealing whether an address is already stored.
	if ( $existing_id ) {
		return new WP_REST_Response( array( 'success' => true ), 200 );
	}

	if ( ! class_exists( '\Jet_Engine\Modules\Custom_Content_Types\Module' ) ) {
		return new WP_Error( 'mailing_list_storage_unavailable', 'Signup storage is temporarily unavailable.', array( 'status' => 503 ) );
	}

	$content_type = \Jet_Engine\Modules\Custom_Content_Types\Module::instance()->manager->get_content_types( 'mailing_list_subscriptions' );
	if ( ! $content_type ) {
		return new WP_Error( 'mailing_list_storage_unavailable', 'Signup storage is temporarily unavailable.', array( 'status' => 503 ) );
	}

	$item_id = $content_type->get_item_handler()->update_item(
		array(
			'email'       => $email,
			'source_site' => $site,
		)
	);

	if ( is_wp_error( $item_id ) || ! $item_id ) {
		return new WP_Error( 'mailing_list_save_failed', 'Signup could not be saved. Please try again.', array( 'status' => 500 ) );
	}

	return new WP_REST_Response( array( 'success' => true ), 200 );
}

function kyaf_mailing_list_origin_allowed( string $origin ): bool {
	$origin = untrailingslashit( $origin );
	$allowed_origins = array(
		'https://dev.khaoyaiart.org',
		'https://khaoyaiart.org',
		'https://www.khaoyaiart.org',
		'http://localhost:3000',
		'http://127.0.0.1:3000',
	);

	if ( in_array( $origin, $allowed_origins, true ) ) {
		return true;
	}

	return (bool) preg_match( '#^https://[a-z0-9-]+\.us-east-1-01\.gitpod\.dev$#i', $origin );
}

function kyaf_mailing_list_rate_limited(): bool {
	$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : 'unknown';
	$key = 'kyaf_ml_' . substr( hash_hmac( 'sha256', $ip, wp_salt( 'auth' ) ), 0, 32 );
	$count = (int) get_transient( $key );

	if ( $count >= 6 ) {
		return true;
	}

	set_transient( $key, $count + 1, 15 * MINUTE_IN_SECONDS );
	return false;
}
