<?php
namespace VR;

defined( 'ABSPATH' ) || exit;

global $wp;

class ShowInPost {

    public function __construct() {
        \add_action('wp_footer', [$this, 'load_script']);
        \add_filter( 'the_content', [$this, 'hook_player_into_content']);
    }

    public function load_script() {
        \wp_enqueue_script('dailymotionjs', 'https://cdn.jsdelivr.net/npm/@dmvs-apac/dm-custom-embed@1.5.9/dist/dm-no-cpe.min.js');
    }

    public function hook_player_into_content ( $content ) {

        if ( is_single()) {
            $id = get_the_ID();
            $value = \get_post_meta( $id, 'keywords_meta', true );

            return $content . '<div class="dm-player" owners="kompastv,suaradotcom" showInfoCard="true" keywordsSelector=".vr-keywords" sort="relevance"></div> <p class="vr-keywords" style="display: none">' . $value . '</p>';
        }

        return $content;
    }

}
