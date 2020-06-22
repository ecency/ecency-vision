import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { Form, FormControl } from "react-bootstrap";

import { AppState } from "../store";
import { Global } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { TrendingTags } from "../store/trending-tags/types";

import { hideIntro, toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";
import { fetchTrendingTags } from "../store/trending-tags";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import FullHeight from "../components/full-height";
import EditorToolbar from "../components/editor-toolbar";
import TagSelector from "../components/tag-selector";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

interface Props {
  history: History;
  location: Location;
  global: Global;
  trendingTags: TrendingTags;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
  fetchTrendingTags: () => void;
}

interface State {
  tags: string[];
}

class SubmitPage extends Component<Props, State> {
  state: State = {
    tags: [],
  };

  _mounted: boolean = true;

  componentDidMount() {}

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb: () => void = () => {}) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  render() {
    const { tags } = this.state;

    //  Meta config
    const metaProps = {
      title: "Create a post",
    };

    return (
      <>
        <Meta {...metaProps} />
        <FullHeight />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content submit-page">
          <div className="editor-side">
            <EditorToolbar />
            <div className="title-input">
              <Form.Control className="accepts-emoji" placeholder={_t("submit.title-placeholder")} autoFocus={true} />
            </div>
            <div className="tag-input">
              <TagSelector
                {...this.props}
                tags={tags}
                maxItem={10}
                onChange={(tags: string[]) => {
                  this.setState({ tags });
                }}
              />
            </div>
            <div className="body-input">
              <Form.Control
                id="the-editor"
                className="accepts-emoji"
                as="textarea"
                placeholder={_t("submit.body-placeholder")}
              />
            </div>
          </div>
          <div className="flex-spacer" />
          <div className="preview-side"></div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
  trendingTags: state.trendingTags,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      addAccount,
      fetchTrendingTags,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SubmitPage);
