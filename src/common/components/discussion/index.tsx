import React, { Component } from "react";

import { History } from "history";

import moment from "moment";

import defaults from "../../constants/defaults.json";

import {
  renderPostBody,
  setProxyBase,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

import { Entry } from "../../store/entries/types";

import { Account } from "../../store/accounts/types";
import { State as GlobalState } from "../../store/global/types";

import { getDiscussion } from "../../api/bridge";

import parseAsset from "../../helper/parse-asset";

import sortDiscussion from "../../helper/discussion-sort";

import ProfileLink from "../profile-link";

import EntryLink from "../entry-link";

import UserAvatar from "../user-avatar";

import parseDate from "../../helper/parse-date";

import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import DownloadTrigger from "../download-trigger";
import { _t } from "../../i18n";

interface ItemProps {
  history: History;
  global: GlobalState;
  discussion: Entry[];
  entry: Entry;
  addAccount: (data: Account) => void;
}

export class Item extends Component<ItemProps> {
  shouldComponentUpdate(): boolean {
    return false;
  }

  render() {
    const { discussion, entry } = this.props;
    const created = moment(parseDate(entry.created));
    const renderedBody = { __html: renderPostBody(entry) };

    return (
      <div className="discussion-item">
        <div className="item-inner">
          <div className="item-header">
            <ProfileLink {...this.props} username={entry.author}>
              <div className="author-part">
                <div className="author-avatar">
                  <UserAvatar username={entry.author} size="medium" />
                </div>
                <div className="author">
                  <span className="author-name">{entry.author}</span>
                  <span className="author-reputation">{entry.author_reputation}</span>
                </div>
              </div>
            </ProfileLink>
            <span className="separator" />
            <EntryLink {...this.props} entry={entry}>
              <span className="date" title={created.format("LLLL")}>
                {created.fromNow()}
              </span>
            </EntryLink>
          </div>
          <div className="item-body markdown-view mini-markdown" dangerouslySetInnerHTML={renderedBody} />
          <div className="item-controls">
            <EntryVoteBtn {...this.props} />
            <EntryPayout {...this.props} entry={entry} />
        
            <EntryVotes {...this.props} entry={entry} />
     
            <DownloadTrigger>
              <span className="reply-btn" role="none">
                {_t("entry.reply")}
              </span>
            </DownloadTrigger>
          </div>
        </div>

        <List {...this.props} parent={entry} discussion={discussion} />
      </div>
    );
  }
}

interface ListProps {
  history: History;
  global: GlobalState;
  discussion: Entry[];
  parent: Entry;
  addAccount: (data: Account) => void;
}

export class List extends Component<ListProps> {
  render() {
    const { discussion, parent } = this.props;

    const filtered = discussion.filter(
      (x) => x.parent_author === parent.author && x.parent_permlink === parent.permlink
    );

    if (filtered.length === 0) {
      // return null;
    }

    return (
      <div className="discussion-list">
        {filtered.map((d, k) => (
          <Item key={k} {...this.props} discussion={discussion} entry={d} />
        ))}
      </div>
    );
  }
}

interface Props {
  history: History;
  global: GlobalState;
  parent: Entry;
  addAccount: (data: Account) => void;
}

interface State {
  discussion: Entry[];
  loading: boolean;
}

export default class Discussion extends Component<Props> {
  state: State = {
    discussion: [],
    loading: false,
  };

  _mounted: boolean = true;

  componentDidMount() {
    const { parent } = this.props;
    const { author, permlink } = parent;

    getDiscussion(author, permlink)
      .then((resp) => {
        if (resp) {
          let discussion: Entry[] = [];
          for (const d in resp) {
            discussion.push(resp[d]);
          }

          sortDiscussion(discussion, "trending");

          // const discussion = Object.keys(d).map((x) => d[x]);

          this.stateSet({ discussion, loading: false });
        }
      })
      .catch(() => {
        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb = undefined) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  render() {
    const { parent } = this.props;
    const { discussion, loading } = this.state;

    if (loading) {
      return null;
    }

    return (
      <div className="discussion">
        <List {...this.props} parent={parent} discussion={discussion} />
      </div>
    );
  }
}
