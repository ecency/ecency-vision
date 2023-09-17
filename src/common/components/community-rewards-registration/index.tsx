import React, { Component } from "react";
import { PrivateKey } from "@hiveio/dhive";
import { Global } from "../../store/global/types";
import { Community } from "../../store/communities";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import { error } from "../feedback";
import KeyOrHot from "../key-or-hot";
import LinearProgress from "../linear-progress";
import {
  communityRewardsRegister,
  communityRewardsRegisterHot,
  communityRewardsRegisterKc,
  formatError
} from "../../api/operations";
import { getRewardedCommunities } from "../../api/private-api";
import { _t } from "../../i18n";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";

interface Props {
  global: Global;
  community: Community;
  activeUser: ActiveUser;
  signingKey: string;
  setSigningKey: (key: string) => void;
  onHide: () => void;
}

interface State {
  loading: boolean;
  inProgress: boolean;
  registered: boolean;
  form: boolean;
  done: boolean;
}

export class CommunityRewardsRegistration extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    inProgress: false,
    registered: false,
    form: false,
    done: false
  };

  componentDidMount() {
    const { community } = this.props;

    getRewardedCommunities()
      .then((r) => {
        const registered = !!r.find((x) => x.name === community.name);
        this.stateSet({ registered });
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  }

  next = () => {
    this.stateSet({ form: true });
  };

  sign = (key: PrivateKey) => {
    const { community } = this.props;

    this.stateSet({ inProgress: true });
    communityRewardsRegister(key, community.name)
      .then((r) => {
        this.stateSet({ done: true });
      })
      .catch((err) => {
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  hotSign = () => {
    const { community } = this.props;
    communityRewardsRegisterHot(community.name);
    this.hide();
  };

  signKs = () => {
    const { community } = this.props;

    this.stateSet({ inProgress: true });
    communityRewardsRegisterKc(community.name)
      .then((r) => {
        this.stateSet({ done: true });
      })
      .catch((err) => {
        error(...formatError(err));
      })
      .finally(() => {
        this.setState({ inProgress: false });
      });
  };

  hide = () => {
    const { onHide } = this.props;
    onHide();
  };

  render() {
    const { community } = this.props;
    const { inProgress, loading, registered, form, done } = this.state;

    if (loading) {
      return <LinearProgress />;
    }

    const btnClose = (
      <Button size="sm" onClick={this.hide}>
        {_t("g.close")}
      </Button>
    );
    const btnNext = (
      <Button size="sm" onClick={this.next}>
        {_t("community-rewards-registration.btn-next-label")}
      </Button>
    );

    if (done) {
      return (
        <div className="dialog-content">
          <p className="text-info">{_t("community-rewards-registration.done-body-text")}</p>
          {btnClose}
        </div>
      );
    }

    if (form) {
      return (
        <div className="dialog-content">
          {KeyOrHot({
            ...this.props,
            inProgress,
            onKey: this.sign,
            onHot: this.hotSign,
            onKc: this.signKs
          })}
        </div>
      );
    }

    if (registered) {
      return (
        <div className="dialog-content">
          <p className="text-info">{_t("community-rewards-registration.conflict-body-text")}</p>
          {btnClose}
        </div>
      );
    }

    if (community.subscribers < 100) {
      return (
        <div className="dialog-content">
          <p className="text-danger">
            {_t("community-rewards-registration.min-required-body-text")}
          </p>
          {btnClose}
        </div>
      );
    }

    return (
      <div className="dialog-content">
        <p>{_t("community-rewards-registration.body-text")}</p>
        {btnNext}
      </div>
    );
  }
}

export default class CommunityRewardsRegistrationDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="community-rewards-registration-dialog"
      >
        <ModalHeader closeButton={true} />
        <ModalBody>
          <CommunityRewardsRegistration {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
