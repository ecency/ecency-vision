import React, { useEffect, useState } from "react";
import { Modal } from "@ui/modal";
import { useTimeoutFn } from "react-use";
import { NavbarSideUserInfo } from "./navbar-side-user-info";
import { NavbarSideMainMenu } from "./navbar-side-main-menu";
import { Button } from "@ui/button";
import { NavbarPerksButton } from "../navbar-perks-button";
import { NavbarNotificationsButton } from "../navbar-notifications-button";
import { UilEditAlt } from "@iconscout/react-unicons";
import { classNameObject } from "@ui/util";
import { closeSvg } from "@ui/svg";
import { walletIconSvg } from "@ui/icons";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  placement?: "right" | "left";
}

export function NavbarSide({ show, setShow, placement = "right" }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [reset, show]);

  return (
    <Modal animation={false} show={show} onHide={() => setShow(false)} className="navbar-side">
      <div
        className={classNameObject({
          "h-full-dynamic overflow-y-auto no-scrollbar bg-white dark:bg-dark-700 absolute w-[20rem] top-0 bottom-0 duration-300":
            true,
          "right-0 rounded-l-2xl": placement === "right",
          "left-0 rounded-r-2xl": placement === "left"
        })}
        style={{
          transform: `translateX(${showAnimated ? 0 : 100 * (placement === "right" ? 1 : -1)}%)`
        }}
      >
        <div className="flex px-4 pt-4 pb-2 gap-4 items-center justify-between">
          <NavbarSideUserInfo />
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <div className="px-4 justify-between pb-2 flex items-center">
          <Button
            href="/submit"
            appearance="gray-link"
            icon={<UilEditAlt width={20} height={20} />}
          />
          <NavbarNotificationsButton onClick={() => setShow(false)} />
          <Button
            icon={walletIconSvg}
            size="sm"
            appearance="gray-link"
            href={`/@${activeUser?.username}/wallet`}
          />
        </div>
        <div className="px-4 pb-3">
          <NavbarPerksButton />
        </div>
        <NavbarSideMainMenu onHide={() => setShow(false)} />
      </div>
    </Modal>
  );
}
