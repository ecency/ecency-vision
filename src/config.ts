/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
    usePrivate: process.env.USE_PRIVATE || "0",    // "1" | "0"
    hsClientSecret: process.env.HIVESIGNER_SECRET || "",    // when USE_PRIVATE=0 and HIVESIGNER desired
};
