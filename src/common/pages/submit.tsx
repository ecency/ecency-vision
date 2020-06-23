import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import isEqual from "react-fast-compare";

import { Form, FormControl } from "react-bootstrap";

import defaults from "../constants/defaults.json";

import {
  renderPostBody,
  setProxyBase,
  // @ts-ignore
} from "@esteemapp/esteem-render-helpers";
setProxyBase(defaults.imageServer);

import { AppState } from "../store";
import { Global } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { TrendingTags } from "../store/trending-tags/types";
import { User } from "../store/users/types";
import { ActiveUser } from "../store/active-user/types";

import { hideIntro, toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";
import { fetchTrendingTags } from "../store/trending-tags";
import { setActiveUser } from "../store/active-user";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import FullHeight from "../components/full-height";
import EditorToolbar from "../components/editor-toolbar";
import TagSelector from "../components/tag-selector";
import Tag from "../components/tag";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

interface PreviewContentProps {
  title: string;
  tags: string[];
  body: string;
}

class PreviewContent extends Component<PreviewContentProps> {
  shouldComponentUpdate(nextProps: Readonly<PreviewContentProps>): boolean {
    return (
      !isEqual(this.props.title, nextProps.title) ||
      !isEqual(this.props.tags, nextProps.tags) ||
      !isEqual(this.props.body, nextProps.body)
    );
  }

  render() {
    const { title, tags, body } = this.props;

    return (
      <>
        <div className="preview-title">{title}</div>

        <div className="preview-tags">
          {tags.map((x) => {
            return (
              <span className="preview-tag">
                <Tag type="span" {...this.props} tag={x}>
                  <span>{x}</span>
                </Tag>
              </span>
            );
          })}
        </div>

        <div className="preview-body markdown-view" dangerouslySetInnerHTML={{ __html: renderPostBody(body) }} />
      </>
    );
  }
}

interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  users: User[];
  activeUser: ActiveUser | null;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
  fetchTrendingTags: () => void;
  setActiveUser: (name?: string) => void;
}

interface State {
  title: string;
  tags: string[];
  body: string;
  preview: {
    title: string;
    tags: string[];
    body: string;
  };
}

class SubmitPage extends Component<Props, State> {
  state: State = {
    title: "",
    tags: [],
    body: "",
    preview: {
      title: "",
      tags: [],
      body: "",
    },
  };

  _updateTimer: any = null;

  titleChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const { value: title } = e.target;
    this.setState({ title }, () => {
      this.updatePreview();
    });
  };

  tagsChanged = (tags: string[]) => {
    this.setState({ tags }, () => {
      this.updatePreview();
    });
  };

  bodyChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
    const { value: body } = e.target;
    this.setState({ body }, () => {
      this.updatePreview();
    });
  };

  updatePreview = () => {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = null;
    }

    this._updateTimer = setTimeout(() => {
      const { title, tags, body } = this.state;
      this.setState({ preview: { title, tags, body } });
    }, 500);
  };

  render() {
    const { title, tags, body, preview } = this.state;

    //  Meta config
    const metaProps = {
      title: "Create a post",
    };

    return (
      <>
        <Meta {...metaProps} />
        <FullHeight />
        <Theme {...this.props} />
        <Feedback />
        <NavBar {...this.props} />

        <div className="app-content submit-page">
          <div className="editor-side">
            <EditorToolbar />
            <div className="title-input">
              <Form.Control
                className="accepts-emoji"
                placeholder={_t("submit.title-placeholder")}
                autoFocus={true}
                value={title}
                onChange={this.titleChanged}
              />
            </div>
            <div className="tag-input">
              <TagSelector {...this.props} tags={tags} maxItem={10} onChange={this.tagsChanged} />
            </div>
            <div className="body-input">
              <Form.Control
                id="the-editor"
                className="accepts-emoji"
                as="textarea"
                placeholder={_t("submit.body-placeholder")}
                value={body}
                onChange={this.bodyChanged}
              />
            </div>
          </div>
          <div className="flex-spacer" />
          <div className="preview-side">
            <div className="preview-header">
              <h2 className="preview-header-title">Preview</h2>
            </div>
            <PreviewContent {...this.props} {...preview} />
          </div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  trendingTags: state.trendingTags,
  users: state.users,
  activeUser: state.activeUser,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      addAccount,
      fetchTrendingTags,
      setActiveUser,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SubmitPage);
