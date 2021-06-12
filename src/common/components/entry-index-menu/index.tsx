import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import {EntryFilter, Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import DropDown, {MenuItem} from "../dropdown";
import ListStyleToggle from "../list-style-toggle";

import {_t} from "../../i18n";

import _c from "../../util/fix-class-names"
import { Form } from "react-bootstrap";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    toggleListStyle: () => void;
}

interface States {
    isGlobal: boolean;
}

export const isMyPage = (global: Global, activeUser: ActiveUser | null) => {
    const {filter, tag} = global;
    return activeUser !== null &&
        (
            (activeUser.username === tag.replace("@", "") && filter === "feed") ||
            tag === "my"
        );
}

export const isActiveUser = ( activeUser: ActiveUser | null) => {
    return activeUser !== null;
}

export class EntryIndexMenu extends Component<Props, States> {
    constructor(props:Props){
        super(props)
        this.state={ isGlobal: !this.props.history.location.pathname.includes('/my') };
        this.onChange = this.onChange.bind(this)
    }

    onChange() {
        const { history } = this.props;
        this.setState({ isGlobal: !this.state.isGlobal });
        if(history.location.pathname.includes('/my')){
            history.push(history.location.pathname.replace('/my', ''))
        } else {
            history.push(history.location.pathname + '/my')
        }
    }

    componentDidUpdate(prevProps:Props){
        const { history, activeUser } = this.props;
        if(history.location.pathname.includes('/my') && !isActiveUser(activeUser)){
            history.push(history.location.pathname.replace('/my', ''))
        }
    }

    render() {
        const { activeUser, global } = this.props;
        const { isGlobal } = this.state;
        const { filter, tag } = global;

        const isMy = isMyPage(global, activeUser);
        const isActive = isActiveUser(activeUser);

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: isMy ? _t("entry-filter.filter-feed") : _t(`entry-filter.filter-${filter}`),
            items: [
                ...[EntryFilter.trending, EntryFilter.hot, EntryFilter.created].map((x) => {
                    return {
                        label: _t(`entry-filter.filter-${x}`),
                        href: isActive ? isGlobal ? `/${x}` : `/${x}/my` : `/${x}`,
                        active: filter === x || filter === x + '/my',
                        id: x
                    };
                }),
            ],
        };

        return <div className="entry-index-menu">
            <div className="the-menu">
               {isActive &&
                    <div className="sub-menu">
                        <ul className="nav nav-pills nav-fill">
                            <li className="nav-item">
                                <Link to={`/@${activeUser?.username}/feed`} className={_c(`nav-link link-my ${filter === "feed" ? "active" : ""}`)}>
                                    {_t("entry-filter.filter-feed-friends")}
                                </Link>
                            </li>
                        </ul>
                    </div>
                }
                <div className="main-menu">
                    <div className="sm-menu">
                        <DropDown {...menuConfig} float="left"/>
                    </div>
                    <div className="lg-menu">
                        <ul className="nav nav-pills nav-fill">
                            {menuConfig.items.map((i, k) => {
                                return <li key={k} className="nav-item">
                                    <Link to={i.href!} className={_c(`nav-link link-${i.id} ${i.active ? "active" : ""}`)}>{i.label}</Link>
                                </li>
                            })}
                        </ul>
                    </div>
                </div>
                {isActive && 
                    <Form.Check
                        id="check-isGlobal"
                        type="checkbox"
                        label="Global"
                        name="isGlobal"
                        className="d-flex align-items-center ml-5 border-left pl-5"
                        checked={isGlobal}
                        onChange={this.onChange}
                    />
                }
            </div>

            <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>
        </div>;
    }
}

export default (p: Props) => {
    const props = {
        history: p.history,
        global: p.global,
        activeUser: p.activeUser,
        toggleListStyle: p.toggleListStyle
    }

    return <EntryIndexMenu {...props} />
}
