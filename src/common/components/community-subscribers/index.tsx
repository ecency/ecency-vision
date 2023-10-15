import React from "react";
import isEqual from "react-fast-compare";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { Community, roleMap } from "../../store/communities";
import { Subscription } from "../../store/subscriptions/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import CommunityRoleEditDialog from "../community-role-edit";
import { error } from "../feedback";
import accountReputation from "../../helper/account-reputation";
import { getAccounts } from "../../api/hive";
import { getSubscribers } from "../../api/bridge";
import { _t } from "../../i18n";
import { pencilOutlineSvg } from "../../img/svg";
import "./_index.scss";

interface MinifiedAccount {
  name: string;
  reputation: string | number;
}

interface Props {
  history: History;
  global: Global;
  community: Community;
  activeUser: ActiveUser | null;
  addAccount: (data: Account) => void;
}

interface State {
  loading: boolean;
  subscribers: Subscription[];
  editingSubscriber: Subscription | null;
  accounts: MinifiedAccount[];
}

export class Subscribers extends BaseComponent<Props, State> {
  state: State = {
    loading: true,
    subscribers: [],
    editingSubscriber: null,
    accounts: []
  };

  componentDidMount() {
    this.fetch().then();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    // re-fetch once community updated. (on role update of a particular subscriber)
    if (!isEqual(this.props.community, prevProps.community) && !this.state.loading) {
      this.fetch().then();
    }
  }

  fetch = () => {
    const { community } = this.props;
    return getSubscribers(community.name)
      .then((resp) => {
        if (resp) {
          // merge subscribers & community team
          const subscribers = [
            ...community.team.filter((x) => !x[0].startsWith("hive-")),
            ...resp.filter((x) => community.team.find((y) => x[0] === y[0]) === undefined)
          ];

          const usernames = subscribers.map((x) => x[0]);

          return getAccounts(usernames).then((accounts) => {
            const minifiedAccounts: MinifiedAccount[] = accounts.map((x) => ({
              name: x.name,
              reputation: x.reputation
            }));
            this.stateSet({ subscribers, accounts: minifiedAccounts });
          });
        }
        return null;
      })
      .catch(() => {
        error(_t("g.server-error"));
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { subscribers, accounts, editingSubscriber, loading } = this.state;

    if (loading) {
      return (
        <div className="community-subscribers">
          <LinearProgress />
        </div>
      );
    }

    const { community, activeUser } = this.props;

    const role = community.team.find((x) => x[0] === activeUser?.username);
    const roleInTeam = role ? role[1] : null;
    const canEditTeam = !!(roleInTeam && roleMap[roleInTeam]);
    const roles = roleInTeam ? roleMap[roleInTeam] : [];

    return (
      <div className="community-subscribers">
        {subscribers.length > 0 && (
          <div className="user-list">
            <div className="list-body">
              {subscribers.map((item, i) => {
                const [username, role] = item;
                const account = accounts.find((x) => x.name === username);
                const canEditRole = roles && roles.includes(role);

                return (
                  <div className="list-item" key={username}>
                    <div className="item-main">
                      {ProfileLink({
                        ...this.props,
                        username,
                        children: <UserAvatar username={username} size="small" />
                      })}
                      <div className="item-info">
                        {ProfileLink({
                          ...this.props,
                          username,
                          children: <span className="item-name notranslate">{username}</span>
                        })}
                        {account?.reputation !== undefined && (
                          <span className="item-reputation">
                            {accountReputation(account.reputation)}
                          </span>
                        )}
                      </div>
                    </div>
                    {canEditTeam && (
                      <div className="item-extra">
                        {role}
                        {canEditRole && (
                          <a
                            href="#"
                            className="btn-edit-role"
                            onClick={(e) => {
                              e.preventDefault();

                              this.stateSet({ editingSubscriber: item });
                            }}
                          >
                            {pencilOutlineSvg}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {editingSubscriber && (
          <CommunityRoleEditDialog
            {...this.props}
            activeUser={activeUser!}
            user={editingSubscriber[0]}
            role={editingSubscriber[1]}
            roles={roles}
            onHide={() => {
              this.stateSet({ editingSubscriber: null });
            }}
          />
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    global: p.global,
    community: p.community,
    activeUser: p.activeUser,
    addAccount: p.addAccount
  };

  return <Subscribers {...props} />;
};
