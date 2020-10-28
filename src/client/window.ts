import {KeyChainTxResponse, KeyChainAuthorityTypes} from "../common/helper/keychain";

import {Symbol} from "../common/helper/parse-asset";

interface KeyChain {
    requestHandshake(callback: () => void): void;

    requestSignBuffer(account: string, message: string, key: KeyChainAuthorityTypes, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestAddAccountAuthority(account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, weight: number, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestRemoveAccountAuthority(account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestTransfer(account: string, to: string, amount: string, memo: string, currency: Symbol, callback: (r: KeyChainTxResponse) => void, enforce: boolean, rpc: string | null): void;

    requestCustomJson(account: string, id: string, key: KeyChainAuthorityTypes, json: string, display_msg: string, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;

    requestBroadcast(account: string, operations: any[], key: KeyChainAuthorityTypes, callback: (r: KeyChainTxResponse) => void, rpc: string | null): void;
}

export interface AppWindow extends Window {
    nws?: WebSocket;
    hive_keychain?: KeyChain;
}
