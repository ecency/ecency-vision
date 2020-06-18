import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History } from "history";

import { FormControl } from "react-bootstrap";

import { AppState } from "../store";
import { Global } from "../store/global/types";
import { Account } from "../store/accounts/types";

import { hideIntro, toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import FullHeight from "../components/full-height";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

interface Props {
  history: History;
  global: Global;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
}

interface State {}

class SubmitPage extends Component<Props, State> {
  state: State = {};

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
          <div className="editor-side"></div>
          <div className="flex-spacer" />
          <div className="preview-side"></div>
        </div>
      </>
    );
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      toggleTheme,
      hideIntro,
      addAccount,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(SubmitPage);
