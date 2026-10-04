<?php
/**
 * Plugin Name: BKKK Deploy Trigger
 * Description: Fires a GitHub Actions repository_dispatch event when content changes. Supports auto-trigger on save or manual trigger via a publish button.
 * Version:     1.5.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

// Register meta fields for all listing CPTs
add_action( 'init', function () {
    $html_fields = [ 'content_en', 'content_th', 'additional_info', 'bio_en', 'bio_th' ];
    $text_fields = [ 'cta_label', 'cta_url', 'cta2_label', 'cta2_url', 'title_th', 'date_display_en', 'date_display_th', 'link_url', 'item_type', 'site' ];
    $post_types  = [ 'exhibition', 'activity', 'moving_image', 'residency_artist', 'press_item' ];

    foreach ( $post_types as $post_type ) {
        foreach ( $html_fields as $field ) {
            register_meta( 'post', $field, [
                'object_subtype'    => $post_type,
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => null,
                'auth_callback'     => function() { return current_user_can( 'edit_posts' ); },
            ] );
        }
        foreach ( $text_fields as $field ) {
            register_meta( 'post', $field, [
                'object_subtype'    => $post_type,
                'type'              => 'string',
                'single'            => true,
                'show_in_rest'      => true,
                'sanitize_callback' => 'sanitize_text_field',
                'auth_callback'     => function() { return current_user_can( 'edit_posts' ); },
            ] );
        }
    }
} );

// CPTs that should trigger a redeploy when saved
define( 'BKKK_WATCHED_POST_TYPES', [
    'exhibition',
    'activity',
    'moving_image',
    'residency_artist',
    'team_member',
    'blog_post',
    'press_item',
    'post',
    'page',
] );

// Trigger mode: 'auto' = on every publish/update, 'manual' = only via the "Publish to Site" button
function bkkk_trigger_mode(): string {
    return get_option( 'bkkk_trigger_mode', 'auto' );
}

/**
 * Debounce guard — returns true if a dispatch already fired within the last 10 seconds.
 * Prevents double-triggers when WP/JetEngine saves the post and its meta in separate passes.
 */
function bkkk_already_dispatched( int $post_id ): bool {
    $key = 'bkkk_dispatched_' . $post_id;
    if ( get_transient( $key ) ) return true;
    set_transient( $key, 1, 10 );
    return false;
}

/**
 * Send a repository_dispatch event to GitHub Actions.
 */
function bkkk_dispatch( string $event_type, array $payload = [] ): bool {
    $token = defined( 'BKKK_GH_TOKEN' ) ? BKKK_GH_TOKEN : get_option( 'bkkk_gh_token', '' );
    $repo  = defined( 'BKKK_GH_REPO' )  ? BKKK_GH_REPO  : get_option( 'bkkk_gh_repo', 'HeartBrains/kyafQ42026' );

    if ( empty( $token ) ) {
        error_log( '[BKKK Deploy] No GitHub token configured — skipping dispatch.' );
        return false;
    }

    $body = [ 'event_type' => $event_type ];
    if ( ! empty( $payload ) ) {
        $body['client_payload'] = $payload;
    }

    $response = wp_remote_post(
        "https://api.github.com/repos/{$repo}/dispatches",
        [
            'timeout' => 10,
            'headers' => [
                'Authorization'        => "Bearer {$token}",
                'Accept'               => 'application/vnd.github+json',
                'Content-Type'         => 'application/json',
                'X-GitHub-Api-Version' => '2022-11-28',
            ],
            'body' => wp_json_encode( $body ),
        ]
    );

    if ( is_wp_error( $response ) ) {
        error_log( '[BKKK Deploy] Dispatch failed: ' . $response->get_error_message() );
        return false;
    }

    $code = wp_remote_retrieve_response_code( $response );
    if ( $code !== 204 ) {
        error_log( "[BKKK Deploy] Unexpected response {$code}: " . wp_remote_retrieve_body( $response ) );
        return false;
    }

    return true;
}

// ── Auto mode: trigger on publish / update / delete ───────────────────────────

add_action( 'transition_post_status', 'bkkk_maybe_dispatch_on_publish', 10, 3 );

function bkkk_maybe_dispatch_on_publish( string $new_status, string $old_status, WP_Post $post ): void {
    if ( bkkk_trigger_mode() !== 'auto' ) return;
    if ( $new_status !== 'publish' ) return;
    if ( ! in_array( $post->post_type, BKKK_WATCHED_POST_TYPES, true ) ) return;
    if ( bkkk_already_dispatched( $post->ID ) ) return;

    bkkk_dispatch( 'wp_content_updated', [
        'action'    => 'publish',
        'post_type' => $post->post_type,
        'post_id'   => $post->ID,
        'slug'      => $post->post_name,
    ] );
}

add_action( 'before_delete_post', 'bkkk_maybe_dispatch_on_delete', 10, 1 );

function bkkk_maybe_dispatch_on_delete( int $post_id ): void {
    if ( bkkk_trigger_mode() !== 'auto' ) return;
    $post = get_post( $post_id );
    if ( ! $post || ! in_array( $post->post_type, BKKK_WATCHED_POST_TYPES, true ) ) return;
    if ( bkkk_already_dispatched( $post_id ) ) return;

    bkkk_dispatch( 'wp_content_updated', [
        'action'    => 'delete',
        'post_type' => $post->post_type,
        'post_id'   => $post_id,
        'slug'      => $post->post_name,
    ] );
}

// ── Manual mode: "Publish to Site" button in post editor ─────────────────────

add_action( 'post_submitbox_misc_actions', 'bkkk_publish_button' );

