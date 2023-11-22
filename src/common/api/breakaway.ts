import axios, { AxiosResponse } from "axios"
import * as ls from "../util/local-storage";

// const baUrl = "http://localhost:4000"
const baUrl = "https://breakaway-points-system-api.onrender.com"
const accessToken = ls.get("ba_access_token")

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

export const processLogin = async (username: string, ts: string, sig: string, community: string) => {
  try {
    const response: any = await axios.get(`${baUrl}/auth/login`, {
      params: { username, ts, sig, community },
    });

    const { token, ...user } = response.data.response;

    console.log('Login Successful', response);
    return response;

  } catch (error) {
    console.error('Login Failed: ', error);
  }
};

export const claimBaPoints = async (username: string, community: string) => {
  try {
    const response = await axios.post(`${baUrl}/points/claim`, {
      username: username,
      community: community,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
    );
    console.log(response)

    return response;
} catch (error) {
    console.error('Error claiming points:', error);
    throw error;
  }
};

export  const getBaUserPoints = async (username: string, community: string): Promise<any[] | undefined> => {
       
  try {
    const response: AxiosResponse | any = await axios.get(`${baUrl}/points?username=${username}&community=${community}`);

    return response;
  } catch (error) {
    console.error('Error fetching user points:', error);
    throw error;
  } 
};

export const updateUserPoints = async (username: string, community: string, pointType: string) => {
  console.log(username)
  try {
    const requestData = {
      username,
      community,
      pointType,
    };

    const response = await axios.post(`${baUrl}/points`, 
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}` ,
        },
      }
    );

    console.log(response.data);
    return response;
  } catch (error) {
    console.log('Error updating user points:', error);
    throw error;
  }
};
