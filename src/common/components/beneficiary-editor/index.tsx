import React, {Component} from "react";

import {Button, Modal, Form, InputGroup, FormControl} from "react-bootstrap";

import {error} from "../feedback";

import {BeneficiaryRoute} from "../../api/operations";

import {getAccount} from "../../api/hive";

import {_t} from "../../i18n";

import {plusSvg, deleteForeverSvg} from "../../img/svg";

interface Props {
    author?: string;
    list: BeneficiaryRoute[];
    onAdd: (item: BeneficiaryRoute) => void;
    onDelete: (username: string) => void;
}

interface DialogBodyState {
    username: string,
    percentage: string,
    inProgress: boolean
}

export class DialogBody extends Component<Props, DialogBodyState> {
    state: DialogBodyState = {
        username: "",
        percentage: "",
        inProgress: false
    }

    form = React.createRef<HTMLFormElement>();
    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    usernameChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const username = e.target.value.trim().toLowerCase();
        this.stateSet({username});
    }

    percentageChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        this.stateSet({percentage: e.target.value});
    }

    render() {
        const {list, author} = this.props;
        const {username, percentage, inProgress} = this.state;

        const used = list.reduce((a, b) => a + b.weight / 100, 0);
        const available = 100 - used;

        return <Form ref={this.form} onSubmit={(e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();

            if (!this.form.current?.checkValidity()) {
                return;
            }

            const {onAdd, list} = this.props;
            const {username, percentage} = this.state;

            if (list.find(x => x.account === username) !== undefined) {
                error(_t("beneficiary-editor.user-exists-error", {n: username}));
                return;
            }

            this.stateSet({inProgress: true});
            getAccount(username).then((r) => {
                if (!r) {
                    error(_t("beneficiary-editor.user-error", {n: username}));
                    return;
                }

                onAdd({
                    account: username,
                    weight: Number(percentage) * 100
                });

                this.stateSet({username: "", percentage: ""});
            }).finally(() => this.stateSet({inProgress: false}));
        }}>
            <div className="beneficiary-list">
                <table className="table table-bordered">
                    <thead>
                    <tr>
                        <th>{_t("beneficiary-editor.username")}</th>
                        <th>{_t("beneficiary-editor.reward")}</th>
                        <th/>
                    </tr>
                    </thead>
                    <tbody>
                    {(author && available > 0) && (
                        <tr>
                            <td>{`@${author}`}</td>
                            <td>{`${available}%`}</td>
                            <td/>
                        </tr>
                    )}
                    <tr>
                        <td>
                            <InputGroup size="sm">
                                <InputGroup.Prepend>
                                    <InputGroup.Text>@</InputGroup.Text>
                                </InputGroup.Prepend>
                                <Form.Control disabled={inProgress} autoFocus={true} required={true} minLength={3} maxLength={20} value={username}
                                              onChange={this.usernameChanged}/>
                            </InputGroup>
                        </td>
                        <td>
                            <InputGroup size="sm">
                                <Form.Control disabled={inProgress} required={true} type="number" size="sm" min={1} max={available} step={1}
                                              value={percentage} onChange={this.percentageChanged}/>
                                <InputGroup.Append>
                                    <InputGroup.Text>%</InputGroup.Text>
                                </InputGroup.Append>
                            </InputGroup>
                        </td>
                        <td><Button disabled={inProgress || available < 1} size="sm" type="submit">{plusSvg}</Button></td>
                    </tr>
                    {list.map(x => {
                        return <tr key={x.account}>
                            <td>{`@${x.account}`}</td>
                            <td>{`${x.weight / 100}%`}</td>
                            <td><Button onClick={() => {
                                const {onDelete} = this.props;
                                onDelete(x.account);
                            }} variant="danger" size="sm">{deleteForeverSvg}</Button></td>
                        </tr>
                    })}
                    </tbody>
                </table>
            </div>
        </Form>;
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
        const {list} = this.props;
        const {visible} = this.state;

        const btnLabel = list.length > 0 ? _t("beneficiary-editor.btn-label-n", {n: list.length}) : _t("beneficiary-editor.btn-label");

        return <>
            <Button size="sm" onClick={this.toggle}>{btnLabel}</Button>

            {visible && (
                <Modal onHide={this.toggle} show={true} centered={true} animation={false} className="beneficiary-editor-dialog">
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{_t("beneficiary-editor.title")}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <DialogBody {...this.props} />
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="primary" onClick={this.toggle}>{_t("g.done")}</Button>
                    </Modal.Footer>
                </Modal>
            )}
        </>;
    }
}
