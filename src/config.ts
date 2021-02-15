/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
    privateApiAddr: process.env.PRIVATE_API_ADDR || "https://domain.com/api",
    privateApiAuth: {
        "Authorization": `Basic ${process.env.PRIVATE_API_PASSWORD || "pass"}`,
        "User-Agent": process.env.PRIVATE_API_AGENT || "Chrome",
    },
    hsClientSecret: process.env.HIVESIGNER_CLIENT_SECRET || "hivesignerclientsecret",
    searchApiAddr: process.env.SEARCH_API_ADDR || "https://api.search.com",
    searchApiToken: process.env.SEARCH_API_SECRET || "searchApiSecret"
};
