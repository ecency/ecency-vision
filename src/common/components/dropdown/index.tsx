import React, { useState, useEffect } from "react";
import { History } from "history";

import { menuDownSvg } from "../../img/svg";
import _c from "../../util/fix-class-names";
import "./_index.scss";

export interface MenuItem {
  label: string | JSX.Element;
  href?: string;
  onClick?: () => void;
  selected?: boolean;
  flash?: boolean;
  disabled?: boolean;
  id?: string;
  icon?: JSX.Element;
  content?: JSX.Element;
  isStatic?: boolean;
}

interface MenuDownStyle {
  width: string;
  height: string;
}

interface Props {
  history: History | null;
  float: "left" | "right" | "none";
  alignBottom?: boolean;
  header?: string;
  preElem?: JSX.Element;
  postElem?: JSX.Element;
  icon?: JSX.Element;
  label: string | JSX.Element;
  items: MenuItem[];
  onShow?: () => void;
  onHide?: () => void;
  className?: string;
  withPadding?: boolean;
  menuHide?: boolean;
  noMarginTop?: boolean;
  style?: {
    width: string;
    height: string;
  };
}

const MyDropDown = (props: Props) => {
  const { menuHide = true, noMarginTop = false } = props;
  const [menu, setMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => {
      setMounted(false);
    };
  }, []);

  useEffect(() => {
    if (menu) {
      if (props?.onShow) {
        props.onShow();
      }
    } else {
      if (props?.onHide) {
        props.onHide();
      }
    }
  }, [menu]);

  let _timer: any = null;

  const mouseClick = () => {
    mouseIn();
  };

  const mouseEnter = () => {
    mouseIn();
  };

  const mouseIn = () => {
    if (_timer) {
      clearTimeout(_timer);
    }
    if (menu) {
      return;
    }
    showMenu();
  };

  const mouseOut = () => {
    _timer = setTimeout(() => {
      hideMenu();
    }, 300);
  };

  const showMenu = () => {
    setMenu(true);
  };

  const hideMenu = () => {
    setMenu(false);
  };

  const itemClicked = (i: MenuItem) => {
    if (menuHide) {
      hideMenu();
    }

    setTimeout(() => {
      if (i?.href) {
        props.history && props.history.push(i?.href);
      }

      if (i?.onClick) {
        i?.onClick();
      }
    }, 100);
  };

  const { label, float, items } = props;

  const menuDownStyle: MenuDownStyle = {
    width: "28px",
    height: "28px",
    ...(props.style && props.style) // Merge the passed style props if available
  };

  const child: JSX.Element =
    typeof label === "string" ? (
      <div className={_c(`dropdown-btn ${menu ? "hover" : ""}`)}>
        {label && <div className="label">{label}</div>}
        <div style={menuDownStyle} className="menu-down">
          {props?.icon || menuDownSvg}
        </div>
      </div>
    ) : (
      label
    );

  const menuCls = _c(
    `custom-dropdown float-${float} ${props.withPadding ? "with-padding" : ""} ${
      props?.alignBottom ? "align-bottom" : ""
    } ${props.className || ""}`
  );

  return mounted ? (
    <div
      className={menuCls.trim()}
      onClick={mouseClick}
      onMouseEnter={mouseEnter}
      onMouseLeave={mouseOut}
    >
      {child}

      {menu && (
        <div className="the-menu">
          <div className="menu-inner">
            {props?.header && <div className="menu-header">{props?.header}</div>}
            {props?.preElem && <div className="pre-elem">{props?.preElem as JSX.Element}</div>}
            <div className="menu-list">
              {items.map((i, k) => {
                return (
                  <div
                    {...{
                      label: i.label,
                      href: i.href,
                      onClick: i.onClick,
                      selected: i.selected,
                      flash: i.flash,
                      disabled: i.disabled,
                      id: i.id,
                      icon: i.icon,
                      content: i.content
                    }}
                    key={k}
                    className={`menu-item ${i.isStatic ? "static" : ""} ${
                      i?.selected ? "active" : ""
                    } ${noMarginTop ? "no-margin" : ""}`}
                    onClick={() => {
                      itemClicked(i);
                    }}
                  >
                    <span className="item-inner">
                      {i?.content ? (
                        i?.content
                      ) : i?.icon ? (
                        <span className="item-icon">{i?.icon as JSX.Element} </span>
                      ) : (
                        ""
                      )}
                      {i.label as string | JSX.Element}
                    </span>
                  </div>
                );
              })}
            </div>
            {props?.postElem && <div className="pre-elem">{props?.postElem as JSX.Element}</div>}
          </div>
        </div>
      )}
    </div>
  ) : null;
};

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    float: p.float,
    alignBottom: p?.alignBottom,
    header: p?.header,
    preElem: p?.preElem,
    postElem: p?.postElem,
    icon: p?.icon,
    label: p.label,
    items: p.items,
    onShow: p?.onShow,
    onHide: p?.onHide,
    className: p?.className,
    withPadding: p?.withPadding,
    menuHide: p?.menuHide,
    noMarginTop: p?.noMarginTop,
    style: p?.style
  };

  return <MyDropDown {...props} />;
};
