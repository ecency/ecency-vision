import React, {Component} from 'react';
import {History} from 'history';

import {menuDownSvg} from '../../../svg';

interface MenuItem {
    label: string,
    href: string,
    active?: boolean
}

interface Props {
    history: History,
    label: string,
    items: MenuItem[]
}

interface State {
    menu: boolean
}

export default class MyDropDown extends Component<Props> {
    state: State = {
        menu: false
    };

    timer: any = null;

    mouseEnter = () => {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }

        this.setState({menu: true});
    };

    mouseLeave = () => {
        this.timer = setTimeout(() => {
            this.setState({menu: false});
        }, 500);
    };

    itemClicked = (i: MenuItem) => {
        const {history} = this.props;
        history.push(i.href);
        this.setState({menu: false});
    };

    render() {
        const {label, items} = this.props;
        const {menu} = this.state;

        return (
            <div className="custom-dropdown" onMouseEnter={this.mouseEnter} onMouseLeave={this.mouseLeave}>
                <div className={`dropdown-btn ${menu ? 'hover' : ''}`}>
                    <div className="label">{label}</div>
                    <div className="menu-down">{menuDownSvg}</div>
                </div>

                {menu && (
                    <div className="the-menu">
                        <div className="menu-inner">
                            <div className="menu-list">
                                {items.map((i, k) => {
                                    return <div key={k}
                                                className={`menu-item ${i.active ? 'active' : ''}`}
                                                onClick={() => {
                                                    this.itemClicked(i);
                                                }}
                                    ><span className="item-inner">{i.label}</span></div>
                                })}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        )
    }
}
