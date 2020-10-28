import {AppWindow} from "../../client/window";

declare var window: AppWindow;

export interface KeyChainTxResponse {
    success: boolean,
    result: string
}

import {Symbol} from "./parse-asset";

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
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, rpc);
    });


export const addAccountAuthority = (account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, weight: number, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestAddAccountAuthority(account, authorizedUsername, "Posting", weight, (resp) => {
            if (!resp.success) {
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, rpc);
    });


export const removeAccountAuthority = (account: string, authorizedUsername: string, role: KeyChainAuthorityTypes, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestRemoveAccountAuthority(account, authorizedUsername, "Posting", (resp) => {
            if (!resp.success) {
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, rpc);
    })


export const transfer = (account: string, to: string, amount: string, memo: string, currency: Symbol, enforce: boolean, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestTransfer(account, to, amount, memo, currency, (resp) => {
            if (!resp.success) {
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, enforce, rpc);
    })


export const customJson = (account: string, id: string, key: KeyChainAuthorityTypes, json: string, display_msg: string, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestCustomJson(account, id, key, json, display_msg, (resp) => {
            if (!resp.success) {
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, rpc);
    })


export const broadcast = (account: string, operations: any[], key: KeyChainAuthorityTypes, rpc: string | null = null): Promise<KeyChainTxResponse> =>
    new Promise<KeyChainTxResponse>((resolve, reject) => {
        window.hive_keychain?.requestBroadcast(account, operations, key, (resp) => {
            if (!resp.success) {
                reject({message: "Operation cancelled"});
            }

            resolve(resp);
        }, rpc);
    })
