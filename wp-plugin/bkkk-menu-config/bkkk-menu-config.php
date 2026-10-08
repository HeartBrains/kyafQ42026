<?php
/**
 * Plugin Name: BKKK Menu Config
 * Description: Options page to toggle menu items, section anchors, page cover images, and inject custom CSS for BKKK and KYAF sites.
 * Version: 2.3.0
 */

if ( ! defined( 'ABSPATH' ) ) exit;

const BKKK_MENU_OPTION     = 'bkkk_menu_config';
const BKKK_COVERS_OPTION   = 'bkkk_covers_config';
const BKKK_CSS_OPTION      = 'bkkk_css_config';
const BKKK_SECTIONS_OPTION = 'bkkk_sections_config';

function bkkk_menu_defaults(): array {
    return [
        'bkkk_home'=>true,'bkkk_exhibitions'=>true,'bkkk_activities'=>true,'bkkk_residency'=>true,
        'bkkk_moving_image'=>true,'bkkk_blog'=>false,'bkkk_press'=>true,'bkkk_team'=>true,
        'bkkk_about'=>true,'bkkk_visit'=>true,'bkkk_contact'=>true,'bkkk_shop'=>false,'bkkk_support'=>true,
        'kyaf_home'=>true,'kyaf_exhibitions'=>true,'kyaf_activities'=>true,'kyaf_residency'=>true,
        'kyaf_blog'=>true,'kyaf_press'=>false,'kyaf_team'=>true,'kyaf_about'=>true,
        'kyaf_visit'=>true,'kyaf_contact'=>true,'kyaf_shop'=>false,'kyaf_archives'=>false,'kyaf_booking'=>true,
    ];
}

function bkkk_sections_defaults(): array {
    return [
        'bkkk_exhibitions_upcoming'=>true,'bkkk_exhibitions_current'=>true,'bkkk_exhibitions_past'=>true,
        'bkkk_activities_upcoming'=>true,'bkkk_activities_current'=>true,'bkkk_activities_past'=>false,
        'bkkk_moving_image_upcoming'=>true,'bkkk_moving_image_current'=>true,'bkkk_moving_image_past'=>true,
        'bkkk_residency_upcoming'=>true,'bkkk_residency_current'=>true,'bkkk_residency_past'=>true,
        'kyaf_exhibitions_upcoming'=>true,'kyaf_exhibitions_current'=>true,'kyaf_exhibitions_past'=>true,
        'kyaf_activities_upcoming'=>true,'kyaf_activities_current'=>true,'kyaf_activities_past'=>false,
        'kyaf_residency_upcoming'=>true,'kyaf_residency_current'=>true,'kyaf_residency_past'=>true,
        // Home page anchor sections
        'bkkk_home_current_exhibitions'=>true,'bkkk_home_upcoming_exhibitions'=>true,
        'bkkk_home_current_moving_image'=>true,'bkkk_home_current_activities'=>false,
        'kyaf_home_current_exhibitions'=>true,'kyaf_home_current_activities'=>false,
    ];
}

function bkkk_covers_defaults(): array {
    $pages = ['exhibitions','activities','moving_image','residency','blog','press','team','about','visit','contact','archives'];
    $out = [];
    foreach ($pages as $p) { $out['bkkk_'.$p]=''; $out['kyaf_'.$p]=''; }
    return $out;
}

function bkkk_menu_get(): array {
    $saved = get_option(BKKK_MENU_OPTION,[]);
    return array_merge(bkkk_menu_defaults(), is_array($saved)?$saved:[]);
}
function bkkk_sections_get(): array {
    $saved = get_option(BKKK_SECTIONS_OPTION,[]);
    return array_merge(bkkk_sections_defaults(), is_array($saved)?$saved:[]);
}
function bkkk_covers_get(): array {
    $saved = get_option(BKKK_COVERS_OPTION,[]);
    return array_merge(bkkk_covers_defaults(), is_array($saved)?$saved:[]);
}
function bkkk_css_get(): array {
    $saved = get_option(BKKK_CSS_OPTION,[]);
    return ['bkkk'=>(string)($saved['bkkk']??''),'kyaf'=>(string)($saved['kyaf']??'')];
}

add_action('admin_menu', function() {
    add_options_page('Site Config','Site Config','manage_options','bkkk-menu-config','bkkk_menu_render_page');
});

