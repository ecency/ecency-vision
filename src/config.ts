/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
    privateApiAddr: process.env.PRIVATE_API_ADDR || "https://domain.com/api",
    privateApiAuth: process.env.PRIVATE_API_AUTH || "privateapiauth",
    hsClientSecret: process.env.HIVESIGNER_CLIENT_SECRET || "hivesignerclientsecret",
    searchApiAddr: process.env.SEARCH_API_ADDR || "https://api.search.com",
    searchApiToken: process.env.SEARCH_API_SECRET || "searchApiSecret"
};
