import axios from 'axios';

import defaults from "../constants/defaults.json";

export const uploadImage = async (file: File, token: string): Promise<{
    url: string
}> => {
    const fData = new FormData();
    fData.append('file', file);

    const postUrl = `${defaults.imageServer}/hs/${token}`;

    return axios.post(postUrl, fData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(r => r.data);
};
