import axios from "axios"

// const baUrl = "http://localhost:4000"
const baUrl = "https://breakaway-points-system-api.onrender.com"

export const createBreakawayUser = async (username: string, community: string, referral: string, email: string)=> {
    try {
        const data = {
            username,
            community,
            referral,
            email
        }
        const resp = await axios.post(`${baUrl}/signup-keychain`, data)
        return resp;
    } catch (err) {
        console.log(err)
        return err;
    }
}

export const createSolanaUser = async (email: string, password: string, solanaWalletAddress: string) => {
  try {
    const data = {
      email,
      password,
      solanaWalletAddress,
    };

    const resp = await axios.post(`${baUrl}/offchain-users/register`, data);

    return resp.data;
  } catch (err) {
    console.log(err);

    return { err }
  }
};