function bkkk_publish_button( WP_Post $post ): void {
    if ( bkkk_trigger_mode() !== 'manual' ) return;
    if ( ! in_array( $post->post_type, BKKK_WATCHED_POST_TYPES, true ) ) return;
    if ( $post->post_status !== 'publish' ) return;

    wp_nonce_field( 'bkkk_publish_to_site_' . $post->ID, 'bkkk_publish_nonce' );
    echo '<div class="misc-pub-section" style="padding-top:8px;border-top:1px solid #ddd;">';
    echo '<button type="submit" name="bkkk_publish_to_site" value="1" class="button button-primary" style="width:100%;">Publish to Site</button>';
    echo '<p class="description" style="margin-top:4px;font-size:11px;color:#666;">Triggers a full site rebuild on GitHub Actions.</p>';
    echo '</div>';
}

add_action( 'save_post', 'bkkk_handle_publish_button', 10, 2 );

function bkkk_handle_publish_button( int $post_id, WP_Post $post ): void {
    if ( bkkk_trigger_mode() !== 'manual' ) return;
    if ( ! isset( $_POST['bkkk_publish_to_site'] ) ) return;
    if ( ! isset( $_POST['bkkk_publish_nonce'] ) ) return;
    if ( ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['bkkk_publish_nonce'] ) ), 'bkkk_publish_to_site_' . $post_id ) ) return;
    if ( ! current_user_can( 'publish_posts' ) ) return;
    if ( ! in_array( $post->post_type, BKKK_WATCHED_POST_TYPES, true ) ) return;
    if ( bkkk_already_dispatched( $post_id ) ) return;

    bkkk_dispatch( 'wp_content_updated', [
        'action'    => 'manual_publish',
        'post_type' => $post->post_type,
        'post_id'   => $post_id,
        'slug'      => $post->post_name,
    ] );
}

// ── Settings page ─────────────────────────────────────────────────────────────

add_action( 'admin_menu', function () {
    add_options_page(
        'Deploy Trigger',
        'Deploy Trigger',
        'manage_options',
        'bkkk-deploy-trigger',
        'bkkk_settings_page'
    );
} );

add_action( 'admin_init', function () {
    register_setting( 'bkkk_deploy', 'bkkk_gh_token' );
    register_setting( 'bkkk_deploy', 'bkkk_gh_repo' );
    register_setting( 'bkkk_deploy', 'bkkk_trigger_mode', [
        'sanitize_callback' => function( $v ) {
            return in_array( $v, [ 'auto', 'manual' ], true ) ? $v : 'auto';
        },
        'default' => 'auto',
    ] );
} );

function bkkk_settings_page(): void {
    $mode = bkkk_trigger_mode();
    ?>
    <div class="wrap">
        <h1>Deploy Trigger Settings</h1>
        <form method="post" action="options.php">
            <?php settings_fields( 'bkkk_deploy' ); ?>
            <table class="form-table">
                <tr>
                    <th>GitHub Token</th>
                    <td>
                        <input type="password" name="bkkk_gh_token"
                               value="<?php echo esc_attr( get_option( 'bkkk_gh_token' ) ); ?>"
                               class="regular-text" />
                        <p class="description">
                            Classic PAT or fine-grained PAT with <code>Actions: Read and write</code> on the target repo.
                        </p>
                    </td>
                </tr>
                <tr>
                    <th>GitHub Repo</th>
                    <td>
                        <input type="text" name="bkkk_gh_repo"
                               value="<?php echo esc_attr( get_option( 'bkkk_gh_repo', 'HeartBrains/kyafQ42026' ) ); ?>"
                               class="regular-text" placeholder="owner/repo" />
                        <p class="description">For a fine-grained token, grant <code>Contents: Read and write</code> on the target repository. A classic token requires the <code>repo</code> scope.</p>
                    </td>
                </tr>
                <tr>
                    <th>Trigger Mode</th>
                    <td>
                        <label style="display:block;margin-bottom:6px;">
                            <input type="radio" name="bkkk_trigger_mode" value="auto"
                                   <?php checked( $mode, 'auto' ); ?> />
                            <strong>Auto</strong> &mdash; trigger on every publish / update / delete
                        </label>
                        <label style="display:block;">
                            <input type="radio" name="bkkk_trigger_mode" value="manual"
                                   <?php checked( $mode, 'manual' ); ?> />
                            <strong>Manual</strong> &mdash; only trigger when &ldquo;Publish to Site&rdquo; button is clicked in the post editor
                        </label>
                    </td>
                </tr>
            </table>
            <?php submit_button(); ?>
        </form>

        <h2>Force Trigger</h2>
        <p>Trigger a full site rebuild immediately, regardless of trigger mode.</p>
        <form method="post">
            <?php wp_nonce_field( 'bkkk_manual_dispatch' ); ?>
            <input type="hidden" name="bkkk_action" value="manual_dispatch" />
            <?php submit_button( 'Trigger deploy now', 'secondary' ); ?>
        </form>
        <?php
        if (
            isset( $_POST['bkkk_action'] ) &&
            $_POST['bkkk_action'] === 'manual_dispatch' &&
            check_admin_referer( 'bkkk_manual_dispatch' )
        ) {
            $ok = bkkk_dispatch( 'wp_content_updated', [ 'action' => 'manual' ] );
            if ( $ok ) {
                echo '<div class="notice notice-success"><p>Deploy triggered.</p></div>';
            } else {
                echo '<div class="notice notice-error"><p>Dispatch failed — check error log and token.</p></div>';
            }
        }
        ?>
    </div>
    <?php
}
