import axios from 'axios';

export interface TokenBalance {
    symbol: string,
    balance: string,
    stake: string,
    pendingUnstake: string,
    delegationsIn: string,
    delegationsOut: string,
    pendingUndelegations: string
}

const HIVE_ENGINE_RPC_URL = 'https://api.hive-engine.com/rpc/contracts'

export const getTokenBalances = (account: string): Promise<TokenBalance[]> => {
    const data = {
        "jsonrpc": "2.0",
        "method": "find",
        "params": {
            "contract": "tokens",
            "table": "balances",
            "query": {
                "account": account
            }
        },
        "id": 1
    }

    return axios.post(
        HIVE_ENGINE_RPC_URL,
        JSON.stringify(data),
        { headers: { "Content-type": "application/json" }}
    ).then(r => r.data.result);
}