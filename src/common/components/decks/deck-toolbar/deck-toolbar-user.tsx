import { UserAvatar } from "../../user-avatar";
import { FullAccount } from "../../../store/accounts/types";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { _t } from "../../../i18n";
import { Link } from "react-router-dom";
import { Button } from "@ui/button";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { NavbarSideThemeSwitcher } from "../../navbar/sidebar/navbar-side-theme-switcher";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  items: {
    label: string;
    onClick: () => void;
  }[];
}

export const DeckToolbarUser = ({ isExpanded, items, setIsExpanded }: Props) => {
  const { activeUser, global, toggleTheme, toggleUIProp } = useMappedStore();

  return (
    <div
      className={
        "user flex items-center " + (isExpanded ? "justify-content-start" : "justify-center")
      }
    >
      {activeUser ? (
        <Dropdown onClick={() => setIsExpanded(true)}>
          <DropdownToggle>
            <UserAvatar size="medium" global={global} username={activeUser?.username} />
          </DropdownToggle>
          <DropdownMenu>
            {items.map(({ label, onClick }) => (
              <DropdownItem onClick={() => onClick()} key={label}>
                {label}
              </DropdownItem>
            ))}
          </DropdownMenu>
        </Dropdown>
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
    </div>
  );
};
