import {KeyChainImpl} from "../common/helper/keychain";

export interface AppWindow extends Window {
    nws?: WebSocket;
    hive_keychain?: KeyChainImpl;
}
