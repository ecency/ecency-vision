import {KeyChainTxResponse, KeyChainAuthorityTypes} from "../common/helper/keychain";

interface KeyChain {
    requestHandshake(callback: () => void): void;

    requestSignBuffer(account: string, message: string, key: KeyChainAuthorityTypes, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestAddAccountAuthority(account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, weight: number, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestRemoveAccountAuthority(account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;
}

export interface AppWindow extends Window {
    nws?: WebSocket;
    hive_keychain?: KeyChain;
}
