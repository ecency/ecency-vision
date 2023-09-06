import BaseComponent from "../base";
import React, { Component } from "react";
import { Form } from "react-bootstrap";
import { Entry } from "../../store/entries/types";
import { ActiveUser } from "../../store/active-user/types";
import { error, success } from "../feedback";
import SuggestionList from "../suggestion-list";
import { comment, formatError } from "../../api/operations";
import { getSubscriptions } from "../../api/bridge";
import { makeApp, makeCommentOptions } from "../../helper/posting";
import { makeCrossPostMessage } from "../../helper/cross-post";
import { _t } from "../../i18n";
import { version } from "../../../../package.json";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

interface Props {
  activeUser: ActiveUser;
  entry: Entry;
  onSuccess: (community: string) => void;
  onHide: () => void;
}

interface State {
  communities: {
    id: string;
    name: string;
  }[];
  community: string;
  message: string;
  posting: boolean;
  loading: boolean;
}

export class CrossPost extends BaseComponent<Props, State> {
  state: State = {
    communities: [],
    community: "",
    message: "",
    posting: false,
    loading: true
  };

  componentDidMount() {
    const { activeUser } = this.props;
    getSubscriptions(activeUser.username)
      .then((r) => {
        if (r) {
          const communities = r.map((x) => ({ id: x[0], name: x[1] }));
          this.stateSet({ communities });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  }

  hide = () => {
    this.props.onHide();
  };

  communityChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.stateSet({ community: e.target.value });
  };

  messageChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.stateSet({ message: e.target.value });
  };

  submit = () => {
    const { entry, activeUser } = this.props;
    const { community, communities, message } = this.state;

    const theCommunity = communities.find((x) => x.name.toLowerCase() === community.toLowerCase());
    if (!theCommunity) {
      return;
    }

    const { title } = entry;
    const author = activeUser.username;
    const permlink = `${entry.permlink}-${theCommunity.id}`;

    const body = makeCrossPostMessage(entry, author, message);
    const jsonMeta = {
      app: makeApp(version),
      tags: ["cross-post"],
      original_author: entry.author,
      original_permlink: entry.permlink
    };

    const options = {
      ...makeCommentOptions(author, permlink, "dp"),
      allow_curation_rewards: false
    };

    this.stateSet({ posting: true });
    comment(author, "", theCommunity.id, permlink, title, body, jsonMeta, options)
      .then(() => {
        success(_t("cross-post.published"));
        this.props.onSuccess(theCommunity.id);
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => {
        this.stateSet({ posting: false });
      });
  };

  communitySelected = (item: any) => {
    this.stateSet({ community: item.name });
  };

  render() {
    const { communities, community, message, posting, loading } = this.state;

    const suggestions = communities.filter(
      (x) => x.name.toLowerCase().indexOf(community.toLowerCase()) !== -1
    );
    const theCommunity = communities.find((x) => x.name.toLowerCase() === community.toLowerCase());
    const canSubmit = theCommunity && message.trim() !== "";

    if (!loading && communities.length === 0) {
      return <span className="text-info">{_t("cross-post.no-subscription")}</span>;
    }

    return (
      <>
        <Form.Group controlId="community">
          <SuggestionList
            items={suggestions}
            onSelect={this.communitySelected}
            renderer={(x) => x.name}
          >
            <FormControl
              value={community}
              onChange={this.communityChanged}
              type="text"
              placeholder={_t("cross-post.community-placeholder")}
            />
          </SuggestionList>
        </Form.Group>
        <Form.Group controlId="message">
          <FormControl
            type="text"
            value={message}
            onChange={this.messageChanged}
            maxLength={200}
            placeholder={_t("cross-post.message-placeholder")}
          />
        </Form.Group>
        <p className="small text-muted">{_t("cross-post.info")}</p>
        <div className="d-flex justify-content-between">
          <Button appearance="secondary" outline={true} onClick={this.hide} disabled={posting}>
            {_t("g.cancel")}
          </Button>
          <Button disabled={!canSubmit || posting} onClick={this.submit}>
            {_t("cross-post.submit-label")} {posting ? "..." : ""}
          </Button>
        </div>
      </>
    );
  }
}

export default class CrossPostDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;

    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="cross-post-dialog"
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("cross-post.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <CrossPost {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
