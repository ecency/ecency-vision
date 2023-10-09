import React from "react";
import isEqual from "react-fast-compare";
import { ActiveUser } from "../../store/active-user/types";
import { Community } from "../../store/communities";
import { Global } from "../../store/global/types";
import { Subscription } from "../../store/subscriptions/types";
import BaseComponent from "../base";
import UserAvatar from "../user-avatar/index";
import { _t } from "../../i18n";
import isCommunity from "../../helper/is-community";
import { getCommunities, getCommunity, getSubscriptions } from "../../api/bridge";
import { menuDownSvg } from "../../img/svg";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { CommunitySelectorItem } from "./community-selector-item";

interface BrowserProps {
  global: Global;
  activeUser: ActiveUser;
  onSelect: (name: string | null) => void;
  onHide: () => void;
}

interface BrowserState {
  subscriptions: Subscription[];
  query: string;
  results: Community[];
}

export class Browser extends BaseComponent<BrowserProps, BrowserState> {
  state: BrowserState = {
    subscriptions: [],
    query: "",
    results: []
  };

  _timer: any = null;

  componentDidMount() {
    this.fetchSubscriptions().then();
    document.getElementById("search-communities-input")?.focus();
  }

  fetchSubscriptions = () => {
    const { activeUser } = this.props;
    return getSubscriptions(activeUser.username).then((subscriptions) => {
      if (subscriptions) {
        this.stateSet({ subscriptions });
      }
    });
  };

  queryChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }

    this.stateSet({ query: e.target.value }, () => {
      this._timer = setTimeout(() => {
        this.search();
      }, 200);
    });
  };

  search = () => {
    const { query } = this.state;

    getCommunities("", 14, query, "rank").then((results) => {
      if (results) {
        this.stateSet({ results });
      }
    });
  };

  render() {
    const { activeUser, onSelect, onHide } = this.props;
    const { subscriptions, results, query } = this.state;

    const search = (
      <div className="search">
        <FormControl
          type="text"
          placeholder={_t("community-selector.search-placeholder")}
          value={query}
          onChange={this.queryChanged}
          id="search-communities-input"
          spellCheck={true}
        />
      </div>
    );

    if (query) {
      return (
        <div className="browser">
          {search}

          <div className="browser-list">
            <div className="flex flex-wrap py-3 gap-3">
              {results?.length > 0 && (
                <>
                  {results.map((x) => (
                    <CommunitySelectorItem
                      key={x.id}
                      name={x.name}
                      title={x.title}
                      onSelect={onSelect}
                      onHide={onHide}
                    />
                  ))}
                </>
              )}
              {results?.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="browser">
        {search}

        <div className="browser-list">
          <div className="flex flex-wrap py-3 gap-3">
            <CommunitySelectorItem
              name={null}
              title={_t("community-selector.my-blog")}
              onSelect={onSelect}
              onHide={onHide}
            />

            {subscriptions?.length > 0 && (
              <>
                {subscriptions.map((x) => (
                  <CommunitySelectorItem
                    key={x[0]}
                    name={x[0]}
                    title={x[1]}
                    onSelect={onSelect}
                    onHide={onHide}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }
}

interface Props {
  global: Global;
  activeUser: ActiveUser;
  tags: string[];
  onSelect: (prev: string | null, next: string | null) => void;
}

interface State {
  community: Community | null;
  visible: boolean;
  picked: boolean;
}

export class CommunitySelector extends BaseComponent<Props, State> {
  state: State = {
    community: null,
    visible: false,
    picked: false
  };

  componentDidMount() {
    this.detectCommunity().then();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (!isEqual(this.props.tags, prevProps.tags)) {
      if (this.props.tags?.length > 0) {
        this.setState({ picked: false });
      }
      this.detectCommunity().then();
    }
  }

  extractCommunityName = (): string | null => {
    const { tags } = this.props;
    const [tag] = tags;

    if (!tag) {
      return null;
    }

    if (!isCommunity(tag)) {
      return null;
    }

    return tag;
  };

  detectCommunity = async () => {
    const name = this.extractCommunityName();

    if (!name) {
      this.stateSet({ community: null });
      return;
    }

    let community: Community | null;

    try {
      community = await getCommunity(name);
    } catch (e) {
      community = null;
    }

    this.stateSet({ community });
  };

  toggle = () => {
    const { visible } = this.state;
    this.stateSet({ visible: !visible });
  };

  render() {
    const { activeUser, tags, onSelect } = this.props;
    const { community, visible, picked } = this.state;

    let content;
    if (community) {
      content = (
        <>
          <UserAvatar username={community.name} size="small" />
          <span className="label">{community.title}</span> {menuDownSvg}
        </>
      );
    } else {
      if (tags?.length > 0 || picked) {
        content = (
          <>
            <UserAvatar username={activeUser.username} size="small" />
            <span className="label">{_t("community-selector.my-blog")}</span> {menuDownSvg}
          </>
        );
      } else {
        content = (
          <>
            <span className="label">{_t("community-selector.choose")}</span> {menuDownSvg}
          </>
        );
      }
    }

    return (
      <>
        <a
          href="#"
          className="community-selector"
          onClick={(e) => {
            e.preventDefault();
            this.toggle();
          }}
        >
          {content}
        </a>

        {visible && (
          <Modal
            onHide={this.toggle}
            show={true}
            centered={true}
            animation={false}
            className="community-selector-modal"
          >
            <ModalHeader closeButton={true} />

            <ModalBody>
              <Browser
                {...this.props}
                onHide={this.toggle}
                onSelect={(name: string | null) => {
                  const prev = this.extractCommunityName();
                  onSelect(prev, name);
                  this.stateSet({ picked: true });
                }}
              />
            </ModalBody>
          </Modal>
        )}
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    activeUser: p.activeUser,
    tags: p.tags,
    onSelect: p.onSelect
  };

  return <CommunitySelector {...props} />;
};
