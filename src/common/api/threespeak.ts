import { Memo } from "@hiveio/dhive";
import * as tus from "tus-js-client";
import axios from "axios";
import { getPostingKey } from "../helper/user-token";
import { getDecodedMemo } from "../helper/hive-signer";

const studioEndPoint = "https://studio.3speak.tv";
const tusEndPoint = "https://uploads.3speak.tv/files/";
const client = axios.create({});

export const threespeakAuth = async (username: string) => {
  try {
    let response = await client.get(
      `${studioEndPoint}/mobile/login?username=${username}&hivesigner=true`,
      {
        withCredentials: false,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    const memo_string = response.data.memo;
    let { memoDecoded } = await getDecodedMemo(username, memo_string);
    console.log("access_token", memoDecoded);

    memoDecoded = memoDecoded.replace("#", "");
    const user = await getTokenValidated(memoDecoded, username);
    return memoDecoded;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getTokenValidated = async (jwt: string, username: string) => {
  try {
    let response = await client.get(
      `${studioEndPoint}/mobile/login?username=${username}&access_token=${jwt}`,
      {
        withCredentials: false,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return response.data; //cookies
  } catch (err) {
    console.log(err);
    throw err;
  }
};

// THIS SHOULD BE REMOVED updateVideoInfo CAN BE USED DIRECTLY
export const uploadVideoInfo = async (
  username: string,
  videoUrl: string,
  thumbUrl: string,
  oFileName: string,
  fileSize: number
) => {
  const data = await updateVideoInfo(oFileName, fileSize, videoUrl, thumbUrl, username);
  return data;
};

export const updateVideoInfo = async (
  oFilename: string,
  fileSize: number,
  videoUrl: string,
  thumbnailUrl: string,
  username: string
) => {
  const token = await threespeakAuth(username);
  try {
    // const { activeUser } = this.props;
    const { data } = await axios.post(
      `${studioEndPoint}/mobile/api/upload_info?app=ecency`,
      {
        filename: videoUrl,
        oFilename: oFilename,
        size: fileSize,
        duration: 40,
        thumbnail: thumbnailUrl,
        isReel: false,
        owner: username
      },
      {
        withCredentials: false,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      }
    );
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const getAllVideoStatuses = async (username: string) => {
  const token = await threespeakAuth(username);
  try {
    let response = await client.get(`${studioEndPoint}/mobile/api/my-videos`, {
      withCredentials: false,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const updateSpeakVideoInfo = async (
  username: string,
  postBody: string,
  videoId: string,
  title: string,
  tags: string[],
  isNsfwC: boolean
) => {

  const token = await threespeakAuth(username);

  const data = {
    videoId: videoId,
    title: title,
    description: postBody,
    isNsfwContent: isNsfwC,
    tags_v2: tags
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`
  };

  axios
    .post(`${studioEndPoint}/mobile/api/update_info`, data, { headers })
    .then((response) => {
      console.log(response.data); // Do something with the response data
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};


export const markAsPublished = async (username: string, videoId: string) => {
  const token = await threespeakAuth(username);
    const data = {
      videoId
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    };

    axios
    .post(`${studioEndPoint}/mobile/api/my-videos/iPublished`, data, { headers })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}