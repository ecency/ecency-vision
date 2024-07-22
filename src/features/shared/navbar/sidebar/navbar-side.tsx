import React from "react";
import { NavbarSideUserInfo } from "./navbar-side-user-info";
import { NavbarSideMainMenu } from "./navbar-side-main-menu";
import { Button } from "@ui/button";
import { NavbarPerksButton } from "../navbar-perks-button";
import { NavbarNotificationsButton } from "../navbar-notifications-button";
import { UilEditAlt } from "@iconscout/react-unicons";
import { closeSvg } from "@ui/svg";
import { walletIconSvg } from "@ui/icons";
import { useGlobalStore } from "@/core/global-store";
import { ModalSidebar } from "@ui/modal/modal-sidebar";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  placement?: "right" | "left";
}

export function NavbarSide({ show, setShow, placement = "right" }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  return (
    <ModalSidebar show={show} setShow={setShow} placement={placement}>
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
    </ModalSidebar>
  );
}
