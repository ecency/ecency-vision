// import * as keys from './keys'
// import * as relay from './relay'
// import * as event from './event'
// import * as filter from './filter'
// import * as path from './path'

// export {keys, relay, event, filter, path}

// export * as nip04 from './nip04'
export * as nip05 from "./nip05";
export * as nip06 from "./nip06";
export * as nip19 from "./nip19";
export * as nip26 from "./nip26";

// monkey patch secp256k1
import * as secp256k1 from "@noble/secp256k1";
import { hmac } from "@noble/hashes/hmac";
import { sha256 } from "@noble/hashes/sha256";
secp256k1.utils.hmacSha256Sync = (key, ...msgs) =>
  hmac(sha256, key, secp256k1.utils.concatBytes(...msgs));
secp256k1.utils.sha256Sync = (...msgs) => sha256(secp256k1.utils.concatBytes(...msgs));
