import React, { Component } from "react";
import { History, Location } from "history";
import isEqual from "react-fast-compare";
import { Global } from "../../store/global/types";
import { Community, roleMap } from "../../store/communities";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import CommunityRoleEditDialog from "../community-role-edit";
import { _t } from "../../i18n";
import "./_index.scss";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";

interface Props {
  history: History;
  location: Location;
  global: Global;
  community: Community;
  activeUser: ActiveUser | null;
  addAccount: (data: Account) => void;
}

interface State {
  dialog: boolean;
  dialogUser: string;
  dialogRole: string;
}

export class CommunityRoles extends Component<Props, State> {
  state: State = {
    dialog: false,
    dialogUser: "",
    dialogRole: ""
  };

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return (
      !isEqual(this.props.community, nextProps.community) ||
      !isEqual(this.props.activeUser, nextProps.activeUser) ||
      !isEqual(this.state, nextProps.activeUser)
    );
  }

  showDialog = (user: string = "", role: string = "") => {
    this.setState({ dialog: true, dialogUser: user, dialogRole: role });
  };

  hideDialog = () => {
    this.setState({ dialog: false, dialogUser: "", dialogRole: "" });
  };

  render() {
    const { dialog, dialogUser, dialogRole } = this.state;
    const { community, activeUser } = this.props;

    const role = community.team.find((x) => x[0] === activeUser?.username);
    const roleInTeam = role ? role[1] : null;

    const roles = roleInTeam ? roleMap[roleInTeam] : [];

    return (
      <div className="community-roles">
        <h2>{_t("community.roles-title")}</h2>
        <Table full={true}>
          <thead>
            <Tr>
              <Th style={{ width: "200px" }}>{_t("community.roles-account")}</Th>
              <Th style={{ width: "74px" }}>{_t("community.roles-role")}</Th>
              <Th className="border p-3">{_t("community.roles-account-title")}</Th>
            </Tr>
          </thead>
          <tbody>
            {community.team.map((t, i) => {
              const [username, role, title] = t;
              const canEdit = roles && roles.includes(role);
              return (
                <Tr key={i}>
                  <Td>
                    {ProfileLink({
                      ...this.props,
                      username,
                      children: (
                        <span className="user flex gap-3 items-center">
                          <UserAvatar username={username} size="medium" />{" "}
                          <span className="username">{username}</span>
                        </span>
                      )
                    })}
                  </Td>
                  <Td>
                    {canEdit ? (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          this.showDialog(username, role);
                        }}
                      >
                        {role}
                      </a>
                    ) : (
                      role
                    )}
                  </Td>
                  <Td>{title}</Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        {roles.length > 0 && (
          <Button onClick={() => this.showDialog()}>{_t("community.roles-add")}</Button>
        )}

        {dialog && (
          <CommunityRoleEditDialog
            {...this.props}
            activeUser={activeUser!}
            user={dialogUser}
            role={dialogRole}
            roles={roles}
            onHide={this.hideDialog}
          />
        )}
      </div>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    location: p.location,
    global: p.global,
    community: p.community,
    activeUser: p.activeUser,
    addAccount: p.addAccount
  };

  return <CommunityRoles {...props} />;
};
