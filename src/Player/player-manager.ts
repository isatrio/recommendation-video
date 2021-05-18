// Interfaces
import infPlayer from '../Player/Interfaces/infPlayer';
import infSearch from "../Player/Interfaces/infSearch";
import infVideo from "../Player/Interfaces/infVideo";
import infMultiPlayer from "../Player/Interfaces/infMultiPlayer";

// Global
import { apiUrl, debugMode } from '../Libraries/Global/vars';

// Utilities
import htmlEntities from "../Libraries/Utilities/html-entities";
import { fetchData } from "../Libraries/API/apiCall";
import {waitFor} from "../Libraries/Utilities/waitFor";

// Components
import setPreVideoTitle from "../Player/Components/pre-video-title";
import VideoTitle from "../Player/Components/video-title";
import InfoCard from "../Player/Components/info-card";

// Styles
import './Scss/player.scss';

/**
 * An agnostic player renderer
 */
export default class PlayerManager {
    private id: string = "";
    private searchParams: infSearch = null;
    public videoParams: infVideo = null;
    private keywords: string = null;

    private videoTitle: HTMLParagraphElement = null;
    private infoCard: HTMLDivElement = null;

    public cpeId: string[] = [];
    public cpeParams: object = {};
    public multiplayerParams: infMultiPlayer = null;
    public playerParams: infPlayer = null;
    public rootEl: HTMLDivElement = null;

    public constructor(id: string, rootEl: HTMLDivElement, keywords?: string) {
        this.rootEl = rootEl;
        this.id = id;

        this.keywords = keywords;

        this.addEventListeners();
        this.extractAttrs();
    }

    private addEventListeners() {
        /**
         * Listen to `dm-api-ready` to run `loadDmPlayer` to construct the player
         */
        document.addEventListener('dm-api-ready', ( e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                this.loadDmPlayer(this.rootEl);
            }
        });

