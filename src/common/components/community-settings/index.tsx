import React, {Component} from "react";

import {Modal, Form, Row, Col, InputGroup, FormControl, Button} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Community} from "../../store/communities/types";
import {ActiveUser} from "../../store/active-user/types";

import {clone} from "../../store/helper";

import LinearProgress from "../linear-progress";
import {error} from "../feedback";

import {
    updateCommunity,
    formatError
} from "../../api/operations";

import {_t} from "../../i18n";

const langOpts = [
    {id: "en", name: "English"},
    {id: "kr", name: "Korean"},
    {id: "zh", name: "Chinese"},
    {id: "ms", name: "Malay"},
    {id: "pl", name: "Polish"},
    {id: "pt", name: "Portuguese"},
    {id: "ru", name: "Russian"},
    {id: "it", name: "Italian"},
    {id: "de", name: "German"},
    {id: "es", name: "Spanish"},
    {id: "sv", name: "Swedish"},
];

interface Props {
    global: Global;
    community: Community;
    activeUser: ActiveUser;
    addCommunity: (data: Community) => void;
    onHide: () => void;
}

interface State {
    title: string;
    about: string;
    lang: string;
    description: string;
    flag_text: string;
    is_nsfw: boolean;
    inProgress: boolean;
}

const pureState = (props: Props): State => {
    const {community: c} = props;

    return {
        title: c.title,
        about: c.about,
        lang: c.lang,
        description: c.description,
        flag_text: c.flag_text,
        is_nsfw: c.is_nsfw,
        inProgress: false
    }
}

export class CommunitySettings extends Component<Props, State> {
    state: State = pureState(this.props);

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

    onChange = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {target: el} = e;
        const key = el.name;
        const val = el.hasOwnProperty("checked") ? el.checked : el.value;

        this.stateSet({[key]: val});
    }

    submit = () => {
        const {activeUser, community, addCommunity, onHide} = this.props;
        const {title, about, description, lang, flag_text, is_nsfw} = this.state;
        const newProps = {title, about, description, lang, flag_text, is_nsfw};

        this.stateSet({inProgress: true});
        return updateCommunity(activeUser.username, community.name, newProps)
            .then(() => {
                const nCom: Community = {...clone(community), ...newProps};
                addCommunity(nCom);
                onHide();
            })
            .catch(err => error(formatError(err)))
            .finally(() => this.stateSet({inProgress: false}));
    }

    render() {
        const {title, about, lang, description, flag_text, is_nsfw, inProgress} = this.state;

        return <div className="community-settings-dialog-content">
            {inProgress && <LinearProgress/>}

            <Form ref={this.form} className={`settings-form ${inProgress ? "in-progress" : ""}`} onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!this.form.current?.checkValidity()) {
                    return;
                }

                this.submit().then();
            }}>
                <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">{_t('community-settings.title')}</Form.Label>
                    <Col sm="10">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                autoComplete="off"
                                value={title}
                                name="title"
                                onChange={this.onChange}
                                required={true}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">{_t('community-settings.about')}</Form.Label>
                    <Col sm="10">
                        <InputGroup>
                            <Form.Control
                                type="text"
                                autoComplete="off"
                                value={about}
                                name="about"
                                onChange={this.onChange}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">{_t('community-settings.lang')}</Form.Label>
                    <Col sm="4">
                        <InputGroup>
                            <Form.Control as={"select"}
                                          value={lang}
                                          name="lang"
                                          onChange={this.onChange}>
                                {langOpts.map((l, k) => <option key={k} value={l.id}>{l.name}</option>)}
                            </Form.Control>
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">{_t('community-settings.description')}</Form.Label>
                    <Col sm="10">
                        <InputGroup>
                            <Form.Control
                                as="textarea"
                                value={description}
                                name="description"
                                onChange={this.onChange}
                            />
                        </InputGroup>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Form.Label column={true} sm="2">{_t('community-settings.rules')}</Form.Label>
                    <Col sm="10">
                        <InputGroup>
                            <Form.Control
                                as="textarea"
                                value={flag_text}
                                name="flag_text"
                                onChange={this.onChange}
                            />
                        </InputGroup>
                        <Form.Text>{_t('community-settings.rules-help')}</Form.Text>
                    </Col>
                </Form.Group>
                <Form.Group as={Row}>
                    <Col sm={{span: 10, offset: 2}}>
                        <Form.Check
                            id="check-nsfw"
                            type="checkbox"
                            label="NSFW"
                            name="is_nsfw"
                            checked={is_nsfw}
                            onChange={this.onChange}
                        />
                    </Col>
                </Form.Group>
                <div className="d-flex justify-content-end">
                    <Button type="submit" disabled={inProgress}>{_t('g.save')}</Button>
                </div>
            </Form>
        </div>
    }
}

export default class CommunitySettingsDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="community-settings-dialog" size="lg">
                <Modal.Header closeButton={true}>
                    <Modal.Title>{_t('community-settings.dialog-title')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <CommunitySettings {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
