// Global
import { debugMode } from "../Global/vars";

export function fetchData(urlParams: string): Promise<any> {
    return new Promise( async (resolve, reject) => {
      const response = await fetch(urlParams);

        /**
         * Only HTTP 200 is regarded as successful response
         */
        if (response.status === 200) {
            resolve(response.json());
        } else {
            reject();
        }
    }).catch( (err) => {
        // Do nothing, just don't show to user what's happened on player
        if (debugMode === true) {
            console.log("API calling error");
        }
    });
}