        /**
         * Listen to `player-extracted` to wait all attributes is extracted from the element
         * then prepare the search parameters
         */
        document.addEventListener('dm-player-extracted', (e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                this.prepareSearchParams();
            }
        });

        /**
         * Listen to `dm-search-params-ready` after parameters is ready then start search
         * related/recent video
         */
        document.addEventListener( 'dm-search-params-ready', (e: Event) => {
            //@ts-ignore
            if (e.detail === this.id) {
                this.searchVideo();
            }
        });

        document.addEventListener('dm-video-updated', (e: Event) => {
            //@ts-ignore
            this.getVideoInfo(e.detail.videoId, false);
        });

    }

    private extractAttrs() {
        const rootEl = this.rootEl;

        /**
         * See interfaces/infPlayer.ts to know further
         */
        this.playerParams = {
            maxWordSearch: rootEl.getAttribute('maxWordSearch') ? Number(rootEl.getAttribute('maxWordSearch')) : 15,
            minWordLength: rootEl.getAttribute('minWordLength') ? Number(rootEl.getAttribute('minWordLength')) : 4,
            minWordSearch: rootEl.getAttribute('minWordSearch') ? Number(rootEl.getAttribute('minWordSearch')) : 2,
            sort:  rootEl.getAttribute("sort") ? rootEl.getAttribute("sort").split(',') : ["relevance"],
            keywordsSelector: rootEl.getAttribute('keywordsSelector') ? rootEl.getAttribute('keywordsSelector') : null,
            showInfoCard: (rootEl.getAttribute('showInfoCard') === 'true'),
        };

        // Tell the event listener that player parameters is extracted
        const playerExtracted = new CustomEvent('dm-player-extracted', { detail: this.id});
        document.dispatchEvent(playerExtracted);
    }

    /**
     * Set search parameters
     *
     * For all search parameters, please see interfaces/infSearch.ts
     */
    private prepareSearchParams(): void {
        const fields = 'id,title,description,owner.avatar_190_url,thumbnail_480_url';

        this.searchParams = {
            fields: fields,
            limit: 1,
        };

        const keywords = this.findKeywords(this.playerParams.keywordsSelector);
        this.keywords = this.keywords ? 
                        (this.sanitizeKeywords(this.keywords)).join(' ') :
                        keywords.slice(0, this.playerParams.maxWordSearch).join(' ');

        this.searchParams.private = 0;
        this.searchParams.flags = "no_live,exportable,verified";
        this.searchParams.longer_than = 0.35; //21sec
        this.searchParams.owners = "kompastv,suara";

        this.searchParams.language = 'id';

        // Tell the event listener that search params is ready
        const searchParamsReady = new CustomEvent('dm-search-params-ready', { detail: this.id})
        document.dispatchEvent(searchParamsReady);

    }

    private loadDmPlayer(rootEl: HTMLDivElement): void {
        const dmEmbed = document.createElement("div");

        // Append the element to the root player element
        rootEl.appendChild(dmEmbed);

        // Send to DmManager that element already created
        const ElementCreated = new CustomEvent('dm-video-holder-ready');
        document.dispatchEvent(ElementCreated);
    }

    private setVideo(video: infVideo, createNew?: boolean): void {
        this.videoParams = video;

        if (createNew) {
            const apiReady = new CustomEvent("dm-api-ready", {detail: this.id})
            document.dispatchEvent(apiReady);
        }

        this.updateVideoInfo();
    }

    private updateVideoInfo() {
        /**
         * Set an info card
         */
        if (this.playerParams.showInfoCard !== false) {
            const infoCard = new InfoCard();
            if (this.infoCard !== null) {
                this.infoCard.remove();
            }

            this.infoCard = infoCard.setInfoCard(this.videoParams);
            this.rootEl.insertAdjacentElement('beforeend', this.infoCard);
        }

    }

    private async getVideoInfo(videoId: string, createNew: boolean) {
        const url = apiUrl + "video/" + videoId + '?fields=' + this.searchParams.fields;
        const video: infVideo = await fetchData(url);

        this.setVideo(video, createNew);
    }

    private async generateQuery(sort: string): Promise<string> {
        // Waiting for search params to be ready
        await waitFor( () => this.searchParams !== null, 100, 5000, "Timeout waiting for searchParams not null");

        const date = new Date();

        if ( this.keywords !== '' && sort === 'relevance' ||
            ( sort === 'recent' && this.keywords.split(' ').length > this.playerParams.minWordSearch) ) {
            this.searchParams.search = this.keywords;
        } else {
            delete this.searchParams.search;
        }

        // Serialize search params before send it
        const properties = Object.entries( this.searchParams ).map( ([ key, value] ) => {
            return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }).join('&');

        const addProps = '&sort=' + sort;

        return new Promise((resolve, reject) => {
            const url = apiUrl + "videos" + "?" + properties + addProps;

            resolve(url);
        });
    }

    private async searchVideo(): Promise<void> {
        let video = await fetchData( await this.generateQuery(this.playerParams.sort[0]) );

        if (video) {
            if (video.list.length > 0) {
                this.setVideo(video.list[0], true);
            } else if (this.playerParams.sort[0] === 'relevance') {

                // Strip a string to try to get video one more time if there is no video found
                this.keywords = this.keywords.substring(0, this.searchParams.search.lastIndexOf(' '));
                video = await fetchData( await this.generateQuery(this.playerParams.sort[0]) );

                if (video.list.length > 0) {
                    this.setVideo(video.list[0], true);
                }

            }

            /**
             * This condition is to check if no videos found
             */
            if (video.list.length === 0 ) {
                this.getFallbackVideo();
            }

        }
    }

    private async getFallbackVideo(): Promise<void> {

        // Define current time and 30 days
        const currentTime = Math.floor(Date.now()/1000);
        const thirtyDays = 2592000;

        // Generate url to call
        const url = apiUrl + "videos?created_after=" + (currentTime - thirtyDays) + "&" + "sort=random&owners=kompastv,suara&limit=1&fields=" + this.searchParams.fields;
        const video = await fetchData(url);

        if (video) {
            if (video.list.length > 0) {
                /**
                 * Data return array, get the first array and pass it to setVideo function
                 */
                this.setVideo(video.list[0], true);
            } else {
                console.warn("DM related Unable to find a fallback video");
            }
        }

    }

    /**
     * Find keywords strings on website
     *
     * selector must be a meta tag placed in head
     */
    private findKeywords(selector?: string): string[] {
        let keywords = [''];

        if ( selector !== null ) {
            try {
                const keywordContainer = document.querySelector(selector);
                keywords = this.sanitizeKeywords(keywordContainer.textContent ? keywordContainer.textContent : keywordContainer.getAttribute("content"));
            } catch (e) {
                console.error("Can't find selector: ", selector);
            }

        } else if ( selector === null && typeof document.getElementsByTagName("h1")[0] !== "undefined") {
            keywords = this.sanitizeKeywords(document.getElementsByTagName("h1")[0].textContent);
        }

        return keywords;
    }

    /**
     * Sanitize keywords based on language
     *
     * Alphabet: a-zA-Z0-9
     * Latin Character: \u00C0-\u00FF
     */
    // TODO: improve sanitize the keywords to strip duplicate string
    protected sanitizeKeywords(keywords: string): string[] {

        return keywords.replace(/[^- a-zA-Z0-9 \u00C0-\u00FF \u0153]/g, ' ')
            .split(' ')
            .filter(word => word.length >= this.playerParams.minWordLength);
    }

}
