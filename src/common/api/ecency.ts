import axios from 'axios';

import config from '../../config';

export const uploadImage = async (file: File, token: string): Promise<{
    url: string
}> => {
    const fData = new FormData();
    fData.append('file', file);

    const postUrl = `${config.imageServer}/hs/${token}`;

    return axios.post(postUrl, fData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    }).then(r => r.data);
};
