import React, {Component} from "react";
import {History} from "history";

import {menuDownSvg} from "../../img/svg";

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
    header?: string;
    preElem?: JSX.Element;
    postElem?: JSX.Element;
    icon?: JSX.Element;
    label: string | JSX.Element;
    items: MenuItem[];
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
        const {menu} = this.state;
        if (menu) {
            return;
        }

        if (this._timer) {
            clearTimeout(this._timer);
        }

        this.showMenu();
    };

    mouseEnter = () => {
        this._timer = setTimeout(() => {
            this.showMenu();
        }, 500);
    };

    mouseLeave = () => {
        if (this._timer) {
            clearTimeout(this._timer);
        }

        this.hideMenu();
    };

    showMenu = () => {
        this.setState({menu: true});
    };

    hideMenu = () => {
        this.setState({menu: false});
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
        const {label, icon, float, header, preElem, postElem, items} = this.props;
        const {menu} = this.state;

        const child =
            typeof label === "string" ? (
                <div className={`dropdown-btn ${menu ? "hover" : ""}`}>
                    {label && <div className="label">{label}</div>}
                    <div className="menu-down">{icon || menuDownSvg}</div>
                </div>
            ) : (
                label
            );

        return (
            <div
                className={`custom-dropdown float-${float}`}
                onClick={this.mouseClick}
                onMouseEnter={this.mouseEnter}
                onMouseLeave={this.mouseLeave}
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
