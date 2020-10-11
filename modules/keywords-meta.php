<?php
namespace VR;

defined( 'ABSPATH' ) || exit;

class KeywordsMeta {

    public function __construct() {

        \add_action('add_meta_boxes', [$this, 'registerBoxMeta']);
        \add_action( 'save_post', [$this, 'saveMetaData']);
    }

    public function registerBoxMeta() {
        \add_meta_box( 'keywords-meta', 'Keywords Meta', [$this, 'postMetaCallback'], 'post', 'side', 'high', null );
    }

    public function postMetaCallback($post) {
        $value = \get_post_meta( $post->ID, 'keywords_meta', true );

        echo $value ? "Keywords: \r\n" . \esc_attr($value) : "Keywords not generated yet…";
    }

    public function saveMetaData($post_id) {
        if ( isset( $_POST['post_type'] ) && 'page' == $_POST['post_type'] ) {
            if ( ! \current_user_can( 'edit_page', $post_id ) ) {
                return;
            }
        }
        else{
            if ( ! \current_user_can( 'edit_post', $post_id ) ) {
                return;
            }
        }

        $post_entry = \get_post($post_id);

        $data = new InfoExtractor($post_entry->post_content);

        \update_post_meta( $post_id, 'keywords_meta', implode( ', ', $data->generateSummary()) );
    }
}
