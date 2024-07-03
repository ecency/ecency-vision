import { useState } from "react";
import { Button } from "@ui/button";
import { UserAvatar } from "@/features/shared";
import { NavbarSide, NavbarSideThemeSwitcher } from "@/features/shared/navbar/sidebar";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import { FullAccount } from "@/entities";
import i18next from "i18next";
import Image from "next/image";

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
          <Image
            alt="logo"
            className="user-avatar medium"
            src="/assets/logo-circle.svg"
            width={100}
            height={100}
          />
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
