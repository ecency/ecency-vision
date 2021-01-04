import {KeyChainImpl} from "../common/helper/keychain";

export interface AppWindow extends Window {
    nws?: WebSocket;
    comTag?: {};
    hive_keychain?: KeyChainImpl;
    twttr?: {
        widgets?: {
            load: () => void
        }
    }
}
