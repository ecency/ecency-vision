import React, { useEffect, useState } from "react";
import { Modal } from "@ui/modal";
import { useTimeoutFn } from "react-use";
import { NavbarSideUserInfo } from "./navbar-side-user-info";
import { NavbarSideMainMenu } from "./navbar-side-main-menu";
import { History } from "history";
import { Button } from "@ui/button";
import { closeSvg } from "../../img/svg";

interface Props {
  show: boolean;
  setShow: (v: boolean) => void;
  history: History;
}

export function NavbarSide({ show, setShow, history }: Props) {
  const [showAnimated, setShowAnimated] = useState(false);
  const [isReady, cancel, reset] = useTimeoutFn(() => setShowAnimated(show), 100);

  useEffect(() => {
    reset();
  }, [show]);

  return (
    <Modal
      animation={false}
      show={show}
      onHide={() => setShow(false)}
      className="navbar-side overflow-hidden"
    >
      <div
        className="bg-white dark:bg-dark-700 absolute right-0 w-[20rem] rounded-l-2xl top-0 bottom-0 duration-300"
        style={{
          transform: `translateX(${showAnimated ? 0 : 100}%)`
        }}
      >
        <div className="flex p-4 gap-4 items-center justify-between">
          <NavbarSideUserInfo />
          <Button icon={closeSvg} size="sm" appearance="gray-link" onClick={() => setShow(false)} />
        </div>
        <NavbarSideMainMenu history={history} />
      </div>
    </Modal>
  );
}
