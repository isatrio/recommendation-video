import infMultiplayer from "./Interfaces/infMultiPlayer";
import infPlayer from "./Interfaces/infPlayer";

import { sleep, waitFor } from "../Libraries/Utilities/waitFor";

export default class PlayerEventsManager {
    private players: any[] = [];
    private noFill: boolean = true;
    private adPlaying: string = '';
    private multiplayerParams: infMultiplayer = null;
    private playerParams: infPlayer = null;
    private hidden: string = '';
    private visibilityChange: string = '';
    private adPause: boolean = false;
    private pauseOnClick: boolean = false;

    public constructor(playerParams: infPlayer, multiplayer: infMultiplayer) {
        this.setVisibilitEnv();
        this.videoEvents();

        this.playerParams = playerParams;
        this.multiplayerParams = multiplayer;
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

    /**
     * Listen to video events from Dailymotion player
     */
    private async videoEvents() {
        // Ignore 'cpeready' event because this event is from outside the script
        // @ts-ignore
        window.addEventListener('cpeready', ({ detail: { players } }) => {

            this.players = players;

            for (let i=0; i < players.length; i++) {
                const player = players[i];

                player.addEventListener('videochange', async (e) => {
                    const video = player.video;
                    const videoUpdated = new CustomEvent('dm-video-updated', { detail: { videoId: video.videoId }})
                    document.dispatchEvent(videoUpdated);
                });

                player.addEventListener('ad_start', (e: Event) => {
                    this.noFill = false;
                });

                /**
                 * Listen to an ad_play
                 *
                 * - Cover others player when the ad is played
                 */
                player.addEventListener('ad_play', (e: Event) => {

                    this.showPlayer();

                    if (this.adPlaying === '') {
                        this.adPlaying = player.id;
                    }
                });

                /**
                 * Listen to an ad_end event
                 *
                 * - Remove player cover when the ad is ended
                 */
                player.addEventListener('ad_end', (e: Event) => {
                    if (this.adPlaying !== '') {
                        this.adPlaying = '';

                        // Toggle disabled player
                        if (this.multiplayerParams.adCoverPlay) {
                            this.toggleDisable();
                        }

                    }
                });

                /**
                 * Listen to ad_pause to handle the pause event
                 * when player is clicked by user
                 *
                 * - Tell the listener that the ad is paused by user click
                 */
                player.addEventListener('ad_pause', (e: Event) => {
                    this.adPause = true;
                });

                /**
                 * Listening to playing event
                 *
                 * - Close the PiP if there are multiple players and the closePip is true
                 */
                player.addEventListener('playing', async (e: Event) => {
                    if (this.multiplayerParams.closePip === true) {
                        this.togglePlay(player.id);
                    }
                });

                /**
                 * Listen to video end, and process the next thing
                 * It will load new video from the playlist
                 */
                player.addEventListener('end', (e: Event) => {
                    const videoEnd = new CustomEvent("dm-video-end", {detail: player.video.videoId});
                    document.dispatchEvent(videoEnd);
                });

                player.addEventListener('video_start', (e: Event) => {
                    this.showPlayer();
                });

                /**
                 * Listen to `playback_ready` to show the player
                 */
                player.addEventListener('playback_ready', async (e: Event) => {
                    const dmPlayer = player.parentNode.parentNode.parentNode;

                });

                /**
                 * Handle player error as well to avoid bad UX
                 */
                player.addEventListener('error', (e) => {
                    // console.log(e);
                });
            }
        });

        /**
         * Listen to PiP close to pause the video player
         */
        // @ts-ignore
        window.addEventListener('cpepipclose', ({ detail: { player } }) => {
            // Do pause when cpe PiP is closed
            player.pause();
        });

        document.addEventListener('customClosePip', (e: Event) => {
            // Do pause when cpe PiP is closed
            this.players[0].pause();
        });

        /**
         * Listen to slide changes to set the video to play
         */
        // TODO: support multiplayer for next development
        document.addEventListener('dm-slide-changes', ( e: Event) => {
            // @ts-ignore
            this.players[0].load({ video: e.detail});
        });

        /**
         * Destroy the player if there is no ad to serve
         */
        document.addEventListener('dm-destroy-player', (e: Event) => {
            // @ts-ignore
            this.players[0].parentNode.parentNode.parentNode.remove(); // Get dm-player first
        });

        /**
         * Add new class `dm-playback-ready` to show the player
         */
        document.addEventListener('dm-show-player', (e: Event) => {
            this.players[0].parentNode.parentNode.parentNode.classList.add('dm-playback-ready');
        });

        /**
         * Handle change tab by user
         */
        document.addEventListener(this.visibilityChange, (e: Event) => {
            if (!document[this.hidden] && this.adPause === true) {
                this.players[0].play();
                this.adPause = false;
            }
        });
    }

    private showPlayer() {
        const showPlayer = new CustomEvent('dm-show-player');
        document.dispatchEvent(showPlayer);
    }

    /**
     * Toggle play and remove all PiP active
     *
     * @param playerId
     */
    private togglePlay(playerId: string): void {

        // Check every player available
        for (let i=0; i < this.players.length; i++) {

            // close the PiP if other player is start playing
            if (this.players[i].id !== playerId) {
                const parent = this.players[i].parentNode;
                this.players[i].pause();
                parent.classList.remove('pip');
            }
        }

    }

    /**
     * Add cover to others player to be not clickable by the user
     */
    private toggleDisable(): void {

        // Check every player available
        for (let i=0; i < this.players.length; i++) {

            // get parent player
            const parent = this.players[i].parentNode;

            if (this.adPlaying !== '' && this.adPlaying !== this.players[i].id) {
                parent.classList.add('dm-disabled');
            } else {
                parent.classList.remove('dm-disabled');
            }
        }
    }
}