// Utilities
import { waitFor } from "../Libraries/Utilities/waitFor";

import PlayerManager from "../Player/player-manager";
import ScrollOut from "scroll-out";

// Assets
import './Scss/dm.scss';
import infDm from './Interfaces/infDm';

export default class DmManager {
    private rootEls: NodeListOf<HTMLDivElement> = null;
    private keywords: string = null;
    private videoInside: HTMLDivElement = null;

    // TODO: Find best practice to do static variable and function
    private static player: PlayerManager[] = [];

    // Player stuffs
    public dm: any = null;
    private pauseOnClick: boolean = false;
    private onViewport: boolean = false;
    private isOnPiP: boolean = false;
    private closeClick: boolean = false;
    private hidden: string = '';
    private visibilityChange: string = '';

    public constructor(rootEls: NodeListOf<HTMLDivElement>, keywords?: string){
        // Pass rootEls to local variable
        this.rootEls = rootEls;
        this.keywords = keywords;
        this.setVisibilitEnv();
        this.renderElement();
        this.addEventListeners();
    }

    private setVisibilitEnv() {
        if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support
            this.hidden = "hidden";
            this.visibilityChange = "visibilitychange";

            //@ts-ignore
        } else if (typeof document.msHidden !== "undefined") {
            this.hidden = "msHidden";
            this.visibilityChange = "msvisibilitychange";

            //@ts-ignore
        } else if (typeof document.webkitHidden !== "undefined") {
            this.hidden = "webkitHidden";
            this.visibilityChange = "webkitvisibilitychange";
        }
    }

    private async addEventListeners() {

        await waitFor( () => this.dm !== null, 500, 10000, "Timeout waiting player to be ready");

        document.addEventListener('dm-in-viewport-change', (e: Event) => {
            //@ts-ignore
            if (e.detail === true) {
                this.isInViewport();
            } else {
                this.isNotInViewport();
            }
        });

        document.addEventListener('dm-slide-changes', (e: Event) => {
            // @ts-ignore
            this.dm.load({video: e.detail});
        });

        this.dm.addEventListener('apiready', (e: Event) => {
            this.listenToScroll();
            this.dm.play();
            this.isOnPiP = true;
            DmManager.player[0].rootEl.setAttribute('data-is-pip', 'true');
        });

        this.dm.addEventListener('playback_ready', (e: Event) => {
            const showPlayer = new CustomEvent('dm-show-player');
            document.dispatchEvent(showPlayer);
        });

        this.dm.addEventListener('pause', (e: Event) => {
            if (this.onViewport === true) {
                this.pauseOnClick = true;
            }
        });

        this.dm.addEventListener('play', (e: Event) => {
            if (this.onViewport === true && this.pauseOnClick === true) {
                this.pauseOnClick = false;
            }

            if (this.onViewport === true && this.closeClick === true) {
                this.closeClick = false;
            }

            // Add `.dm__playing` to start show the close button
            this.dm.parentNode.parentNode.parentNode.classList.add('dm__playing');
        });

        this.dm.addEventListener('end', (e: Event) => {
            const videoEnd = new CustomEvent("dm-video-end", {detail: this.dm.video.videoId});
            document.dispatchEvent(videoEnd);

            // Remove `.dm__playing` to hide the close button
            this.dm.parentNode.parentNode.parentNode.classList.remove('dm__playing');
        });

        /**
         * Add new class `dm-playback-ready` to show the player
         */
        document.addEventListener('dm-show-player', (e: Event) => {
            this.dm.parentNode.parentNode.parentNode.classList.add('dm-playback-ready');
        });

        /**
         * Handle change tab by user
         */
        document.addEventListener(this.visibilityChange, (e: Event) => {
            if (document[this.hidden]) {
                if (this.pauseOnClick !== false) this.dm.pause();
            } else {
                if (this.pauseOnClick !== false) this.dm.play();
            }
        });
    }

    private listenToScroll() {
        ScrollOut({
            targets: this.rootEls[0],
            onShown: (element, ctx, scrollingElement) => {
                const isInViewport = new CustomEvent('dm-in-viewport-change', { detail: true});
                document.dispatchEvent(isInViewport);
            },
            onHidden: (element, ctx, scrollingElement) => {
                const isInViewport = new CustomEvent('dm-in-viewport-change', { detail: false});
                document.dispatchEvent(isInViewport);
            }
        });
    }

    public async renderElement() {

        for ( let i=0; i<this.rootEls.length; i++) {
            DmManager.player[i] = new PlayerManager("dm_" + i, this.rootEls[i], (i===0 && this.keywords !== null) ? this.keywords : null);

            const player = DmManager.player[i];

            await waitFor( () => player.videoParams !== null, 500, 10000, "Timeout waiting videoParams");

            this.videoInside = document.createElement('div');
            this.videoInside.className = 'inside';

            const videoPlaceholder = document.createElement('div');
            videoPlaceholder.className = 'dailymotion-no-cpe';

            const closeButton = document.createElement('button');
            closeButton.className = 'dm__close-button';
            closeButton.setAttribute('aria-label', 'Close Picture-in-Picture video player');

            const closeImg = new Image();
            closeImg.src = 'https://api.dmcdn.net/pxl/cpe/btnClose.png';
            closeImg.alt = 'Close Picture-in-Picture video player';

            closeButton.appendChild(closeImg);

            this.videoInside.appendChild(closeButton);
            this.videoInside.appendChild(videoPlaceholder);

            // Add closeButton and videoPlaceholder
            this.rootEls[i].querySelector('.dailymotion-cpe').appendChild(this.videoInside);

            const params = await this.setParams();

            // @ts-ignore
            this.dm = DM.player(videoPlaceholder, {
                video: player.videoParams.id,
                params: params
            });

            closeButton.addEventListener('click', () => { this.closePip(); });

        }

    }

    private setParams(): Promise<infDm> {
        return new Promise( resolve => {
            const playerParams = DmManager.player[0].playerParams;

            const params: infDm = {
                mute: true,
                'queue-enable': true,
                'queue-autoplay-next': true,
            }

            resolve(params);
        });
    }

    private closePip(): void {
        this.dm.pause();
        DmManager.player[0].rootEl.setAttribute('data-is-pip', 'false');
        this.closeClick = true;
    }

    private isNotInViewport(): void {
        /**
         * This is condition for default PiP
         */
        if (this.closeClick !== true && this.dm.paused !== true) {
            this.isOnPiP = true;
            DmManager.player[0].rootEl.setAttribute('data-is-pip', 'true');
        }

        // Change flag for auto play and auto pause purposes
        this.onViewport = false;
    }

    private isInViewport(): void {

        if (this.closeClick !== true) {
            this.isOnPiP = false;
            DmManager.player[0].rootEl.setAttribute('data-is-pip', 'false');
        }

        // Change flag for auto play and auto pause purposes
        this.onViewport = true;
    }
}