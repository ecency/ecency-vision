import { Modal } from "@ui/modal";
import React, { useEffect, useState } from "react";
import { useTimeoutFn } from "react-use";
import { _t } from "../../i18n";
import {
  UilCloudComputing,
  UilColumns,
  UilCommentPlus,
  UilUsersAlt,
  UilUserSquare
} from "@iconscout/react-unicons";
import { NavbarSideMainMenuItem } from "./sidebar/navbar-side-main-menu-item";
import { History } from "history";
import * as pack from "../../../../package.json";
import SwitchLang from "../switch-lang";
import { NavbarSideThemeSwitcher } from "./sidebar/navbar-side-theme-switcher";
import { closeSvg } from "../../img/svg";
import { Button } from "@ui/button";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  history: History;
  setStepOne?: () => void;
}

export function NavbarMainSidebar({ show, setShow, history, setStepOne }: Props) {
  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [show]);

  const onLogoClick = () => {
    if (
      "/" !== location.pathname ||
      location.pathname?.startsWith("/hot") ||
      location.pathname?.startsWith("/created") ||
      location.pathname?.startsWith("/trending")
    ) {
      history.push("/");
    }
    setStepOne?.();
  };

  return (
    <Modal animation={false} show={show} onHide={() => setShow(false)} className="navbar-side">
      <div
        className="h-full-dynamic overflow-y-auto no-scrollbar bg-white dark:bg-dark-700 absolute left-0 w-[20rem] rounded-r-2xl top-0 bottom-0 duration-300"
        style={{
          transform: `translateX(${showAnimated ? 0 : -100}%)`
        }}
      >
        <div className="px-4 py-3 mt-[2px] flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-[40px] w-[40px] shrink-0 cursor-pointer">
              <img
                src={require("../../img/logo-circle.svg")}
                className="h-[40px] w-[40px]"
                alt="Logo"
                onClick={onLogoClick}
              />
            </div>
            <NavbarSideThemeSwitcher />
          </div>
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <div className="px-4 py-6 flex flex-col gap-0.5">
          <NavbarSideMainMenuItem
            label={_t("navbar.discover")}
            to="/discover"
            onClick={() => setShow(false)}
            icon={<UilUsersAlt size={16} />}
          />
          <NavbarSideMainMenuItem
            label={_t("navbar.communities")}
            to="/communities"
            onClick={() => setShow(false)}
            icon={<UilUserSquare size={16} />}
          />
          <NavbarSideMainMenuItem
            label={_t("navbar.decks")}
            to="/decks"
            onClick={() => setShow(false)}
            icon={<UilColumns size={16} />}
          />

          <NavbarSideMainMenuItem
            label={_t("proposals.page-title")}
            to="/proposals"
            onClick={() => setShow(false)}
            icon={<UilCommentPlus size={16} />}
          />
          <NavbarSideMainMenuItem
            label={_t("witnesses.page-title")}
            to="/witnesses"
            onClick={() => setShow(false)}
            icon={<UilCloudComputing size={16} />}
          />

          <hr className="my-2" />
          <div className="text-xs">
            <NavbarSideMainMenuItem
              label={_t("entry-index.faq")}
              to="/faq"
              onClick={() => setShow(false)}
            />
            <NavbarSideMainMenuItem
              label={_t("entry-index.tos")}
              to="/terms-of-service"
              onClick={() => setShow(false)}
            />
            <NavbarSideMainMenuItem
              label={_t("entry-index.pp")}
              to="/privacy-policy"
              onClick={() => setShow(false)}
            />
          </div>
          <div className="p-4 items-center flex justify-between">
            <span className="text-xs opacity-50">v{pack.version}</span>
            <SwitchLang history={history} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
