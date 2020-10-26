interface KeyChain {
    requestHandshake(callback: () => void): void;

    requestSignBuffer(account: string, message: string, key: ["Posting", "Active", "Memo"], callback?: () => void, rpc?: string): void;
}

export interface AppWindow extends Window {
    nws?: WebSocket;
    hive_keychain?: KeyChain;
}
