import React, {Component} from 'react';

import {menuDownSvg} from '../../../svg';

interface MenuItem {
    label: string,
    href: string,
    active?: boolean
}

interface Props {
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

    mouseEnter = () => {
        this.setState({menu: true});
    };

    mouseLeave = () => {
        this.setState({menu: false});
    };

    render() {
        const {label, items} = this.props;
        // const {menu} = this.state;
        const menu = true;

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
