import BaseComponent from "../components/base";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import queryString from "query-string";
import { _t } from "../i18n";
import { User } from "../store/users/types";
import { hsTokenRenew } from "../api/auth-api";
import Feedback, { error } from "../components/feedback";
import { formatError, setUserRole, updateCommunity } from "../api/operations";
import Meta from "../components/meta";
import Theme from "../components/theme";
import { connect } from "react-redux";
import React from "react";
import NavBar from "../components/navbar";
import { Button } from "@ui/button";

interface CreateHsState {
  username: string;
  done: boolean;
  inProgress: boolean;
  progress: string;
}

class CommunityCreateHSPage extends BaseComponent<PageProps, CreateHsState> {
  state: CreateHsState = {
    username: "",
    done: false,
    inProgress: false,
    progress: ""
  };

  componentDidMount() {
    this.handle().then();
  }

  handle = async () => {
    const { location, history, addUser, activeUser } = this.props;
    const qs = queryString.parse(location.search);
    const code = qs.code as string;
    const title = (qs.title as string) || "";
    const about = (qs.about as string) || "";

    if (!code || !activeUser) {
      history.push("/");
      return;
    }

    this.stateSet({ inProgress: true, progress: _t("communities-create.progress-user") });

    // get access token from code and create user object
    let user: User;
    try {
      user = await hsTokenRenew(code).then((x) => ({
        username: x.username,
        accessToken: x.access_token,
        refreshToken: x.refresh_token,
        expiresIn: x.expires_in,
        postingKey: null
      }));
    } catch (e) {
      error(...formatError(e));
      this.stateSet({ inProgress: false, progress: "" });
      return;
    }

    // add username to state
    this.stateSet({ username: user.username });

    // add community user to reducer
    addUser(user);

    // set admin role
    this.stateSet({ progress: _t("communities-create.progress-role", { u: activeUser.username }) });

    try {
      await setUserRole(user.username, user.username, activeUser.username, "admin");
    } catch (e) {
      error(...formatError(e));
      this.stateSet({ inProgress: false, progress: "" });
      return;
    }

    // update community props
    this.stateSet({ progress: _t("communities-create.progress-props") });

    try {
      await updateCommunity(user.username, user.username, {
        title,
        about,
        lang: "en",
        description: "",
        flag_text: "",
        is_nsfw: false
      });
    } catch (e) {
      error(...formatError(e));
      this.stateSet({ inProgress: false, progress: "" });
      return;
    }

    // wait 3 seconds to hivemind synchronize community data
    await new Promise((r) => {
      setTimeout(() => {
        r(true);
      }, 3000);
    });

    // done
    this.stateSet({ inProgress: false, done: true });

    // redirect to community page
    history.push(`/created/${user.username}`);
  };

  render() {
    //  Meta config
    const metaProps = {
      title: _t("communities-create.page-title"),
      description: _t("communities-create.description")
    };

    const { global, activeUser } = this.props;
    const { inProgress, progress, done } = this.state;

    return (
      <>
        <Meta {...metaProps} />
        <Theme global={global} />
        <Feedback activeUser={activeUser} />
        <NavBar history={this.props.history} />

        <div className="app-content communities-page">
          <div className="community-form">
            <h1 className="form-title">{_t("communities-create.page-title")}</h1>
            {(() => {
              if (inProgress) {
                return <p>{progress}</p>;
              }

              if (done) {
                return null;
              }

              return (
                <div>
                  <p className="text-red">{_t("g.server-error")}</p>
                  <p>
                    <Button onClick={() => this.handle().then()}>{_t("g.try-again")}</Button>
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityCreateHSPage);
