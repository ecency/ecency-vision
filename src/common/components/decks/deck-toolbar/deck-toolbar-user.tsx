import { UserAvatar } from "../../user-avatar";
import { FullAccount } from "../../../store/accounts/types";
import React, { useState } from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { Link } from "react-router-dom";
import { Button } from "@ui/button";
import { NavbarSideThemeSwitcher } from "../../navbar/sidebar/navbar-side-theme-switcher";
import { NavbarSide } from "../../navbar/sidebar/navbar-side";
import { History } from "history";

interface Props {
  history: History;
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  items: {
    label: string;
    onClick: () => void;
  }[];
}

export const DeckToolbarUser = ({ isExpanded, items, setIsExpanded, history }: Props) => {
  const { activeUser, global, toggleTheme, toggleUIProp } = useMappedStore();

  const [showUserSide, setShowUserSide] = useState(false);

  return (
    <div
      className={
        "user flex items-center " + (isExpanded ? "justify-content-start" : "justify-center")
      }
    >
      {activeUser ? (
        <UserAvatar
          size="medium"
          global={global}
          username={activeUser?.username}
          onClick={() => setShowUserSide(true)}
        />
      ) : (
        <Link to="/">
          <img className="user-avatar medium" src={require("../../../img/logo-circle.svg")} />
        </Link>
      )}
      {isExpanded ? (
        activeUser ? (
          <>
            <div className="content">
              <div className="name">{(activeUser.data as FullAccount).name}</div>
              <div className="username">@{activeUser.username}</div>
            </div>
            <NavbarSideThemeSwitcher floatRight={true} />
          </>
        ) : (
          <>
            <Button className="w-full" outline={true} onClick={() => toggleUIProp("login")}>
              {_t("g.login")}
            </Button>
            <NavbarSideThemeSwitcher floatRight={true} />
          </>
        )
      ) : (
        <></>
      )}

      {activeUser && (
        <NavbarSide
          placement="left"
          show={showUserSide}
          setShow={setShowUserSide}
          history={history}
        />
      )}
    </div>
  );
};
