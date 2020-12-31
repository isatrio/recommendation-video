<?php
require __DIR__ . '/vendor/autoload.php';

/**
 * @package Video_Recommendation
 * @version 1.0.0
 */
/*
Plugin Name: Video Recommendation 
Plugin URI: http://wordpress.org/plugins/hello-dolly/
Description: A Plugin
Author: Yudhi Satrio
Version: 1.0.0
Author URI: http://me.linkaran.com/
*/

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}


define( 'VR__FILE__', __FILE__ );
define( 'VR_PLUGIN_BASE', plugin_basename( VR__FILE__ ) );
define( 'VR_PATH', plugin_dir_path( VR__FILE__ ) );

require VR_PATH . 'modules/info-extractor.php';
require VR_PATH . 'modules/keywords-meta.php';
require VR_PATH . 'modules/show-in-post.php';

new VR\KeywordsMeta();
new VR\ShowInPost();


//use \NlpTools\Tokenizers\WhitespaceTokenizer;
//use \NlpTools\Documents\TokensDocument;
//
//$s1 = "Please allow me to introduce myself
//            I'm a man of wealth and taste";
//$s2 = "Hello, I love you, won't you tell me your name
//            Hello, I love you, let me jump in your game";
//
//$tok = new WhitespaceTokenizer();
//
//
//$stones = new TokensDocument($tok->tokenize($s1)); // $stones now represents the "Sympathy for the devil" song
//$doors = new TokensDocument($tok->tokenize($s2)); // $doors now represents the "Hello, I love you" song
//
//print_r($stones);
//print_r($doors);
//die();
