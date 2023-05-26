import { createPortal } from "react-dom";
import { useMounted } from "../../util/use-mounted";
import React, { useRef, useState } from "react";
import { usePopper } from "react-popper";
import useClickAway from "react-use/lib/useClickAway";
import "./_index.scss";
import { Button } from "react-bootstrap";

interface Props {
  toggle: JSX.Element;
  children: JSX.Element;
}

export const PopperDropdown = ({ children, toggle }: Props) => {
  const isMounted = useMounted();

  const [isShow, setIsShow] = useState(false);
  const hostRef = useRef<any>(null);
  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const { styles, attributes, update } = usePopper(host, popperElement);

  useClickAway(hostRef, () => hide());

  const show = () => {
    setIsShow(true);
    update?.();
  };

  const hide = () => {
    setIsShow(false);
    update?.();
  };

  return (
    <div className="popper-dropdown dropdown">
      <Button ref={setHost} variant="link" onClick={() => (isShow ? hide() : show())}>
        {toggle}
      </Button>
      {isMounted &&
        createPortal(
          isShow && (
            <div
              className="popper-dropdown-menu"
              style={styles.popper}
              {...attributes.popper}
              ref={setPopperElement}
            >
              <div ref={hostRef}>{children}</div>
            </div>
          ),
          document.querySelector("#popper-container")!!
        )}
    </div>
  );
};
