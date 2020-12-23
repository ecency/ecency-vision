import React, {Component} from "react";

import {Button, Modal, Form, InputGroup} from "react-bootstrap";

import {plusCircle} from "../../img/svg";

export interface Beneficiary {
    username: string;
    percentage: string;
}

interface Props {
    list: Beneficiary[];
    onAdd: (item: Beneficiary) => void;
}

interface DialogBodyState {
    username: string,
    percentage: string,
}

export class DialogBody extends Component<Props, DialogBodyState> {
    state: DialogBodyState = {
        username: "",
        percentage: ""
    }

    render() {
        return <div>
            <Form onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();


            }}>
                <table className="table">
                    <thead>
                    <tr>
                        <th>Username</th>
                        <th>Reward</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    <tr>
                        <td>
                            <InputGroup size="sm">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>@</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control required={true}/>
                            </InputGroup>
                        </td>
                        <td>
                            <InputGroup size="sm">
                                <Form.Control required={true} type="number" size="sm" min={1} max={100} step={1}/>
                                <InputGroup.Append>
                                    <InputGroup.Text>%</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>


                        </td>
                        <td><Button size="sm" type="submit">+</Button></td>
                    </tr>
                    </tbody>
                </table>
            </Form>
        </div>;
    }
}

interface State {
    visible: boolean
}

export default class BeneficiaryEditorDialog extends Component<Props, State> {
    state: State = {
        visible: false
    }

    toggle = () => {
        const {visible} = this.state;
        this.setState({visible: !visible});
    }

    render() {
        const {visible} = this.state;
        return <div>
            <Button size="sm" onClick={this.toggle}>Set Beneficiaries</Button>

            {visible && (
                <Modal onHide={this.toggle} show={true} centered={true} animation={false}>
                    <Modal.Header closeButton={true}>
                        <Modal.Title> Beneficiaries</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DialogBody {...this.props} />
                    </Modal.Body>
                </Modal>
            )}
        </div>;
    }
}
