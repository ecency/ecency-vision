import { useState } from "react";
import { Button } from "@ui/button";
import { NavbarSide, NavbarSideThemeSwitcher, UserAvatar } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import { FullAccount } from "@/entities";
import i18next from "i18next";

interface Props {
  isExpanded: boolean;
  setIsExpanded: (v: boolean) => void;
  items: {
    label: string;
    onClick: () => void;
  }[];
}

export const DeckToolbarUser = ({ isExpanded, items, setIsExpanded }: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const toggleUIProp = useGlobalStore((s) => s.toggleUiProp);

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
          username={activeUser?.username}
          onClick={() => setShowUserSide(true)}
        />
      ) : (
        <Link href="/">
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
              {i18next.t("g.login")}
            </Button>
            <NavbarSideThemeSwitcher floatRight={true} />
          </>
        )
      ) : (
        <></>
      )}

      {activeUser && <NavbarSide placement="left" show={showUserSide} setShow={setShowUserSide} />}
    </div>
  );
};
