import React from "react";

import { Form, FormControl, InputGroup, Button, Spinner, Col } from "react-bootstrap";

import { ActiveUser } from "../../store/active-user/types";
import { Account, FullAccount } from "../../store/accounts/types";

import BaseComponent from "../base";
import UploadButton from "../image-upload-button";
import { error, success } from "../feedback";

import { _t } from "../../i18n";

import { updateProfile } from "../../api/operations";
import { getAccount } from "../../api/hive";

import TextareaAutocomplete from "../textarea-autocomplete";
import { Global } from "../../store/global/types";

interface Props {
  global: Global;
  activeUser: ActiveUser;
  account: Account;
  addAccount: (data: Account) => void;
  updateActiveUser: (data?: Account) => void;
}

interface State {
  name: string;
  about: string;
  website: string;
  location: string;
  coverImage: string;
  profileImage: string;
  pinned: string;
  inProgress: boolean;
  uploading: boolean;
  changed: boolean;
}

const pureState = (props: Props): State => {
  const profile =
    props.activeUser.data.__loaded && props.activeUser.data.profile
      ? props.activeUser.data.profile
      : {};

  return {
    uploading: false,
    inProgress: false,
    changed: false,
    name: profile.name || "",
    about: profile.about || "",
    website: profile.website || "",
    location: profile.location || "",
    coverImage: profile.cover_image || "",
    profileImage: profile.profile_image || "",
    pinned: profile.pinned || ""
  };
};

export default class ProfileEdit extends BaseComponent<Props, State> {
  state: State = pureState(this.props);

  valueChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const id = e.target.getAttribute("data-var") as string;
    const { value } = e.target;
    // @ts-ignore
    this.stateSet({ [id]: value, changed: true });
  };

  componentDidUpdate(prevProps: Props) {
    let currentAccount = this.props.account as FullAccount;
    let prevAccount = prevProps.account as FullAccount;
    const isSameAccount = prevAccount.name === currentAccount.name;
    const isImageChanged =
      prevAccount!.profile?.profile_image !== currentAccount!.profile?.profile_image;
    if (isSameAccount && isImageChanged && currentAccount.__loaded) {
      let newImage = currentAccount!.profile!.profile_image;
      this.setState({ profileImage: newImage || this.state.profileImage });
      this.props.updateActiveUser(this.props.account);
    }
    return !isSameAccount || isImageChanged;
  }

  update = () => {
    const { activeUser, addAccount, updateActiveUser } = this.props;

    const { name, about, location, website, coverImage, profileImage, pinned } = this.state;

    const newProfile = {
      name,
      about,
      cover_image: coverImage,
      profile_image: profileImage,
      website,
      location,
      pinned
    };

    this.stateSet({ inProgress: true });
    updateProfile(activeUser.data, newProfile)
      .then((r) => {
        success(_t("profile-edit.updated"));
        return getAccount(activeUser.username);
      })
      .then((account) => {
        // update reducers
        addAccount(account);
        updateActiveUser(account);
        this.stateSet({ changed: false });
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ inProgress: false });
      });
  };

  render() {
    const { activeUser } = this.props;
    const {
      name,
      about,
      website,
      location,
      coverImage,
      profileImage,
      inProgress,
      uploading,
      changed
    } = this.state;

    const spinner = (
      <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
    );

    return (
      <div className="profile-edit">
        <div className="profile-edit-header">{_t("profile-edit.title")}</div>
        <Form.Row>
          <Col lg={6} xl={4}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.name")}</Form.Label>
              <Form.Control
                type="text"
                disabled={inProgress}
                value={name}
                maxLength={30}
                data-var="name"
                onChange={this.valueChanged}
              />
            </Form.Group>
          </Col>
          <Col lg={6} xl={12}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.about")}</Form.Label>
              <TextareaAutocomplete
                data-var="about"
                acceptCharset="UTF-8"
                global={this.props.global}
                id="the-editor"
                className="the-editor accepts-emoji form-control"
                as="textarea"
                placeholder={_t("submit.body-placeholder")}
                value={about}
                onChange={this.valueChanged}
                disableRows={true}
                maxrows={100}
                spellCheck={true}
                activeUser={(activeUser && activeUser.username) || ""}
              />
            </Form.Group>
          </Col>
          <Col lg={6} xl={4}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.profile-image")}</Form.Label>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  disabled={inProgress}
                  placeholder="https://"
                  value={profileImage}
                  maxLength={500}
                  data-var="profileImage"
                  onChange={this.valueChanged}
                />
                <InputGroup.Append>
                  <UploadButton
                    {...this.props}
                    onBegin={() => {
                      this.stateSet({ uploading: true });
                    }}
                    onEnd={(url) => {
                      this.stateSet({ profileImage: url, uploading: false, changed: true });
                    }}
                  />
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col lg={6} xl={4}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.cover-image")}</Form.Label>
              <InputGroup className="mb-3">
                <Form.Control
                  type="text"
                  disabled={inProgress}
                  placeholder="https://"
                  value={coverImage}
                  maxLength={500}
                  data-var="coverImage"
                  onChange={this.valueChanged}
                />
                <InputGroup.Append>
                  <UploadButton
                    {...this.props}
                    onBegin={() => {
                      this.stateSet({ uploading: true });
                    }}
                    onEnd={(url) => {
                      this.stateSet({ coverImage: url, uploading: false, changed: true });
                    }}
                  />
                </InputGroup.Append>
              </InputGroup>
            </Form.Group>
          </Col>
          <Col lg={6} xl={4}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.website")}</Form.Label>
              <Form.Control
                type="text"
                disabled={inProgress}
                placeholder="https://"
                value={website}
                maxLength={100}
                data-var="website"
                onChange={this.valueChanged}
              />
            </Form.Group>
          </Col>
          <Col lg={6} xl={4}>
            <Form.Group>
              <Form.Label>{_t("profile-edit.location")}</Form.Label>
              <Form.Control
                type="text"
                disabled={inProgress}
                value={location}
                maxLength={30}
                data-var="location"
                onChange={this.valueChanged}
              />
            </Form.Group>
          </Col>
        </Form.Row>
        {changed && (
          <Button onClick={this.update} disabled={inProgress || uploading}>
            {inProgress && spinner} {_t("g.update")}
          </Button>
        )}
      </div>
    );
  }
}
