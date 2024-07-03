import { Modal } from "@ui/modal";
import { useEffect, useState } from "react";
import { useTimeoutFn } from "react-use";
import {
  UilCloudComputing,
  UilColumns,
  UilCommentPlus,
  UilHome,
  UilListUl,
  UilUsersAlt,
  UilUserSquare
} from "@iconscout/react-unicons";
import { NavbarSideMainMenuItem } from "./sidebar/navbar-side-main-menu-item";
import pack from "../../../../package.json";
import { NavbarSideThemeSwitcher } from "./sidebar/navbar-side-theme-switcher";
import { Button } from "@ui/button";
import i18next from "i18next";
import { closeSvg } from "@ui/svg";
import { SwitchLang } from "@/features/shared";
import { Search } from "@/features/shared/navbar/search";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  setStepOne?: () => void;
}

export function NavbarMainSidebar({ show, setShow, setStepOne }: Props) {
  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);
  const router = useRouter();

  useEffect(() => {
    reset();
  }, [reset, show]);

  const onLogoClick = () => {
    if (
      "/" !== location.pathname ||
      location.pathname?.startsWith("/hot") ||
      location.pathname?.startsWith("/created") ||
      location.pathname?.startsWith("/trending")
    ) {
      router.push("/");
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
              <Image
                src="/public/assets/img/logo-circle.svg"
                alt="Logo"
                className="h-[40px] w-[40px]"
                onClick={onLogoClick}
                width={40}
                height={40}
              />
            </div>
            <NavbarSideThemeSwitcher />
          </div>
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <div className="px-4 py-6 flex flex-col gap-0.5">
          <Search />
          <hr className="my-2" />
          <NavbarSideMainMenuItem
            label={i18next.t("navbar.home")}
            onClick={() => {
              setShow(false);
              onLogoClick();
            }}
            icon={<UilHome size={16} />}
          />
          <NavbarSideMainMenuItem
            label={i18next.t("navbar.discover")}
            to="/discover"
            onClick={() => setShow(false)}
            icon={<UilUsersAlt size={16} />}
          />
          <NavbarSideMainMenuItem
            label={i18next.t("navbar.communities")}
            to="/communities"
            onClick={() => setShow(false)}
            icon={<UilUserSquare size={16} />}
          />
          <NavbarSideMainMenuItem
            label={i18next.t("navbar.decks")}
            to="/decks"
            onClick={() => setShow(false)}
            icon={<UilColumns size={16} />}
          />

          <NavbarSideMainMenuItem
            label={i18next.t("proposals.page-title")}
            to="/proposals"
            onClick={() => setShow(false)}
            icon={<UilCommentPlus size={16} />}
          />
          <NavbarSideMainMenuItem
            label={i18next.t("witnesses.page-title")}
            to="/witnesses"
            onClick={() => setShow(false)}
            icon={<UilCloudComputing size={16} />}
          />
          <NavbarSideMainMenuItem
            label={i18next.t("switch-lang.contributors")}
            to="/contributors"
            onClick={() => setShow(false)}
            icon={<UilListUl size={16} />}
          />

          <hr className="my-2" />
          <div className="text-xs">
            <NavbarSideMainMenuItem
              label={i18next.t("entry-index.faq")}
              to="/faq"
              onClick={() => setShow(false)}
            />
            <NavbarSideMainMenuItem
              label={i18next.t("entry-index.tos")}
              to="/terms-of-service"
              onClick={() => setShow(false)}
            />
            <NavbarSideMainMenuItem
              label={i18next.t("entry-index.pp")}
              to="/privacy-policy"
              onClick={() => setShow(false)}
            />
          </div>
          <div className="p-4 items-center flex justify-between">
            <span className="text-xs opacity-50">v{pack.version}</span>
            <SwitchLang />
          </div>
        </div>
      </div>
    </Modal>
  );
}
