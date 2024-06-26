import React, { useEffect, useState } from "react";
import { Modal } from "@ui/modal";
import { useTimeoutFn } from "react-use";
import { NavbarSideUserInfo } from "./navbar-side-user-info";
import { NavbarSideMainMenu } from "./navbar-side-main-menu";
import { History } from "history";
import { Button } from "@ui/button";
import { closeSvg } from "../../../img/svg";
import { NavbarPerksButton } from "../navbar-perks-button";
import { useMappedStore } from "../../../store/use-mapped-store";
import { NavbarNotificationsButton } from "../navbar-notifications-button";
import { UilEditAlt } from "@iconscout/react-unicons";
import { classNameObject } from "../../../helper/class-name-object";
import { walletIconSvg } from "../../../features/decks/icons";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  history: History;
  placement?: "right" | "left";
}

export function NavbarSide({ show, setShow, history, placement = "right" }: Props) {
  const { activeUser } = useMappedStore();

  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [show]);

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
          <NavbarSideUserInfo history={history} />
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <div className="px-4 justify-between pb-2 flex items-center">
          <Button to="/submit" appearance="gray-link" icon={<UilEditAlt />} />
          <NavbarNotificationsButton onClick={() => setShow(false)} />
          <Button
            icon={walletIconSvg}
            size="sm"
            appearance="gray-link"
            to={`/@${activeUser?.username}/wallet`}
          />
        </div>
        <div className="px-4 pb-3">
          <NavbarPerksButton />
        </div>
        <NavbarSideMainMenu history={history} onHide={() => setShow(false)} />
      </div>
    </Modal>
  );
}
