import React, {Component} from "react";

import {Modal, Button} from "react-bootstrap";

import {_t} from "../../i18n";

interface Props {
    titleText?: string;
    okText?: string;
    okVariant?: "primary" | "danger";
    cancelText?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

export default class ModalConfirm extends Component<Props> {
    confirm = () => {
        const {onConfirm} = this.props;
        if (onConfirm) {
            onConfirm();
        }
    };

    cancel = () => {
        const {onCancel} = this.props;
        if (onCancel) {
            onCancel();
        }
    };

    render() {
        const {titleText, okText, okVariant, cancelText} = this.props;

        return <Modal animation={false} show={true} centered={true} onHide={this.cancel}>
            <Modal.Header closeButton={true}>
                <Modal.Title>{titleText || _t("confirm.title")}</Modal.Title>
            </Modal.Header>
            <Modal.Footer>
                <Button variant="secondary" onClick={this.cancel}> {cancelText || _t("confirm.cancel")}</Button>
                <Button variant={okVariant || "primary"} onClick={this.confirm}>  {okText || _t("confirm.ok")}</Button>
            </Modal.Footer>
        </Modal>;
    }
}
