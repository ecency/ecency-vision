const hive = require("@hiveio/dhive");
const tus = require("tus-js-client");

const axios = require("axios").default;
const { CookieJar } = require("tough-cookie");
const { wrapper } = require("axios-cookiejar-support"); 

const jar = new CookieJar();
const client = wrapper(axios.create({ jar }));

// Generate Memo from Username
const getMemo = async (username: string, studioEndPoint: string) => {
  try {
    let response = await client.get(`${studioEndPoint}/mobile/login?username=${username}`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.data.memo;
  } catch (err) {
    console.log(err, "error");
    throw err;
  }
}

// Get Cookie frow Memo (JWT)
const getCookies = async (username: string, studioEndPoint: string, jwt: string) => {
  try {
    let response = await client.get(
      `${studioEndPoint}/mobile/login?username=${username}&access_token=${jwt}`,
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return response.headers["set-cookie"];
  } catch (err) {
    console.log(err);
    throw err;
  }
}

const startUpload = (fileName: string, tusEndPoint: string | undefined, file: any) => {
  return new Promise(function (resolve, reject) {
    var upload = new tus.Upload(file, {
      endpoint: tusEndPoint,
      metadata: {
        filename: fileName
      },
      onError: function (error: string) {
        console.log("Failed because: " + error);
        return reject(error);
      },
      onProgress: function (bytesUploaded: number, bytesTotal: number) {
        var percentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
        console.log(bytesUploaded, bytesTotal, percentage + "%");
      },
      onSuccess: function () {
        return resolve(upload.url);
      }
    });
    upload.start();
  });
}

const updateVideoInfo = async (
  studioEndPoint: string,
  oFilename: string,
  videoUrl: any,
  thumbnailUrl: any,
  username: string
) => {
  try {
    const { data } = await client.post(
      `${studioEndPoint}/mobile/api/upload_info`,
      {
        filename: videoUrl,
        oFilename: oFilename,
        size: 2221284, // NOTE: please change this constant value. This is POC app. It has to be in bytes.
        duration: 44, // NOTE: please change this constant value. This is POC app. it has to be in seconds.
        thumbnail: thumbnailUrl,
        owner: username,
        isReel: true // if video is a reel/short (Three Shorts) send this as true
      },
      {
        withCredentials: true,
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const updateVideoMetadata = async(
  studioEndPoint: string,
  videoID: any,
  title: string,
  description: string,
  isNsfwContent: boolean,
  tags: string
) => {
  try {
    const info = {
      videoId: videoID,
      title: title,
      description: description,
      isNsfwContent: isNsfwContent,
      tags: tags
    };
    const { data } = await client.post(`${studioEndPoint}/mobile/api/update_info`, info, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return data;
  } catch (e) {
    console.error(e);
    throw e;
  }
}

const getAllVideoStatuses = async (studioEndPoint: string) => {
  try {
    let response = await client.get(`${studioEndPoint}/mobile/api/my-videos`, {
      withCredentials: true,
      headers: {
        "Content-Type": "application/json"
      }
    });
    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
}


// Main Function that calls every other one in the file
export const uploadToThreeSpeak = async (username: string | any, file: string, thumbnail: string) => {
  const studioEndPoint = "https://studio.3speak.tv";
  const tusEndPoint = "https://uploads.3speak.tv/files/";
  const postingKey = "";

  // Step 1. Get JWT Encrypted Memo
  const memo = await getMemo(username, studioEndPoint);
  // Decoded Memo using dhive Memo.decode class
  let decrypted = hive.Memo.decode(postingKey, memo);
  decrypted = decrypted.replace("#", "");
  console.log(`Decrypted ${decrypted}\n\n`);

  // Step 2. Get Cookie using decrypted JWT
  const cookies = await getCookies(username, studioEndPoint, decrypted);
  // we are logging the cookies here just to make sure that we got those.
  console.log(`Cookies are ${cookies}\n\n`);

  // Step 3. Upload video
  const videoUpload: any = await startUpload("test-demo-video.mp4", tusEndPoint, file);
  const videoUploadFileUrl = videoUpload.replace(`${tusEndPoint}`, "");
  console.log(`Video File Url ${videoUploadFileUrl}\n\n`);

  // Step 4. Upload Thumb
  const thumbUpload: any = await startUpload("test-demo-video.mp4", tusEndPoint, thumbnail);
  const thumbUploadFileUrl: string = thumbUpload.replace(`${tusEndPoint}`, "");
  console.log(`Thumb File ID ${thumbUploadFileUrl}\n\n`);

  // Step 5. Update Video upload information
  const data = await updateVideoInfo(
    studioEndPoint,
    "test-demo-video.mp4",
    videoUploadFileUrl,
    thumbUploadFileUrl,
    username
  );
  console.log(`Video upload response: ${JSON.stringify(data)}`);

  // Step 6. Get all Videos data
  const myAllVideosWithStatusInfo = await getAllVideoStatuses(studioEndPoint);
  console.log(`All Videos Info response: ${JSON.stringify(myAllVideosWithStatusInfo)}`);

  const videoID = myAllVideosWithStatusInfo[0]._id;
  console.log(videoID);

  // Step 7. Update MetaData of a specific video
  const updatedVideoMetadata = await updateVideoMetadata(
    studioEndPoint,
    videoID,
    "ActiFit & Ecency integrating #3Speak videos", // video title
    "Lots of love for #Hive ♦️ and  #3Speak ▶️", // video description - post content
    false, // is NSFW
    "threespeak,mobile,ios,test" // comma separated tags - no spaces
  );
        console.log("uploading...")
  console.log(`Video Info response: ${JSON.stringify(updatedVideoMetadata)}`);
}

export default uploadToThreeSpeak;