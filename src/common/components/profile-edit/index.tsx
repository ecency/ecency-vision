import React, {Component} from "react";

import {Form, FormControl, InputGroup, Modal, Button} from "react-bootstrap";

import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";

import {error, success} from "../feedback";

import {_t} from "../../i18n";

import {uploadImage} from "../../api/ecency";
import {updateProfile} from "../../api/operations";
import {getAccount} from "../../api/hive";

import {getAccessToken} from "../../helper/user-token";

import {uploadSvg} from "../../img/svg";

interface UploadButtonProps {
    activeUser: ActiveUser;
    onBegin: () => void;
    onEnd: (url: string) => void;
}

interface UploadButtonState {
    inProgress: boolean;
}

class UploadButton extends Component<UploadButtonProps, UploadButtonState> {

    _mounted: boolean = true;
    input = React.createRef<HTMLInputElement>();

    state: UploadButtonState = {
        inProgress: false
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    upload = () => {
        if (this.input.current) this.input.current.click();
    };

    handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = [...e.target.files];

        if (files.length === 0) {
            return;
        }

        const [file] = files;

        const {onBegin, onEnd, activeUser} = this.props;

        onBegin();

        this.stateSet({inProgress: true});

        uploadImage(file, getAccessToken(activeUser.username)).then(r => {
            onEnd(r.url);
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    };

    render() {
        const {inProgress} = this.state;

        return (
            <>
                <Button size="sm"
                        disabled={inProgress}
                        onClick={() => {
                            this.upload();
                        }}>
                    {uploadSvg}
                    <input
                        type="file"
                        ref={this.input}
                        accept="image/*"
                        style={{display: 'none'}}
                        onChange={this.handleFileInput}
                    />
                </Button>
            </>
        );
    }
}

interface Props {
    activeUser: ActiveUser;
    addAccount: (data: Account) => void;
    updateActiveUser: (data?: Account) => void;
    onHide: () => void;
}

interface State {
    name: string,
    about: string,
    website: string,
    location: string,
    coverImage: string,
    profileImage: string,
    inProgress: boolean,
}

const pureState = (props: Props): State => {
    const profile = props.activeUser?.data?.profile!;

    return {
        inProgress: false,
        name: profile.name!,
        about: profile.about!,
        website: profile.website!,
        location: profile.location!,
        coverImage: profile.cover_image!,
        profileImage: profile.profile_image!,
    }
}

export class ProfileEdit extends Component<Props, State> {
    state: State = pureState(this.props);

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    valueChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const id = e.target.getAttribute('data-var') as string;
        const {value} = e.target;

        this.stateSet({[id]: value});
    };

    update = () => {
        const {activeUser, addAccount, updateActiveUser, onHide} = this.props;

        const {
            name,
            about,
            location,
            website,
            coverImage,
            profileImage
        } = this.state;

        const newProfile = {
            name,
            about,
            cover_image: coverImage,
            profile_image: profileImage,
            website,
            location
        };

        this.stateSet({inProgress: true});
        updateProfile(activeUser.data, newProfile).then(r => {
            success(_t('profile-edit.success'));
            return getAccount(activeUser.username);
        }).then((account) => {
            // update reducers
            addAccount(account);
            updateActiveUser(account);

            // hide dialog
            onHide();
        }).catch(() => {
            error(_t('g.server-error'));
        }).finally(() => {
            this.stateSet({inProgress: false});
        });
    }

    render() {
        const {
            name,
            about,
            website,
            location,
            coverImage,
            profileImage,
            inProgress
        } = this.state;

        return <div className="profile-edit-dialog-content">
            <Form.Group>
                <Form.Label>{_t('profile-edit.name')}</Form.Label>
                <Form.Control type="text" disabled={inProgress} value={name} maxLength={30} data-var="name" onChange={this.valueChanged}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>{_t('profile-edit.about')}</Form.Label>
                <Form.Control type="text" disabled={inProgress} value={about} maxLength={160} data-var="about" onChange={this.valueChanged}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>{_t('profile-edit.profile-image')}</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control type="text" disabled={inProgress} placeholder="https://" value={profileImage} maxLength={500} data-var="profileImage"
                                  onChange={this.valueChanged}/>
                    <InputGroup.Append>
                        <UploadButton {...this.props}
                                      onBegin={() => {
                                          this.stateSet({inProgress: true});
                                      }}
                                      onEnd={(url) => {
                                          this.stateSet({profileImage: url, inProgress: false});
                                      }}/>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                <Form.Label>{_t('profile-edit.cover-image')}</Form.Label>
                <InputGroup className="mb-3">
                    <Form.Control type="text" disabled={inProgress} placeholder="https://" value={coverImage} maxLength={500} data-var="coverImage" onChange={this.valueChanged}/>
                    <InputGroup.Append>
                        <UploadButton {...this.props}
                                      onBegin={() => {
                                          this.stateSet({inProgress: true});
                                      }}
                                      onEnd={(url) => {
                                          this.stateSet({coverImage: url, inProgress: false});
                                      }}/>
                    </InputGroup.Append>
                </InputGroup>
            </Form.Group>
            <Form.Group>
                <Form.Label>{_t('profile-edit.website')}</Form.Label>
                <Form.Control type="text" disabled={inProgress} placeholder="https://" value={website} maxLength={100} data-var="website" onChange={this.valueChanged}/>
            </Form.Group>
            <Form.Group>
                <Form.Label>{_t('profile-edit.location')}</Form.Label>
                <Form.Control type="text" disabled={inProgress} value={location} maxLength={30} data-var="location" onChange={this.valueChanged}/>
            </Form.Group>
            <Button onClick={this.update} disabled={inProgress}>{_t('g.update')}</Button>
        </div>
    }
}

export default class ProfileEditDialog extends Component<Props> {
    render() {
        const {onHide} = this.props;
        return (
            <Modal animation={false} show={true} centered={true} onHide={onHide} keyboard={false} className="profile-edit-dialog modal-thin-header">
                <Modal.Header closeButton={true}/>
                <Modal.Body>
                    <ProfileEdit {...this.props} />
                </Modal.Body>
            </Modal>
        );
    }
}
