import { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";

import queryString from "query-string";

import { AppState } from "../store";
import { Global } from "../store/global/types";
import { User } from "../store/users/types";

import { addUser } from "../store/users";
import { setActiveUser } from "../store/active-user";

import { hsTokenRenew } from "../api/private";

interface Props {
  history: History;
  location: Location;
  global: Global;
  addUser: (user: User) => void;
  setActiveUser: (username: string | null) => void;
}

class AuthPage extends Component<Props> {
  componentDidMount() {
    const { location, history, addUser, setActiveUser } = this.props;
    const qs = queryString.parse(location.search);
    const code = qs.code as string;
    if (code) {
      hsTokenRenew(code)
        .then((x) => {
          const user: User = {
            username: x.username,
            accessToken: x.access_token,
            refreshToken: x.refresh_token,
            expiresIn: x.expires_in,
          };

          addUser(user);
          setActiveUser(user.username);
          history.push("/");
        })
        .catch(() => {
          history.push("/");
        });
    }
  }
  render() {
    return null;
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global,
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      addUser,
      setActiveUser,
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthPage);
