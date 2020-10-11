<?php
namespace VR;

/**
 * Info Extractor
 * 
 */

defined( 'ABSPATH' ) || exit;

class InfoExtractor {

    private $wordCounter = [];
    private $allWords = [];
    private $tfidf = [];

	public function __construct($text) {
		$this->tfidf($text);
	}

	private function tfidf($text) {
		$docs = $this->normalization($text);

		$tokens = $this->tokenization($docs);

		$groups = $this->grouping($tokens);

		$tf = $this->TF($groups);

 		$idf = $this->IDF($groups);

 		foreach ($groups as $index => $words) {
 		    foreach ($words as $word => $value) {
                $this->tfidf[$word] = $tf[$index][$word] * $idf[$word];
            }
        }

	}

	private function normalization($text) {

	    $docs = preg_split('/\r\n|\r|\n/',$text);
	    $result = [];

	    foreach ($docs as $doc) {

            // Process the text
            $doc = strtolower($doc);

            $stemmerFactory = new \Sastrawi\Stemmer\StemmerFactory();
            $stemmer = $stemmerFactory->createStemmer();

            $result[] = $stemmer->stem($doc);

        }
		
		return $result;
	}

	private function tokenization($docs) {

	    $result = [];
	    foreach($docs as $index => $value) {
	        $result[$index] = explode(' ', $value);
        }

		return $result;
	}
	
	private function grouping($tokens) {
		$words = [];
		foreach($tokens as $docIndex => $docs) {

		    foreach ($docs as $word) {
                $word = trim($word);
                $junk = preg_match('/[^a-zA-Z]/', $word);

                if($junk == 1) $word = '';

                if ( $word !== '' && $word !== 'wp') {
                    $words[$docIndex][$word][] = $word;
                    $this->wordCounter[$docIndex] += 1;
                }
            }

		}

		return $words;
	}

	private function TF($docs) {

	    $tf = [];

        foreach ($docs as $docIndex => $doc) {

            /**
             * Count the words first
             */
            foreach ($doc as $words) {
                $tf[$docIndex][$words[0]] = sizeof($words)/$this->wordCounter[$docIndex];
            }

            foreach ($tf[$docIndex] as $word => $value) {
                $this->allWords[$word] += 1;
            }
        }

	    return $tf;
	}

	private function IDF($docs) {
		$idf = [];

        foreach ($this->allWords as $word => $value) {
            $idf[$word] = log(sizeof($docs) / $this->allWords[$word]);
        }

		return $idf;
	}

	private function avarage($tfidf) {
        $totalScore = 0;

        foreach($tfidf as $word => $score) {
            $totalScore += $score;
        }

        return $totalScore / sizeof($tfidf);
    }

    public function generateSummary() {
        $treshold = 1.8 * $this->avarage($this->tfidf);
        $summary = [];
	    foreach($this->tfidf as $word => $score) {
	        if ($score > $treshold) $summary[] = $word;
        }

	    return $summary;
    }

}

