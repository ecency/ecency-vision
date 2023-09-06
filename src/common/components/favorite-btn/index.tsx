import React from "react";
import { Account } from "../../store/accounts/types";
import { ActiveUser } from "../../store/active-user/types";
import { ToggleType, UI } from "../../store/ui/types";
import { User } from "../../store/users/types";
import BaseComponent from "../base";
import Tooltip from "../tooltip";
import LoginRequired from "../login-required";
import { error, success } from "../feedback";
import { addFavorite, checkFavorite, deleteFavorite } from "../../api/private-api";
import { _t } from "../../i18n";
import { personFavoriteOutlineSvg, personFavoriteSvg } from "../../img/svg";
import "./_index.scss";
import { Button } from "@ui/button";

interface Props {
  targetUsername: string;
  activeUser: ActiveUser | null;
  users: User[];
  ui: UI;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
}

export interface State {
  favorited: boolean;
  inProgress: boolean;
}

export class FavoriteBtn extends BaseComponent<Props, State> {
  state: State = {
    favorited: false,
    inProgress: false
  };

  componentDidMount() {
    this.detect();
  }

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { activeUser, targetUsername } = this.props;
    if (
      // active user changed
      activeUser?.username !== prevProps.activeUser?.username ||
      // or targetUsername changed
      targetUsername !== prevProps.targetUsername
    ) {
      this.detect();
    }
  }

  detect = () => {
    const { targetUsername, activeUser } = this.props;
    if (!activeUser) {
      this.stateSet({ favorited: false });
      return;
    }

    this.stateSet({ inProgress: true });
    checkFavorite(activeUser?.username!, targetUsername)
      .then((r) => {
        this.stateSet({ favorited: r });
      })
      .finally(() => this.stateSet({ inProgress: false }));
  };

  add = () => {
    const { activeUser, targetUsername } = this.props;
    this.stateSet({ inProgress: true });
    addFavorite(activeUser?.username!, targetUsername)
      .then((r) => {
        this.detect();
        success(_t("favorite-btn.added"));
      })
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  delete = () => {
    const { activeUser, targetUsername } = this.props;
    const { favorited } = this.state;

    if (!favorited) {
      return;
    }

    this.stateSet({ inProgress: true });
    deleteFavorite(activeUser?.username!, targetUsername)
      .then(() => {
        this.detect();
        success(_t("favorite-btn.deleted"));
      })
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ inProgress: false }));
  };

  render() {
    const { activeUser } = this.props;
    const { favorited, inProgress } = this.state;

    if (!activeUser) {
      return LoginRequired({
        ...this.props,
        children: (
          <span className="favorite-btn">
            <Tooltip content={_t("favorite-btn.add")}>
              <Button disabled={inProgress} onClick={this.delete} icon={personFavoriteOutlineSvg} />
            </Tooltip>
          </span>
        )
      });
    }

    if (favorited) {
      return (
        <span className="favorite-btn">
          <Tooltip content={_t("favorite-btn.delete")}>
            <Button disabled={inProgress} onClick={this.delete} icon={personFavoriteSvg} />
          </Tooltip>
        </span>
      );
    }

    return (
      <span className="favorite-btn">
        <Tooltip content={_t("favorite-btn.add")}>
          <Button disabled={inProgress} onClick={this.add} icon={personFavoriteOutlineSvg} />
        </Tooltip>
      </span>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    targetUsername: p.targetUsername,
    activeUser: p.activeUser,
    users: p.users,
    ui: p.ui,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp
  };

  return <FavoriteBtn {...props} />;
};
