import React, {Component} from "react";

import {Button, Form, FormControl, Modal} from "react-bootstrap";

import {_t} from "../../i18n";

interface Props {
    onHide: () => void;
    onSubmit: (text: string, link: string) => void;
}

interface State {
    text: string;
    link: string;
}

export class AddImage extends Component<Props, State> {
    state: State = {
        text: "",
        link: ""
    }

    form = React.createRef<HTMLFormElement>();

    textChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({text: e.target.value});
    }

    linkChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.setState({link: e.target.value});
    }

    handleInvalid = (e: any, localID: string) => {
        e.target.setCustomValidity(_t('add-image.' + localID));
    }

    render() {
        const {text, link} = this.state;

        return <div className="dialog-content">
            <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!this.form.current?.checkValidity()) {
                    return;
                }

                const {text, link} = this.state;
                const {onSubmit} = this.props;
                onSubmit(text, link);
            }}>
                <Form.Group>
                    <Form.Control
                        type="text"
                        autoComplete="off"
                        value={text}
                        placeholder={_t("add-image.text-label")}
                        onChange={this.textChanged}
                        autoFocus={true}
                        required={true}
                        onInvalid={(e:any) => this.handleInvalid(e,'validation-text')}
                        onInput={(e:any) => e.target.setCustomValidity("")}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Control
                        type="text"
                        autoComplete="off"
                        value={link}
                        placeholder={_t("add-image.link-label")}
                        onChange={this.linkChanged}
                        required={true}
                        onInvalid={(e:any) => this.handleInvalid(e,'validation-image')}
                        onInput={(e:any) => e.target.setCustomValidity("")}
                    />
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button type="submit">{_t('g.add')}</Button>
                </div>
            </Form>
        </div>
    }
}


export default class AddImageDialog extends Component<Props> {
    hide = () => {
        const {onHide} = this.props;
        onHide();
    }

    render() {
        return (
            <Modal show={true} centered={true} onHide={this.hide} className="add-image-modal" animation={false}>
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('add-image.title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <AddImage {...this.props}/>
                </Modal.Body>
            </Modal>
        );
    }
}
