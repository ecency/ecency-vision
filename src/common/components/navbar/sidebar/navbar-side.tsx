import React, { useEffect, useState } from "react";
import { Modal } from "@ui/modal";
import { useTimeoutFn } from "react-use";
import { NavbarSideUserInfo } from "./navbar-side-user-info";
import { NavbarSideMainMenu } from "./navbar-side-main-menu";
import { History } from "history";
import { Button } from "@ui/button";
import { closeSvg } from "../../../img/svg";
import { NavbarSideThemeSwitcher } from "./navbar-side-theme-switcher";
import SwitchLang from "../../switch-lang";
import { NavbarPerksButton } from "../navbar-perks-button";
import { walletIconSvg } from "../../decks/icons";
import { useMappedStore } from "../../../store/use-mapped-store";
import * as pack from "../../../../../package.json";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  history: History;
}

export function NavbarSide({ show, setShow, history }: Props) {
  const { activeUser } = useMappedStore();

  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [show]);

  return (
    <Modal animation={false} show={show} onHide={() => setShow(false)} className="navbar-side">
      <div
        className="h-full-dynamic overflow-y-auto no-scrollbar bg-white dark:bg-dark-700 absolute right-0 w-[20rem] rounded-l-2xl top-0 bottom-0 duration-300"
        style={{
          transform: `translateX(${showAnimated ? 0 : 100}%)`
        }}
      >
        <div className="flex p-4 gap-4 items-center justify-between">
          <NavbarSideUserInfo history={history} />
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <div className="px-4 justify-between gap-4 pb-4 flex items-center">
          <NavbarSideThemeSwitcher />
          <NavbarPerksButton />
          <Button
            icon={walletIconSvg}
            size="sm"
            appearance="gray-link"
            to={`/@${activeUser?.username}/wallet`}
          />
        </div>
        <NavbarSideMainMenu history={history} onHide={() => setShow(false)} />
        <div className="p-4 items-center flex justify-between">
          <span className="text-xs opacity-50">v{pack.version}</span>
          <SwitchLang history={history} />
        </div>
      </div>
    </Modal>
  );
}
