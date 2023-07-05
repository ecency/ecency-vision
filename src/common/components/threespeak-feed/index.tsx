import React, { useEffect, useState } from "react"
import axios from "axios"
import "./index.scss"

const ThreeSpeakFeed = () => {

    const token = "usertoken";
    const studioEndPoint = "https://studio.3speak.tv";
    const client = axios.create({});

    const [videoFeed, setVideoFeed] = useState([]);


    useEffect(()=> {
        getVideoFeed(token)
    }, [])
    

    const getVideoFeed = async (accessToken: string) => {

        try {
            let response = await client.get(`${studioEndPoint}/mobile/api/my-feed`, {
              withCredentials: false,
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`
              }
            });
            console.log(response.data)
            setVideoFeed( response.data)
            return response.data;
          } catch (err) {
            console.log(err);
            throw err;
          }
    };

    // This should be moved o svg file
    const unlikeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-down" viewBox="0 0 16 16">
            <path d="M8.864 15.674c-.956.24-1.843-.484-1.908-1.42-.072-1.05-.23-2.015-.428-2.59-.125-.36-.479-1.012-1.04-1.638-.557-.624-1.282-1.179-2.131-1.41C2.685 8.432 2 7.85 2 7V3c0-.845.682-1.464 1.448-1.546 1.07-.113 1.564-.415 2.068-.723l.048-.029c.272-.166.578-.349.97-.484C6.931.08 7.395 0 8 0h3.5c.937 0 1.599.478 1.934 1.064.164.287.254.607.254.913 0 .152-.023.312-.077.464.201.262.38.577.488.9.11.33.172.762.004 1.15.069.13.12.268.159.403.077.27.113.567.113.856 0 .289-.036.586-.113.856-.035.12-.08.244-.138.363.394.571.418 1.2.234 1.733-.206.592-.682 1.1-1.2 1.272-.847.283-1.803.276-2.516.211a9.877 9.877 0 0 1-.443-.05 9.364 9.364 0 0 1-.062 4.51c-.138.508-.55.848-1.012.964l-.261.065zM11.5 1H8c-.51 0-.863.068-1.14.163-.281.097-.506.229-.776.393l-.04.025c-.555.338-1.198.73-2.49.868-.333.035-.554.29-.554.55V7c0 .255.226.543.62.65 1.095.3 1.977.997 2.614 1.709.635.71 1.064 1.475 1.238 1.977.243.7.407 1.768.482 2.85.025.362.36.595.667.518l.262-.065c.16-.04.258-.144.288-.255a8.34 8.34 0 0 0-.145-4.726.5.5 0 0 1 .595-.643h.003l.014.004.058.013a8.912 8.912 0 0 0 1.036.157c.663.06 1.457.054 2.11-.163.175-.059.45-.301.57-.651.107-.308.087-.67-.266-1.021L12.793 7l.353-.354c.043-.042.105-.14.154-.315.048-.167.075-.37.075-.581 0-.211-.027-.414-.075-.581-.05-.174-.111-.273-.154-.315l-.353-.354.353-.354c.047-.047.109-.176.005-.488a2.224 2.224 0 0 0-.505-.804l-.353-.354.353-.354c.006-.005.041-.05.041-.17a.866.866 0 0 0-.121-.415C12.4 1.272 12.063 1 11.5 1z"/>
        </svg>
    )
    const likeIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-hand-thumbs-up" viewBox="0 0 16 16">
            <path d="M8.864.046C7.908-.193 7.02.53 6.956 1.466c-.072 1.051-.23 2.016-.428 2.59-.125.36-.479 1.013-1.04 1.639-.557.623-1.282 1.178-2.131 1.41C2.685 7.288 2 7.87 2 8.72v4.001c0 .845.682 1.464 1.448 1.545 1.07.114 1.564.415 2.068.723l.048.03c.272.165.578.348.97.484.397.136.861.217 1.466.217h3.5c.937 0 1.599-.477 1.934-1.064a1.86 1.86 0 0 0 .254-.912c0-.152-.023-.312-.077-.464.201-.263.38-.578.488-.901.11-.33.172-.762.004-1.149.069-.13.12-.269.159-.403.077-.27.113-.568.113-.857 0-.288-.036-.585-.113-.856a2.144 2.144 0 0 0-.138-.362 1.9 1.9 0 0 0 .234-1.734c-.206-.592-.682-1.1-1.2-1.272-.847-.282-1.803-.276-2.516-.211a9.84 9.84 0 0 0-.443.05 9.365 9.365 0 0 0-.062-4.509A1.38 1.38 0 0 0 9.125.111L8.864.046zM11.5 14.721H8c-.51 0-.863-.069-1.14-.164-.281-.097-.506-.228-.776-.393l-.04-.024c-.555-.339-1.198-.731-2.49-.868-.333-.036-.554-.29-.554-.55V8.72c0-.254.226-.543.62-.65 1.095-.3 1.977-.996 2.614-1.708.635-.71 1.064-1.475 1.238-1.978.243-.7.407-1.768.482-2.85.025-.362.36-.594.667-.518l.262.066c.16.04.258.143.288.255a8.34 8.34 0 0 1-.145 4.725.5.5 0 0 0 .595.644l.003-.001.014-.003.058-.014a8.908 8.908 0 0 1 1.036-.157c.663-.06 1.457-.054 2.11.164.175.058.45.3.57.65.107.308.087.67-.266 1.022l-.353.353.353.354c.043.043.105.141.154.315.048.167.075.37.075.581 0 .212-.027.414-.075.582-.05.174-.111.272-.154.315l-.353.353.353.354c.047.047.109.177.005.488a2.224 2.224 0 0 1-.505.805l-.353.353.353.354c.006.005.041.05.041.17a.866.866 0 0 1-.121.416c-.165.288-.503.56-1.066.56z"/>
        </svg>
    )

  return (
    <div className="threespeak-feed">
        {videoFeed?.map((video: any)=> {
            return(
                <div className="threespeak-wrapper" key={video._id}>
                    <div className="wrapper-top">
                        <div className="video-frame"> 
                        <iframe
                            src={`https://3speak.tv/embed?v=${video.owner}/${video.permlink}`}
                            allowFullScreen
                        ></iframe>
                        </div>
                    </div>
                    <div className="wrapper-bottom">
                        <div className="speak-video-title">
                            <span className="feed-title">{video.title.substring(0,15)}...</span>
                            <span className="views">Views: {video.views}</span>
                        </div>
                        <div className="image-title"> 
                            <div className="speak-video-owner">
                                <img 
                                // Should be replaced with active user's avatar
                                src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEABQODxIPDRQSEBIXFRQYHjIhHhwcHj0sLiQySUBMS0dARkVQWnNiUFVtVkVGZIhlbXd7gYKBTmCNl4x9lnN+gXwBFRcXHhoeOyEhO3xTRlN8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fP/AABEIAIIAggMBEQACEQEDEQH/xAAaAAACAwEBAAAAAAAAAAAAAAAAAgEDBAUG/8QAOxAAAQMCAwQGBggHAAAAAAAAAQACAwQREiExBUFRYRMiUnGR0RQzQnKBoSMyU2KSscHhBhU0Q4Ky8P/EABoBAAMBAQEBAAAAAAAAAAAAAAABAwIEBQb/xAArEQEAAgIABQIFBQEBAAAAAAAAAQIDEQQSEyExQVEUIjJhcRUjUoGRMwX/2gAMAwEAAhEDEQA/APLWVEwgJQAgCyYFkECgISMzczbwTgpGBwOEixRobhHRm5vkjQ2SyRoSMIAQABdAPhT0ztKAEGEAJksa0FpvruWogplIjPBPRbIWrMmA0W1RobLpokYxG97o2NGviNyc0y8Ec0jclo9o70jBw2yvdA7lSNICZGugkoATNKAEEsANwFplsp6hkMUjHxhxcLXPsqsTEQnMTLLIQTkpy3CpZaRZI0YTvQNpuLILSHOJyujZxBEjCADqgBACAsTIIDpRU0BiYTFcloJOJ3DvXNbJaJ09jDwmK+Otp9TejQD+0PxO80urZX4HD7G6CG9+jz5Od5p9W5fAYfZHo8JNzEL+87zR1bj4HD7D0aD7Ifid5pdWx/A4fYroKZozjA/yd5rdLZL+EsnD8Nijdj0lLT1c4iwFgtfE1xv87rpjHaO9peXnviiP26ul/JKL2mPd3vI/JPW3H1JQ7YVCdI3t7pD+qOWB1bM038OxkEw1D2ncHgEfJLlajL7w5NXsqrpAXPjxM7bMx5hZmJhWt628MYz0WWjk9XCfFaL12RZaCAustMosgOtD6mP3B+S47/VL6Ph/+NfwZZWCAEAsj8A5nRVxY+pP2c3E54w1+8spJJucyvSiIrGoeFa03ndp7t2x/wCuHulFvCOX6XeUnKEAIAQbi7W2TF0b6mnDY3NF3N0a7yKzMeq1LzPaXnXG5WF4PGwyuDQQDxKcdymdd0YR/wAUaC2yZIsgNLaxzWtbgGQA1UZxRM7ehj461KxWI8J9Od9mPFLox7t/qN/4wj0532Y8UdGPcfqN/wCK+nlfMC4sDWceKnekV9XVw/EZM0/TqCTG8h5ZLuwV5aQ87jL82aft2IruVua4bJiFRM3FPICI472sN5Kje/olPz9o8Mz9vVbndXAwcA3zU+YdOEs25Vj2mP8Aeb5J7Lpw3023I3nDUx9Ee03rDzCe2Jx+zqse2Rocxwc05gg5FNOY087tjaTal5gideFpzIP1z5LMztelOXu45IusLLIReRoG8pwzbw0lrASMJNuAW+ye5V2WVBhQRXBBosgLaeAyuu4dQa8+Sne/LDq4fh5zW+zo7gALAZADcuSZ35e9WsVjVfDLJ6x3evVxT8kPn+IjWW35dfZuz+jtNOOvq1vDmeaLW9HDe++0Kdv0U1QI5oWl/RghzRr3hStB4rRHaXniLEg5Eag6hYXANkyNiJRstLGVs8UT4o3lrHizgEbHLHlnHJJpOEkiwRobWRt+kDWi55LUeWJ8bL0juHyS3LWmzCFtguFA2UhIxEAZmAi4LgClM6jbdK81oj3dEANAAFgNAuGZme8vpq0rSOWvgJNBj2wTCYxCS24nTmuzh77jkl5H/ocPNv3K/wBujBtWCU2feJx7Wniuiay8Wccw3rKaqanhnFpomSe80FGoOLTHhhm2FRSXLQ+Insuy8Cs8sNxlt6sMv8OytuYZ2v4Bww/PNLlb6sT5cyro6ilP08TmjtatPxWZUrMT4Z0mljHYQS02NlqGZjavG4b80ttagdI7iUbGodIhVSQgEcEjLF6+P3x+axbxKuL66/mHRseC4tS+l6lPeP8ARY8Eji0T4lCD/Kp8IObcuS6sfEzHazzs3AxbvjnTZsypkhkEEtzGfqnsnyXRz0t3iXk5+FyU7zV2UOEIIICHNa5pa4BzTqCNUG83tnZQpR6RTC0JPWb2f2U5jTpx35u0uS0XB7koUkqRoQHVVkUFAVvOSUnCspGWw4JHoAlpuCR3GyBE68NdJUOlcWPNyBcFc+WkR3h63BcRe1unadtKg9RO+6A5hqailne2GeRgDiAA7K3douyJ7PmMlIi0xLXBt6rjt0gZMN9xhPiPJa5pSnHWXa2ftOGuu1t2SAXLHcOIW4naNqTVtTTJLE2eJ8Txdr2lp+KJOJ1O3hrFtwdRkVJ2lSMIDruCugQpGqdmbJSax1JIG3Fi7e1R6td6dvweWKc2v6UOaWGzgQeBVHJO4nUkJQF1O10d3nIkWHmnWkW8q0vbHO48tMc1sn+Kxl4ffejv4fjeX5cn+rhnmDdccxMTqXq1tFo3Dkz2NRL7xXXXw+byzu9p+8qymw6WwWPftBrmg4WAlx3aLVUsnaHqFtzgaoJ4WV2OV7+04u8Sou9DmYQCSLEXFimW0XHJAdhwCugocdzVmWmiGLous71n+v7rkyZN9oe1wnB8v7mTz7HUHpjvTidM2rW3mAdMgL7sk4t3+aeyc4aRE8lY3+GR17nFe++69WutdvD5+8Wi083lC0y00EDp6pjW3DQcTrcFi8RMd4HVtjjdZ06b9i0L3X6ItP3XkKXLDm6tit2HQtsSx7u95/RLlgdWzfFFHCzBExrG8Giy1rSczM+ToJh2vV+iULyD9I8YWd/H4JWnspjruXkSLaiym6gDlYoEiw5oDrSK0owpJIIINiMwVmWonXeF0dS05P6p47ly3w+tXsYOPifly/6u3A7joVCY15enW0WjdZ2EGEAr4w/XXiq48tsfhz5uHpmjv5Vx0znzNixsaXaFzrZLuplraNvEz4pwTqe7v0tKyljwMGZ+s470TO3n2tNpXpMhACAxVu1KaiBD3Y5N0bTn8eCUzpuuObPL1lZLWTmWY8mtGjQp726YrERqFLnE65oPSMu5AWYB209M7dJ2aqmrISMhASNDC5r/AKMuBPDelrflqLTXvE6O6eeMkG3xaFOcVfZ0V4zNEfUT0uUHVp+CXSqp8bn90Oqpne3YfdFk4pWPRK3EZbebKHOLjnmtowsirKinbaGZ7BuAOXglspiJ8tDdtVwFulaeZYEbkunX2N/O621ukb+AJ7Lp1ZZq+rnBEtRIQdQDYfJLctRWI8Qy6aJNISMIAQEIDrkq6CslIyFIy3INwSDySCDe17oBC43Sa0gu6trDvQNFSMpKRoQAgDEQCBvyKC0RJoIAtkmQSNCA6hKsiQlIylIFKDI47kjITmkaLoCCkaEAIAQBZAKQgISNIKCKgwgOkqpEKAgpGVAI7VKTIdUjQkEIMICEAzU4KQgFdqkZUjCACgIQH//Z" 
                                alt="" 
                                />
                                <span className="">@{video.owner}</span>
                            </div>
                            <div className="icon">
                                <span>{likeIcon}</span>
                                <span>20</span>
                            </div>          
                            <div className="icon">
                                <span>{unlikeIcon}</span> 
                                <span>20</span>
                            </div>          
                            <span className="">$20</span>          
                        </div>
                    </div>
                </div>
            )
        })}
    </div>
  )
}

export default ThreeSpeakFeed;