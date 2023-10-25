import axios from "axios"

const baUrl = "https://breakaway-points-system-api.onrender.com"

export const createBreakawayUser = async (username: string, community: string)=> {
    try {
        const data = {
            username,
            community
        }
        const resp = await axios.post(`${baUrl}/signup-keychain`, data)
        return resp;
    } catch (err) {
        console.log(err)
        return err;
    }
}