add_action('admin_enqueue_scripts', function($hook) {
    if ($hook !== 'settings_page_bkkk-menu-config') return;
    wp_enqueue_media();
    $script_path = plugin_dir_path(__FILE__) . 'media-upload.js';
    $script_version = file_exists($script_path) ? (string) filemtime($script_path) : '2.3.0';
    wp_enqueue_script('bkkk-media-upload', plugin_dir_url(__FILE__) . 'media-upload.js', ['jquery'], $script_version, true);
});
add_action('admin_init', function() {
    register_setting('bkkk_menu_config_group', BKKK_MENU_OPTION,     ['sanitize_callback'=>'bkkk_menu_sanitize']);
    register_setting('bkkk_menu_config_group', BKKK_SECTIONS_OPTION, ['sanitize_callback'=>'bkkk_sections_sanitize']);
    register_setting('bkkk_menu_config_group', BKKK_COVERS_OPTION,   ['sanitize_callback'=>'bkkk_covers_sanitize']);
    register_setting('bkkk_menu_config_group', BKKK_CSS_OPTION,      ['sanitize_callback'=>'bkkk_css_sanitize']);
});

function bkkk_menu_sanitize($input): array {
    $clean=[];
    foreach(array_keys(bkkk_menu_defaults()) as $key) $clean[$key]=!empty($input[$key]);
    return $clean;
}
function bkkk_sections_sanitize($input): array {
    $clean=[];
    foreach(array_keys(bkkk_sections_defaults()) as $key) $clean[$key]=!empty($input[$key]);
    return $clean;
}
function bkkk_covers_sanitize($input): array {
    $clean=[];
    foreach(array_keys(bkkk_covers_defaults()) as $key) $clean[$key]=isset($input[$key])?esc_url_raw(trim($input[$key])):'';
    return $clean;
}
function bkkk_css_sanitize($input): array {
    return ['bkkk'=>wp_strip_all_tags($input['bkkk']??''),'kyaf'=>wp_strip_all_tags($input['kyaf']??'')];
}

