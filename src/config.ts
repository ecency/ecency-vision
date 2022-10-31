/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
    usePrivate: process.env.USE_PRIVATE || "0",    // "1" | "0"
    hsClientSecret: process.env.HIVESIGNER_SECRET || "", // When USE_PRIVATE=0, set this to the Secret set over at Hive Signer.
    hsClientId: process.env.HIVESIGNER_ID || "ecency.app", // When USE_PRIVATE=0, this is used to override which user will do posting authority on behalf of the user via h    usePrivate: process.env.USE_PRIVATE || "0", // "1" | "0"
    redisUrl: process.env.REDIS_URL
};
