/* !!! DO NOT IMPORT config.js TO FRONTEND CODE !!! */

export default {
    usePrivate: process.env.USE_PRIVATE || "0",    // "1" | "0"
    hsClientSecret: process.env.HIVESIGNER_SECRET || "", // when USE_PRIVATE=0 and HIVESIGNER client section must be provided
    hsClientId: process.env.CLIENT_ID || "ecency.app", // used to override which user will do posting authority on behalf of the user via hive-signer.
};
