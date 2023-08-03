import React, { Component } from "react";

import { diff_match_patch } from "diff-match-patch";

import { Form, FormControl } from "react-bootstrap";

import defaults from "../../constants/defaults.json";

import { renderPostBody, setProxyBase } from "@ecency/render-helper";
import { Entry } from "../../store/entries/types";

import BaseComponent from "../base";
import LinearProgress from "../linear-progress";

import { error } from "../feedback";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";

import { commentHistory, CommentHistoryListItem } from "../../api/private-api";

import { historySvg, tagSvg } from "../../img/svg";
import { dateToFormatted } from "../../helper/parse-date";
import "./index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";

setProxyBase(defaults.imageServer);

const dmp = new diff_match_patch();

const make_diff = (str1: string, str2: string): string => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, "&nbsp;");
};

export interface CommentHistoryListItemDiff {
  title: string;
  titleDiff?: string;
  body: string;
  bodyDiff?: string;
  tags: string;
  tagsDiff?: string;
  timestamp: string;
  v: number;
}

interface Props {
  entry: Entry;
  onHide: () => void;
}

interface State {
  history: CommentHistoryListItemDiff[];
  selected: number;
  showDiff: boolean;
  loading: boolean;
}

export class EditHistory extends BaseComponent<Props, State> {
  state: State = {
    history: [],
    selected: 1,
    showDiff: true,
    loading: true
  };

  componentDidMount() {
    this.loadData();
  }

  buildList = (raw: CommentHistoryListItem[]): CommentHistoryListItemDiff[] => {
    const t: CommentHistoryListItemDiff[] = [];

    let h = "";
    for (let l = 0; l < raw.length; l += 1) {
      if (raw[l].body.startsWith("@@")) {
        const p = dmp.patch_fromText(raw[l].body);
        h = dmp.patch_apply(p, h)[0];
        raw[l].body = h;
      } else {
        h = raw[l].body;
      }

      t.push({
        v: raw[l].v,
        title: raw[l].title,
        body: h,
        timestamp: raw[l].timestamp,
        tags: raw[l].tags.join(", ")
      });
    }

    for (let l = 0; l < t.length; l += 1) {
      const p = l > 0 ? l - 1 : l;

      t[l].titleDiff = make_diff(t[p].title, t[l].title);
      t[l].bodyDiff = make_diff(t[p].body, t[l].body);
      t[l].tagsDiff = make_diff(t[p].tags, t[l].tags);
    }

    return t;
  };

  loadData = () => {
    const { entry } = this.props;

    commentHistory(entry.author, entry.permlink)
      .then((resp) => {
        this.stateSet({ history: this.buildList(resp.list) });
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  versionClicked = (i: CommentHistoryListItemDiff) => {
    this.setState({ selected: i.v });
  };

  versionChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.setState({ selected: Number(e.target.value) });
  };

  diffChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.setState({ showDiff: e.target.checked });
  };

  render() {
    const { history, selected, loading, showDiff } = this.state;

    if (loading) {
      return (
        <div className="edit-history-dialog-content loading">
          <LinearProgress />
        </div>
      );
    }

    const selectedItem = history.find((x) => x.v === selected);
    if (!selectedItem) {
      return null;
    }

    const title = { __html: showDiff ? selectedItem.titleDiff! : selectedItem.title };
    const body = { __html: showDiff ? selectedItem.bodyDiff! : renderPostBody(selectedItem.body) };
    const tags = { __html: showDiff ? selectedItem.tagsDiff! : selectedItem.tags };

    return (
      <div className="edit-history-dialog-content">
        <div className="version-list-sm">
          <div className="diff-select">
            <label>
              <input type="checkbox" checked={showDiff} onChange={this.diffChanged} />{" "}
              {_t("edit-history.show-diff")}
            </label>
          </div>
          <Form.Control as="select" value={selected} onChange={this.versionChanged}>
            {history.map((i) => {
              return (
                <option value={i.v} key={i.v}>
                  {" "}
                  {_t("edit-history.version", { n: i.v })}
                </option>
              );
            })}
          </Form.Control>
        </div>
        <div className="version-list-lg">
          <div className="diff-select">
            <label>
              <input type="checkbox" checked={showDiff} onChange={this.diffChanged} />{" "}
              {_t("edit-history.show-diff")}
            </label>
          </div>
          {history.map((i) => {
            return (
              <div
                key={i.v}
                className={_c(`version-list-item ${selected === i.v ? "selected" : ""}`)}
                onClick={() => {
                  this.versionClicked(i);
                }}
              >
                <div className="item-icon">{historySvg}</div>
                <div className="item-title">{_t("edit-history.version", { n: i.v })}</div>
                <div className="item-date">{dateToFormatted(i.timestamp, "LLL")}</div>
              </div>
            );
          })}
        </div>
        <div className="version-detail">
          <h1 className="entry-title" dangerouslySetInnerHTML={title} />
          <div className="entry-tags">
            {tagSvg} <span dangerouslySetInnerHTML={tags} />
          </div>
          <div className="entry-body markdown-view" dangerouslySetInnerHTML={body} />
        </div>
      </div>
    );
  }
}

export default class EditHistoryDialog extends Component<Props> {
  render() {
    const { onHide } = this.props;
    return (
      <Modal
        animation={false}
        show={true}
        centered={true}
        onHide={onHide}
        className="edit-history-dialog"
        size="lg"
      >
        <ModalHeader closeButton={true}>
          <ModalTitle>{_t("edit-history.title")}</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <EditHistory {...this.props} />
        </ModalBody>
      </Modal>
    );
  }
}
