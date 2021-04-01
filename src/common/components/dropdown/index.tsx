import React, {Component} from "react";
import {History} from "history";

import {menuDownSvg} from "../../img/svg";

import _c from "../../util/fix-class-names"

export interface MenuItem {
    label: string;
    href?: string;
    onClick?: () => void;
    active?: boolean;
    id?: string;
    icon?: JSX.Element
}

interface Props {
    history: History;
    float: "left" | "right";
    alignBottom?: boolean,
    header?: string;
    preElem?: JSX.Element;
    postElem?: JSX.Element;
    icon?: JSX.Element;
    label: string | JSX.Element;
    items: MenuItem[];
    onShow?: () => void;
    onHide?: () => void;
}

interface State {
    menu: boolean;
}

export default class MyDropDown extends Component<Props> {
    state: State = {
        menu: false,
    };

    _timer: any = null;

    mouseClick = () => {
        this.mouseIn();
    };

    mouseEnter = () => {
        this.mouseIn();
    };

    mouseIn = () => {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        const {menu} = this.state;
        if (menu) {
            return;
        }

        this.showMenu();
    }

    mouseOut = () => {
        this._timer = setTimeout(() => {
            this.hideMenu();
        }, 300);
    };

    showMenu = () => {
        this.setState({menu: true}, () => {
            const {onShow} = this.props;
            if (onShow) {
                onShow();
            }
        });
    };

    hideMenu = () => {
        this.setState({menu: false}, () => {
            const {onHide} = this.props;
            if (onHide) {
                onHide();
            }
        });
    };

    itemClicked = (i: MenuItem) => {
        this.hideMenu();

        setTimeout(() => {
            if (i.href) {
                const {history} = this.props;
                history.push(i.href);
            }

            if (i.onClick) {
                i.onClick();
            }
        }, 100);
    };

    render() {
        const {label, icon, float, alignBottom, header, preElem, postElem, items} = this.props;
        const {menu} = this.state;

        const child =
            typeof label === "string" ? (
                <div className={_c(`dropdown-btn ${menu ? "hover" : ""}`)}>
                    {label && <div className="label">{label}</div>}
                    <div className="menu-down">{icon || menuDownSvg}</div>
                </div>
            ) : (
                label
            );

        const menuCls = _c(`custom-dropdown float-${float} ${alignBottom ? "align-bottom" : ""}`);

        return (
            <div
                className={menuCls}
                onClick={this.mouseClick}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseOut}
            >
                {child}

                {menu && (
                    <div className="the-menu">
                        <div className="menu-inner">
                            {header && <div className="menu-header">{header}</div>}
                            {preElem && <div className="pre-elem">{preElem}</div>}
                            <div className="menu-list">
                                {items.map((i, k) => {
                                    return (
                                        <div
                                            key={k}
                                            className={`menu-item ${i.active === true ? "active" : ""}`}
                                            onClick={() => {
                                                this.itemClicked(i);
                                            }}
                                        >
                                            <span className="item-inner">
                                                {i.icon ? <span className="item-icon">{i.icon}{" "}</span> : ""}{i.label}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                            {postElem && <div className="pre-elem">{postElem}</div>}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
