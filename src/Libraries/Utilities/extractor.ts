import infPlayer from '../../Player/Interfaces/infPlayer';

export default function playerExtractor(rootEl: HTMLDivElement): infPlayer {

    /**
     * See interfaces/infPlayer.ts to know further
     */
    const playerParams: infPlayer = {
        maxWordSearch: rootEl.getAttribute('maxWordSearch') ? Number(rootEl.getAttribute('maxWordSearch')) : 15,
        minWordLength: rootEl.getAttribute('minWordLength') ? Number(rootEl.getAttribute('minWordLength')) : 4,
        minWordSearch: rootEl.getAttribute('minWordSearch') ? Number(rootEl.getAttribute('minWordSearch')) : 2,
        sort:  rootEl.getAttribute("sort") ? rootEl.getAttribute("sort").split(',') : ["recent"],
        keywordsSelector: rootEl.getAttribute('keywordsSelector') ? rootEl.getAttribute('keywordsSelector') : null,
        showInfoCard: ( rootEl.getAttribute('showInfoCard') != 'false' &&  rootEl.getAttribute('showInfoCard') != null ),
    };

    return playerParams;
}