function bkkk_menu_render_page(): void {
    if(!current_user_can('manage_options')) return;
    $menu=bkkk_menu_get(); $sections=bkkk_sections_get(); $covers=bkkk_covers_get(); $css=bkkk_css_get();
    $menu_sections=[
        'Bangkok Kunsthalle (BK)'=>['bkkk_home'=>'Home','bkkk_exhibitions'=>'Exhibitions','bkkk_activities'=>'Activities','bkkk_residency'=>'Residency','bkkk_moving_image'=>'Moving Image','bkkk_blog'=>'Blog','bkkk_press'=>'Press','bkkk_team'=>'Team','bkkk_about'=>'About','bkkk_visit'=>'Visit','bkkk_contact'=>'Contact','bkkk_shop'=>'Shop','bkkk_support'=>'Support'],
        'Khao Yai Art Forest (KYAF)'=>['kyaf_home'=>'Home','kyaf_exhibitions'=>'Exhibitions','kyaf_activities'=>'Activities','kyaf_residency'=>'Residency','kyaf_blog'=>'Blog','kyaf_press'=>'Press','kyaf_team'=>'Team','kyaf_about'=>'About','kyaf_visit'=>'Visit','kyaf_contact'=>'Contact','kyaf_shop'=>'Shop','kyaf_archives'=>'Archives','kyaf_booking'=>'Booking'],
    ];
    $section_groups=[
        'Bangkok Kunsthalle (BK)'=>[
            'Exhibitions'=>['bkkk_exhibitions_upcoming'=>'Upcoming','bkkk_exhibitions_current'=>'Current','bkkk_exhibitions_past'=>'Past'],
            'Activities'=>['bkkk_activities_upcoming'=>'Upcoming','bkkk_activities_current'=>'Current','bkkk_activities_past'=>'Past'],
            'Moving Image'=>['bkkk_moving_image_upcoming'=>'Upcoming','bkkk_moving_image_current'=>'Current','bkkk_moving_image_past'=>'Past'],
            'Residency'=>['bkkk_residency_upcoming'=>'Upcoming','bkkk_residency_current'=>'Current','bkkk_residency_past'=>'Past'],
            'Home Anchors'=>['bkkk_home_current_exhibitions'=>'Current Exhibitions','bkkk_home_upcoming_exhibitions'=>'Upcoming Exhibitions','bkkk_home_current_moving_image'=>'Current Moving Image','bkkk_home_current_activities'=>'Current Activities'],
        ],
        'Khao Yai Art Forest (KYAF)'=>[
            'Exhibitions'=>['kyaf_exhibitions_upcoming'=>'Upcoming','kyaf_exhibitions_current'=>'Current','kyaf_exhibitions_past'=>'Past'],
            'Activities'=>['kyaf_activities_upcoming'=>'Upcoming','kyaf_activities_current'=>'Current','kyaf_activities_past'=>'Past'],
            'Residency'=>['kyaf_residency_upcoming'=>'Upcoming','kyaf_residency_current'=>'Current','kyaf_residency_past'=>'Past'],
            'Home Anchors'=>['kyaf_home_current_exhibitions'=>'Current Exhibitions','kyaf_home_current_activities'=>'Current Activities'],
        ],
    ];
    $cover_labels=['exhibitions'=>'Exhibitions','activities'=>'Activities','moving_image'=>'Moving Image','residency'=>'Residency','blog'=>'Blog','press'=>'Press','team'=>'Team','about'=>'About','visit'=>'Visit','contact'=>'Contact','archives'=>'Archives'];
    ?>
    <div class="wrap"><h1>Site Config</h1>
    <form method="post" action="options.php">
    <?php settings_fields('bkkk_menu_config_group'); ?>

    <h2>Menu Visibility</h2>
    <?php foreach($menu_sections as $heading=>$items): ?>
        <h3><?php echo esc_html($heading); ?></h3>
        <table class="form-table"><tbody>
        <?php foreach($items as $key=>$label): ?>
        <tr><th><?php echo esc_html($label); ?></th><td>
        <input type="checkbox" name="<?php echo esc_attr(BKKK_MENU_OPTION); ?>[<?php echo esc_attr($key); ?>]" value="1" <?php checked(!empty($menu[$key])); ?> />
        </td></tr>
        <?php endforeach; ?>
        </tbody></table>
    <?php endforeach; ?>

    <hr><h2>Section / Anchor Visibility</h2>
    <p>Show or hide each anchor section within listing pages.</p>
    <?php foreach($section_groups as $site_label=>$pages): ?>
        <h3><?php echo esc_html($site_label); ?></h3>
        <table class="form-table"><tbody>
        <?php foreach($pages as $page_label=>$items): ?>
            <tr><th style="padding-top:16px"><strong><?php echo esc_html($page_label); ?></strong></th><td></td></tr>
            <?php foreach($items as $key=>$label): ?>
            <tr><th style="padding-left:20px"><?php echo esc_html($label); ?></th><td>
            <input type="checkbox" name="<?php echo esc_attr(BKKK_SECTIONS_OPTION); ?>[<?php echo esc_attr($key); ?>]" value="1" <?php checked(!empty($sections[$key])); ?> />
            </td></tr>
            <?php endforeach; ?>
        <?php endforeach; ?>
        </tbody></table>
    <?php endforeach; ?>

    <hr><h2>Page Cover Images</h2>
    <p>Full image URL for each page hero. Leave blank to use the default.</p>
    <?php foreach(['bkkk'=>'Bangkok Kunsthalle (BK)','kyaf'=>'Khao Yai Art Forest (KYAF)'] as $site=>$heading): ?>
        <h3><?php echo esc_html($heading); ?></h3>
        <table class="form-table"><tbody>
        <?php foreach($cover_labels as $snake=>$label): $key=$site.'_'.$snake; $val=esc_attr($covers[$key]??''); $field_id='cover_'.$key; $preview_id='preview_'.$key; ?>
        <tr><th><?php echo esc_html($label); ?></th><td>
            <input type="url" id="<?php echo esc_attr($field_id); ?>"
                name="<?php echo esc_attr(BKKK_COVERS_OPTION); ?>[<?php echo esc_attr($key); ?>]"
                value="<?php echo $val; ?>" class="regular-text bkkk-cover-url" placeholder="https://..." />
            <button type="button" class="button bkkk-upload-btn"
                data-target="<?php echo esc_attr($field_id); ?>"
                data-preview="<?php echo esc_attr($preview_id); ?>">Upload</button>
            <button type="button" class="button bkkk-clear-btn"
                data-target="<?php echo esc_attr($field_id); ?>"
                data-preview="<?php echo esc_attr($preview_id); ?>"
                style="<?php echo $val ? '' : 'display:none'; ?>">Clear</button>
            <div id="<?php echo esc_attr($preview_id); ?>" style="margin-top:6px;">
                <?php if($val): ?><img src="<?php echo $val; ?>" style="max-width:320px;max-height:120px;object-fit:cover;border:1px solid #ddd;border-radius:3px;" /><?php endif; ?>
            </div>
        </td></tr>
        <?php endforeach; ?>
        </tbody></table>
    <?php endforeach; ?>

    <hr><h2>Custom CSS</h2>
    <p>Injected into every page of each site.</p>
    <?php foreach(['bkkk'=>'Bangkok Kunsthalle (BK)','kyaf'=>'Khao Yai Art Forest (KYAF)'] as $site=>$heading): ?>
        <h3><?php echo esc_html($heading); ?></h3>
        <textarea name="<?php echo esc_attr(BKKK_CSS_OPTION); ?>[<?php echo esc_attr($site); ?>]"
            rows="10" class="large-text code"><?php echo esc_textarea($css[$site]); ?></textarea>
    <?php endforeach; ?>

    <?php submit_button(); ?>
    </form></div>
    <?php
}

