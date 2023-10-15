import { Component } from "react";
import { AnyAction, bindActionCreators, Dispatch } from "redux";
import { connect } from "react-redux";
import { History, Location } from "history";
import queryString from "query-string";
import { AppState } from "../store";
import { Global } from "../store/global/types";
import { Account } from "../store/accounts/types";
import { User } from "../store/users/types";
import { addUser } from "../store/users";
import { setActiveUser, updateActiveUser } from "../store/active-user";
import { getAccount } from "../api/hive";
import { usrActivity } from "../api/private-api";
import { hsTokenRenew } from "../api/auth-api";
import { validateToken } from "../helper/hive-signer";

interface Props {
  history: History;
  location: Location;
  global: Global;
  addUser: (user: User) => void;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
}

class AuthPage extends Component<Props> {
  componentDidMount() {
    const { location, history, addUser, setActiveUser, updateActiveUser } = this.props;
    const qs = queryString.parse(location.search);
    const code = qs.code as string;
    if (code) {
      if (validateToken(code)) {
        hsTokenRenew(code)
          .then((x) => {
            const user: User = {
              username: x.username,
              accessToken: x.access_token,
              refreshToken: x.refresh_token,
              expiresIn: x.expires_in,
              postingKey: null
            };

            addUser(user);
            setActiveUser(user.username);
            getAccount(user.username)
              .then((r) => {
                updateActiveUser(r);
                usrActivity(user.username, 20);
              })
              .finally(() => {
                history.push(`/@${user.username}/feed`);
              });
          })
          .catch(() => {
            history.push("/");
          });
      } else {
        history.push("/?login");
      }
    }
  }

  render() {
    return null;
  }
}

const mapStateToProps = (state: AppState) => ({
  global: state.global
});

const mapDispatchToProps = (dispatch: Dispatch<AnyAction>) =>
  bindActionCreators(
    {
      addUser,
      setActiveUser,
      updateActiveUser
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(AuthPage);
