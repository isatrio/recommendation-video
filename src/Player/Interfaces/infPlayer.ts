export default interface InfPlayer {
    //Minimum length of words to keep
    minWordLength: number;

    //Minimum words to perform a search: while no results it will removes a word and retry search
    minWordSearch: number;

    //Maximum of words used for the search: more words you keep, less are chances to get a result
    maxWordSearch: number;

    //Which sort to use. List of available values: https://developer.dailymotion.com/api#video-sort-filter
    sort: string[];

    // Add selector to get keywords meta
    keywordsSelector: string;

    // Info of the video in a card below the video player
    showInfoCard?: boolean;

}
