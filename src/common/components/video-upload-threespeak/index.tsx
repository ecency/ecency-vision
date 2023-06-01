import React, { useState, ChangeEvent } from 'react'
import { videoSvg } from '../../img/svg'
import { Button, Form, Modal } from "react-bootstrap";
import { _t } from '../../i18n';
import "./index.scss";

export const VideoUpload = (props: any) => {
  const { 
    postingKey, 
    onChange, 
    handlePostingKey, 
    videoUrl, 
    handleVideoUrlChange, 
    thumbUrl, 
    handleThumbUrlChange,
    logMe,
    uploadInfo
  } = props;

    const [showModal, setShowModal] = useState(false)

    const hideModal = () => { 
      setShowModal(false)
    }

  const modalBody = (
              <div className="dialog-content">
                <Form>
                  <Form.Group>
                  <label htmlFor="video-input">Choose video</label>
                    <input
                      type="file"
                      accept="video/*"
                      id="video-input"
                      style={{display: "none"}}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, "video")}
                    />
                    <Form.Control
                      // type="text"
                      autoComplete="off"
                      value={videoUrl}
                      placeholder="Add video file"
                      onChange={handleVideoUrlChange}
                      required={true}
                    />
                  </Form.Group>
                  <Form.Group>
                  <label htmlFor="image-input">Chose image</label>
                    <input
                      type="file"
                      accept="image/*"
                      id="image-input"
                      style={{display: "none"}}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e, "thumbnail")}
                    />
                    <Form.Control
                      // type="text"
                      autoComplete="off"
                      value={thumbUrl}
                      placeholder="Add image file"
                      onChange={handleThumbUrlChange}
                      required={true}
                    />
                  </Form.Group>
                  <Form.Group>                  
                    <Form.Control
                      type="password"
                      autoComplete="off"
                      value={postingKey}
                      placeholder="Enter Posting Key"
                      onChange={handlePostingKey}
                      required={true}
                    />
                    <Button onClick={logMe} className="mt-3">Login to 3Speak</Button>
                  </Form.Group>
                  <div className="d-flex justify-content-end">
                    <Button
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        uploadInfo();
                      }}
                    >
                      {_t("g.add")}
                    </Button>
                  </div>
                </Form>
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
                <Modal.Title>Add File</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                {modalBody}
              </Modal.Body>
            </Modal>
        </div>        
    </div>
  )
}
