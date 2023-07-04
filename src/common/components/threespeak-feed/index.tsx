import React, { useEffect, useState } from "react"
import axios from "axios"
import { Memo } from "@hiveio/dhive"
import { getPostingKey } from "../../helper/user-token"
import "./index.scss"

const ThreeSpeakFeed = () => {

    const token = "";
    const studioEndPoint = "https://studio.3speak.tv";
    const client = axios.create({});


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
            return response.data;
          } catch (err) {
            console.log(err);
            throw err;
          }
    }

  return (
    <div className="threespeak-feed">
        <div className="threespeak-wrapper">
            <div className="wrapper-top">
                <div className="video-frame"> 
                <iframe
                    src="https://3speak.tv/embed?v=codetester/epnjigfoac"
                    allowFullScreen
                ></iframe>
                </div>
            </div>
            <div className="wrapper-bottom">
                <div className="speak-video-title">
                    <span>This is the Video Title</span>
                </div>
                <div className="image-title"> 
                    <div className="speak-video-owner">
                        <img 
                        src="data:image/jpeg;base64,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" 
                        alt="" 
                        />
                        <span className="">@username</span>
                    </div>
                    <span className="">Like</span>          
                    <span className="">Unlike</span>          
                    <span className="">$20</span>          
                </div>
            </div>
        </div>
        <div className="threespeak-wrapper">
            <div className="wrapper-top">
                <div className="video-frame"> 
                <iframe
                    src="https://3speak.tv/embed?v=codetester/epnjigfoac"
                    allowFullScreen
                ></iframe>
                </div>
            </div>
            <div className="wrapper-bottom">
                <div className="speak-video-title">
                    <span>This is the Video Title</span>
                </div>
                <div className="image-title"> 
                    <div className="speak-video-owner">
                        <img 
                        src="data:image/jpeg;base64,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" 
                        alt="" 
                        />
                        <span className="">@username</span>
                    </div>
                    <span className="">Like</span>          
                    <span className="">Unlike</span>          
                    <span className="">$20</span>          
                </div>
            </div>
        </div>
        <div className="threespeak-wrapper">
            <div className="wrapper-top">
                <div className="video-frame"> 
                <iframe
                    src="https://3speak.tv/embed?v=codetester/epnjigfoac"
                    allowFullScreen
                ></iframe>
                </div>
            </div>
            <div className="wrapper-bottom">
                <div className="speak-video-title">
                    <span>This is the Video Title</span>
                </div>
                <div className="image-title"> 
                    <div className="speak-video-owner">
                        <img 
                        src="data:image/jpeg;base64,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" 
                        alt="" 
                        />
                        <span className="">@username</span>
                    </div>
                    <span className="">Like</span>          
                    <span className="">Unlike</span>          
                    <span className="">$20</span>          
                </div>
            </div>
        </div>
        <div className="threespeak-wrapper">
            <div className="wrapper-top">
                <div className="video-frame"> 
                <iframe
                    src="https://3speak.tv/embed?v=codetester/epnjigfoac"
                    allowFullScreen
                ></iframe>
                </div>
            </div>
            <div className="wrapper-bottom">
                <div className="speak-video-title">
                    <span>This is the Video Title</span>
                </div>
                <div className="image-title"> 
                    <div className="speak-video-owner">
                        <img 
                        src="data:image/jpeg;base64,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" 
                        alt="" 
                        />
                        <span className="">@username</span>
                    </div>
                    <span className="">Like</span>          
                    <span className="">Unlike</span>          
                    <span className="">$20</span>          
                </div>
            </div>
        </div>
    </div>
  )
}

export default ThreeSpeakFeed;