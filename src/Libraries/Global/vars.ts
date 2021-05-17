// Utilities
import getParam from "../Utilities/get-query-params";

// Get debug mode params from url
export const debugMode: boolean = (getParam('dmdebug') != null && getParam('dmdebug') != 'false');

export const apiUrl: string = "https://api.dailymotion.com/";
