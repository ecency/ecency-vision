import React, { FC } from 'react'
import {Button, Form, FormControl, Modal} from "react-bootstrap";

interface Props {
  onHide: () => void;
  onSubmit: any;
}

const UploadBody: FC<Props> = () => {
  return (
    <div>Testing shit out</div>
  )
}

const VideoUpload: FC<Props> = (props) => {
  const { onHide, onSubmit } = props;

  return (
     <Modal show={true} centered={true} onHide={onHide} className="add-image-modal" animation={false}>
        <Modal.Header closeButton={true}>
          <Modal.Title>Upload a video to 3speak</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <UploadBody {...props} />
        </Modal.Body>
      </Modal>
  )
}

export default VideoUpload