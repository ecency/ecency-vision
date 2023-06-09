import React, { useState, ChangeEvent, useEffect } from 'react'
import { videoSvg, uploadSvgV } from '../../img/svg'
import { Button, Modal } from "react-bootstrap";
import { _t } from '../../i18n';
import "./index.scss";
import { threespeakAuth, getAllVideoStatuses, uploadVideoInfo, updateInfo } from '../../api/threespeak';
import * as tus from "tus-js-client";

export const VideoUpload = (props: any) => {
  const { 
    insertText,
    accessToken,
    description,
    title,
    tags,
    activeUser,
  } = props;

  const tusEndPoint = "https://uploads.3speak.tv/files/";

    const [showModal, setShowModal] = useState(false)
    const [selectedFile, setSelectedFile] = useState<any>(null);
    const [step, setStep] = useState("upload")
    const [videoId, setVideoId] = useState("")
    const [videoUrl, setVideoUrl] = useState("")
    const [thumbUrl, setThumbUrl] = useState("")
    const [fileName, setFileName] = useState("")
    const [fileSize, setFileSize] = useState(0)
    const [videoPercentage, setVideoPercentage] = useState("")
    const [thumbPercentage, setThumbPercenrage] = useState("")
    const [ isNsfwC, setIsNsfwC] = useState(false)

    useEffect(() =>{
      threespeakAuth(activeUser!.username)
    },[])

    const hideModal = () => { 
      setShowModal(false)
    }

    const onChange: any = (event: { target: { files: any[] } }, type: string) => {
      let file = event.target.files[0];
  
      let upload: any = new tus.Upload(file, {
        // Endpoint is the upload creation URL from your tus server
        endpoint: tusEndPoint,
        // Retry delays will enable tus-js-client to automatically retry on errors
        retryDelays: [0, 3000, 5000, 10000, 20000],
        // Attach additional meta data about the file for the server
        metadata: {
          filename: file.name,
          filetype: file.type
        },
        // Callback for errors which cannot be fixed using retries
        onError: function (error: Error) {
          return console.log( error);
        },
        // Callback for reporting upload progress
        onProgress: function (bytesUploaded: number, bytesTotal: number) {
          let vPercentage;
          let tPercentage;
          if (type === "video") {
            vPercentage  = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            setVideoPercentage(vPercentage)
            // self.setState({bytesUploaded, bytesTotal, percentage})
          } else {
            tPercentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
            setThumbPercenrage(tPercentage)
            // self.setState({bytesUploaded, bytesTotal, thumbPercentage})
          }
        },
        // Callback for once the upload is completed
        onSuccess: function () {
          console.log("File %s", upload.file?.name);
          console.log("URL %s", upload?.url.replace("https://uploads.3speak.tv/files/", ""));
          let file = upload?.url.replace(this.endpoint, "");
          if (type === "video") {
            setVideoUrl(file);
            setFileName(upload.file?.name);
            setFileSize(upload.file?.size);
          } else {
            setThumbUrl(file);
            setFileName(upload.file?.name);
            setFileSize(upload.file?.size);
          }
        }
      });
      upload.start();
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement | any>) => {
      const file: any = e?.target?.files[0];
      onChange(e, "video")
      console.log(file)
      setSelectedFile(URL?.createObjectURL(file));
    };

    const uploadInfo = async ()=> {
      console.log("testing if it works...")
     const data = await uploadVideoInfo(activeUser!.username, videoUrl, thumbUrl, fileName, fileSize)
        setVideoId(data._id)
        setIsNsfwC(data.isNsfwContent)
        console.log(data)
    }

    const checkStat = async () => {
      const token = await threespeakAuth(activeUser!.username)
      await getAllVideoStatuses(token)
      console.log(await getAllVideoStatuses(token))
      console.log(accessToken)
    }    

    const updateSpeakVideo = async () => {
      const token = await threespeakAuth(activeUser!.username)
      console.log(videoId)
      console.log(token, description, videoId, title, tags)
      updateInfo(token, description, videoId, title, tags, isNsfwC)
    }

  const uploadVideoModal = (
      <div className="dialog-content">
        <div className="file-input">
          <label htmlFor="video-input">Choose video {uploadSvgV}</label>
            <input
              type="file"
              accept="video/*"
              id="video-input"
              style={{display: "none"}}
              onChange={handleFileChange}
            />
            <div className="progresss">
              {Number(videoPercentage) > 0 && <>
                <div style={{width: Number(videoPercentage) + "%"}} className="progress-bar"/>
                <span >{`${videoPercentage}%`}</span>
              </>}
            </div>
            {/* <span>{`${fileName}(${bytesUploaded}/${bytesTotal})kb`}</span> */}
        </div>
        <div className="file-input">
        <label htmlFor="image-input">Chose image {uploadSvgV}</label>
            <input
              type="file"
              accept="image/*"
              id="image-input"
              style={{display: "none"}}
              onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, "thumbnail")}
            />
            <div className="progresss">
              {Number(thumbPercentage) > 0 && <>
                <div style={{width: Number(thumbPercentage) + "%"}} className="progress-bar"/>
                <span >{`${thumbPercentage}%`}</span>
              </>}
            </div>
        </div>
          <Button onClick={()=> {
            uploadInfo();
            setStep("update")
          }}>Upload Video</Button>
          
          <Button onClick={() => {
            checkStat()
            }}>Check status</Button>
      </div>
)

const updateVideoModal = (
  <div className="dialog-content">
    <div className="file-input">
      <video controls>
        <source src={selectedFile} type="video/mp4" />
      </video>
    </div>
    <div className="d-flex">
      <Button className="bg-dark" onClick={()=> {
        setStep("upload")
        console.log(description, title, tags)
      }}
      >Back</Button>
        <Button className="ml-5" onClick={() => {
          updateSpeakVideo()
          }}>Update info
        </Button>
    </div>
  </div>
)
    
  return (
    <div className="mt-2 cursor-pointer new-feature">
        <div className="d-flex justify-content-center bg-red" onClick={() => setShowModal(true)}>
          { videoSvg }
        </div>
        <div>
          <Modal
              animation={false}
              show={showModal}
              centered={true}
              onHide={hideModal}
              keyboard={false}
              className="add-image-modal"
              // size="lg"
            >
              <Modal.Header closeButton={true}>
                <Modal.Title>
                  {step === "upload" && <p>Upload Video</p>}
                  {step === "update" && <p>Update Video</p>}
                </Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {step === "upload" && uploadVideoModal}
                {step === "update" && updateVideoModal}
              </Modal.Body>
            </Modal>
        </div>        
    </div>
  )
}
