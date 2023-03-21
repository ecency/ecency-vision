import React, { useState } from 'react'
import { videoSvg } from '../../img/svg'
import "./index.scss";

export const VideoUpload = () => {

    const [selectedFile, setSelectedFile]: any = useState("");
   
  const onVideoUpload = () => {
    console.log(selectedFile);
  };
    
  return (
    <div className="mt-2 cursor-pointer new-feature" onClick={onVideoUpload}>
        <div className="d-flex justify-content-center bg-red">{ videoSvg }</div>
    </div>
  )
}
