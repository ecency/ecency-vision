import React, { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import { Form, FormControl } from "react-bootstrap";

import { AppState } from "../store";
import { State as GlobalState } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { Community } from "../store/community/types";

import { hideIntro, toggleTheme } from "../store/global/index";
import { addAccount } from "../store/accounts/index";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import { getCommunities } from "../api/bridge";

interface Props {
  history: History;
  location: Location;
  global: GlobalState;
  toggleTheme: () => void;
  addAccount: (data: Account) => void;
}

interface State {
  list: Community[];
  loading: boolean;
  query: string;
  sort: string;
}

class EntryIndexPage extends Component<Props> {
  state: State = {
    list: [],
    loading: false,
    query: "",
    sort: "rank",
  };

  _mounted: boolean = true;

  componentDidMount() {
    this.fetch();
  }

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = (obj: {}, cb = undefined) => {
    if (this._mounted) {
      this.setState(obj, cb);
    }
  };

  fetch = () => {
    const { query, sort } = this.state;

    this.stateSet({ loading: true });
    getCommunities("", 100, query, sort)
      .then((r) => {
        if (r) {
          console.log(r);
          this.stateSet({ list: r });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    //  Meta config
    const metaProps = {};

    return (
      <>
        <Meta {...metaProps} />
        <Theme {...this.props} />
        <NavBar {...this.props} />

        <div className="app-content communities-page">
          <div className="community-list">
            <div className="list-header">
              <h1 className="list-title">{_t("communities.title")}</h1>
            </div>
            <div className="list-form">
              <div className="search-box">
                <FormControl placeholder={_t("g.search")} />
              </div>
              <div className="sort-box">
                <Form.Control as="select">
                  <option value="rank">{_t("communities.sort-rank")}</option>
                  <option value="subs">{_t("communities.sort-subs")}</option>
                  <option value="new">{_t("communities.sort-new")}</option>
                </Form.Control>
              </div>
            </div>
          </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(EntryIndexPage);
