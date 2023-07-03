import React, { useState } from 'react'
import { Button, Modal } from 'react-bootstrap';
import { _t } from '../../i18n';
import "./index.scss"

export const ConfirmNsfwContent = (props: any) => {

    const { showConfirmNsfw, hideConfirmNsfwModal, togleNsfwC, isNsfw } = props;

    const confirmNsfw = (
        <div className="confirm-nsfw">
          <div className="nsfw-check-wrapper" onClick={()=> togleNsfwC() }>        
            <input className="nsfw-checkbox" type="checkbox"/>
            <label className="text-danger ml-3 align-middle">{_t("nsfw-content.warning")}</label>
          </div>
          <Button className="w-50 align-self-center"
          onClick={() => hideConfirmNsfwModal()}
          >{_t("nsfw-content.continue")}</Button>
        </div>
      )
  return (
    <div>
      <Modal
        show={showConfirmNsfw}
        centered={true}
        onHide={() => hideConfirmNsfwModal()}
        size="lg"
        className="gallery-modal"
      >
        <Modal.Header closeButton={true}>
          <Modal.Title>{_t("nsfw-content.title")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {confirmNsfw}
        </Modal.Body>
      </Modal>
    </div>
  )
}