// Inject resolved featured image URL into REST responses for all custom CPTs.
// When a post has featured_media set but featured_image_url meta is empty,
// resolve the attachment source_url server-side and expose it as featured_image_url
// so the client never needs a separate (potentially auth-gated) media API call.
add_action('rest_api_init', function() {
    $cpts = ['residency_artist', 'exhibition', 'activity', 'moving_image'];
    foreach ($cpts as $cpt) {
        add_filter("rest_prepare_{$cpt}", function(WP_REST_Response $response, WP_Post $post) {
            $data = $response->get_data();
            $meta = $data['meta'] ?? [];
            $featured_image_url = $meta['featured_image_url'] ?? '';
            // Only inject if featured_image_url is empty and featured_media is set
            if (empty($featured_image_url) && !empty($data['featured_media'])) {
                $src = wp_get_attachment_image_url($data['featured_media'], 'full');
                if ($src) {
                    $data['meta']['featured_image_url'] = $src;
                    $response->set_data($data);
                }
            }
            return $response;
        }, 10, 2);
    }
});

add_action('rest_api_init', function() {
    register_rest_route('bkkk/v1','/menu-config',[
        'methods'=>'GET',
        'callback'=>function() {
            $menu=bkkk_menu_get(); $sections=bkkk_sections_get(); $covers=bkkk_covers_get(); $css=bkkk_css_get();
            $key_map=['home'=>'home','exhibitions'=>'exhibitions','activities'=>'activities','residency'=>'residency',
                'moving_image'=>'movingImage','blog'=>'blog','press'=>'press','team'=>'team','about'=>'about',
                'visit'=>'visit','contact'=>'contact','shop'=>'shop','support'=>'support','archives'=>'archives','booking'=>'booking'];
            $cover_keys=['exhibitions','activities','moving_image','residency','blog','press','team','about','visit','contact','archives'];
            $bkkk_menu=[]; $kyaf_menu=[]; $bkkk_covers=[]; $kyaf_covers=[];
            foreach($key_map as $snake=>$camel) {
                if(array_key_exists('bkkk_'.$snake,$menu)) $bkkk_menu[$camel]=(bool)$menu['bkkk_'.$snake];
                if(array_key_exists('kyaf_'.$snake,$menu)) $kyaf_menu[$camel]=(bool)$menu['kyaf_'.$snake];
            }
            foreach($cover_keys as $snake) {
                $camel=lcfirst(str_replace('_','',ucwords($snake,'_')));
                $bkkk_covers[$camel]=$covers['bkkk_'.$snake]??'';
                $kyaf_covers[$camel]=$covers['kyaf_'.$snake]??'';
            }
            // Build section visibility per site
            $pages_map=['exhibitions'=>'exhibitions','activities'=>'activities','moving_image'=>'movingImage','residency'=>'residency'];
            $states=['upcoming','current','past'];
            $bkkk_sections=[]; $kyaf_sections=[];
            foreach($pages_map as $snake=>$camel) {
                foreach($states as $state) {
                    $bkkk_sections[$camel][$state]=(bool)($sections['bkkk_'.$snake.'_'.$state]??true);
                    $kyaf_sections[$camel][$state]=(bool)($sections['kyaf_'.$snake.'_'.$state]??true);
                }
            }
            // Home anchor visibility
            $bkkk_sections['homeAnchors']=[
                'currentExhibitions' =>(bool)($sections['bkkk_home_current_exhibitions']??true),
                'upcomingExhibitions'=>(bool)($sections['bkkk_home_upcoming_exhibitions']??true),
                'currentMovingImage' =>(bool)($sections['bkkk_home_current_moving_image']??true),
                'currentActivities'  =>(bool)($sections['bkkk_home_current_activities']??false),
            ];
            $kyaf_sections['homeAnchors']=[
                'currentExhibitions'=>(bool)($sections['kyaf_home_current_exhibitions']??true),
                'currentActivities' =>(bool)($sections['kyaf_home_current_activities']??false),
            ];
            $r=new WP_REST_Response(['bkkk'=>$bkkk_menu,'kyaf'=>$kyaf_menu,'bkkkCovers'=>$bkkk_covers,'kyafCovers'=>$kyaf_covers,'bkkkCss'=>$css['bkkk'],'kyafCss'=>$css['kyaf'],'bkkkSections'=>$bkkk_sections,'kyafSections'=>$kyaf_sections]);
            $r->header('Cache-Control','public, max-age=60');
            $r->header('Access-Control-Allow-Origin','*');
            return $r;
        },
        'permission_callback'=>'__return_true',
    ]);
});
