import React, { Component } from "react";
import { History } from "history";

import { menuDownSvg } from "../../img/svg";

interface MenuItem {
  label: string;
  href: string;
  active?: boolean;
}

interface Props {
  history: History;
  label: string;
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
    this.setState({ menu: true });
  };

  hideMenu = () => {
    this.setState({ menu: false });
  };

  itemClicked = (i: MenuItem) => {
    this.hideMenu();

    setTimeout(() => {
      const { history } = this.props;
      history.push(i.href);
    }, 510); // wait until menu transition ends (0.5s)
  };

  render() {
    const { label, items } = this.props;
    const { menu } = this.state;

    return (
      <div className="custom-dropdown" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
        <div className={`dropdown-btn ${menu ? "hover" : ""}`}>
          <div className="label">{label}</div>
          <div className="menu-down">{menuDownSvg}</div>
        </div>

        {menu && (
          <div className="the-menu">
            <div className="menu-inner">
              <div className="menu-list">
                {items.map((i, k) => {
                  return (
                    <div
                      key={k}
                      className={`menu-item ${i.active ? "active" : ""}`}
                      onClick={() => {
                        this.itemClicked(i);
                      }}
                    >
                      <span className="item-inner">{i.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}
