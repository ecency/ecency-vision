import {AppWindow} from "../../client/window";

declare var window: AppWindow;

export interface KeyChainTxResponse {
    success: boolean,
    result: string
}

export type KeyChainAuthorityTypes = "Posting" | "Active" | "Memo";


export const handshake = (): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve) => {
        window.hive_keychain?.requestHandshake(() => {
            resolve();
        });
    });


export const signBuffer = (account: string, message: string, key: KeyChainAuthorityTypes, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestSignBuffer(account, message, "Active", (resp) => {
            if (!resp.success) {
                reject();
            }

            resolve(resp);
        }, rpc);
    });


export const addAccountAuthority = (account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, weight: number, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestAddAccountAuthority(account, authorizedUsername, "Posting", weight, (resp) => {
            if (!resp.success) {
                reject();
            }

            resolve(resp);
        }, rpc);
    });


export const removeAccountAuthority = (account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestRemoveAccountAuthority(account, authorizedUsername, "Posting", (resp) => {
            if (!resp.success) {
                reject();
            }

            resolve(resp);
        }, rpc);
    })

