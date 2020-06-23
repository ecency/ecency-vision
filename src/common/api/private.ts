import axios from "axios";

export interface ReceivedVestingShare {
  delegatee: string;
  delegator: string;
  timestamp: string;
  vesting_shares: string;
}

export const getReceivedVestingShares = (username: string): Promise<ReceivedVestingShare[]> =>
  axios.get(`/api/received-vesting/${username}`).then((resp) => resp.data.list);

export const hsTokenRenew = (code: string) =>
  axios
    .post(`/api/hs-token-refresh`, {
      code,
    })
    .then((resp) => resp.data);
