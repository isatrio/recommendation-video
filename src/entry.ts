import DmManager from './DM/dm-manager';
import { waitFor } from './Libraries/Utilities/waitFor';

declare global {
    interface Window {
        WDMObject: any;
    }
}

// Load SDK first before start
(function() {
    var e = document.createElement('script');
    e.async = true;
    e.src = 'https://api.dmcdn.net/all.js';

    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(e, s);
}());

const init = async () => {

    // Wait `.dm-player` to be ready first before do everything
    await waitFor( () => document.querySelectorAll('.dm-player').length > 0, 500, 5000, "Timeout to get DM placeholder");

    // Wait DM sdk to be ready
    // @ts-ignore
    await waitFor( () => typeof DM !== 'undefined', 500, 10000, "Timeout to get DM sdk");

    // Get the video player container
    const el: NodeListOf<HTMLDivElement> = document.querySelectorAll('.dm-player');

    new DmManager(el);
};

init();
