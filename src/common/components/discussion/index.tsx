import React, { Component } from "react";

import { History } from "history";

import isEqual from "react-fast-compare";

import moment from "moment";

import { Form, FormControl } from "react-bootstrap";

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

import sortDiscussion, { SortOrder } from "../../helper/discussion-sort";

import ProfileLink from "../profile-link";

import EntryLink from "../entry-link";

import UserAvatar from "../user-avatar";

import parseDate from "../../helper/parse-date";

import EntryVoteBtn from "../entry-vote-btn/index";
import EntryReblogBtn from "../entry-reblog-btn/index";
import EntryPayout from "../entry-payout/index";
import EntryVotes from "../entry-votes";
import DownloadTrigger from "../download-trigger";
import LinearProgress from "../linear-progress";

import { _t } from "../../i18n";
import _c from "../../util/fix-class-names";

import { commentSvg } from "../../img/svg";

interface ItemProps {
  history: History;
  global: GlobalState;
  discussion: Entry[];
  entry: Entry;
  addAccount: (data: Account) => void;
}

export class Item extends Component<ItemProps> {
  shouldComponentUpdate(nextProps: Readonly<ItemProps>): boolean {
    return !isEqual(this.props.global, nextProps.global) || !isEqual(this.props.entry, nextProps.entry);
  }

  render() {
    const { discussion, entry } = this.props;
    const created = moment(parseDate(entry.created));
    const renderedBody = { __html: renderPostBody(entry.body, false) };
    const reputation = Math.floor(entry.author_reputation);
    const readMore = entry.children > 0 && entry.depth > 5;
    const showSubList = !readMore && entry.children > 0;

    return (
      <div className={`discussion-item depth-${entry.depth}`}>
        <div className="item-inner">
          <div className="item-figure">
            <UserAvatar username={entry.author} size="medium" />
          </div>
          <div className="item-content">
            <div className="item-header">
              <ProfileLink {...this.props} username={entry.author}>
                <div className="author">
                  <span className="author-name">{entry.author}</span>
                  <span className="author-reputation">{reputation}</span>
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
                  {_t("g.reply")}
                </span>
              </DownloadTrigger>
            </div>
            {readMore && (
              <div className="read-more">
                <EntryLink {...this.props} entry={entry}>
                  <a>{_t("discussion.read-more")}</a>
                </EntryLink>
              </div>
            )}
          </div>
        </div>

        {showSubList && <List {...this.props} parent={entry} discussion={discussion} />}
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
      return null;
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
  order: string;
}

export default class Discussion extends Component<Props> {
  state: State = {
    discussion: [],
    loading: false,
    order: "trending",
  };

  _mounted: boolean = true;

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { parent } = this.props;
    if (parent.url !== prevProps.parent.url) {
      this.fetch();
    }
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  fetch = () => {
    const { parent } = this.props;
    const { author, permlink } = parent;
    const order = "trending";

    this.stateSet({ discussion: [], loading: true, order });

    getDiscussion(author, permlink)
      .then((resp) => {
        if (resp) {
          let discussion: Entry[] = [];
          for (const d in resp) {
            discussion.push(resp[d]);
          }

          // TODO: Consider immutability
          sortDiscussion(discussion, SortOrder[order]);

          this.stateSet({ discussion, loading: false });
        }
      })
      .catch(() => {
        this.stateSet({ loading: false });
      });
  };

  orderChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const order = e.target.value;

    this.stateSet({ order, loading: true });

    setTimeout(() => {
      const { discussion } = this.state;

      // TODO: Consider immutability
      sortDiscussion(discussion, SortOrder[order]);

      this.stateSet({ discussion, loading: false });
    }, 500);
  };

  stateSet = (obj: {}, cb = undefined) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  render() {
    const { parent } = this.props;
    const { discussion, loading, order } = this.state;

    if (parent.children === 0) {
      return <div className="discussion" />;
    }

    return (
      <div className={_c(`discussion ${loading ? "loading" : ""} `)}>
        {loading && <LinearProgress />}
        <div className="discussion-header">
          <div className="count">
            {commentSvg} {_t("discussion.count", { n: parent.children })}
          </div>
          <div className="order">
            <span className="order-label">{_t("discussion.order")}</span>
            <Form.Control as="select" size="sm" value={order} onChange={this.orderChanged} disabled={loading}>
              <option value="trending">{_t("discussion.order-trending")}</option>
              <option value="author_reputation">{_t("discussion.order-reputation")}</option>
              <option value="votes">{_t("discussion.order-votes")}</option>
              <option value="created">{_t("discussion.order-created")}</option>
            </Form.Control>
          </div>
        </div>
        <List {...this.props} parent={parent} discussion={discussion} />
      </div>
    );
  }
}
