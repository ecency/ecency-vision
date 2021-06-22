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
import { informationVariantSvg } from "../../img/svg";
import { apiBase } from "../../api/helper";
import { Introduction } from "../introduction";

interface Props {
    history: History;
    global: Global;
    activeUser: ActiveUser | null;
    toggleListStyle: () => void;
}

interface States {
    isGlobal: boolean;
    introduction: string[];
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
        const { activeUser, history: { location: { pathname} }, global } = props;
        const { tag } = global;
        let isGlobal = !pathname.includes('/my');
        if(activeUser && isActiveUser(activeUser) && pathname.includes(activeUser.username)){
            isGlobal = false;
        }
        this.state = { isGlobal, introduction: [] };
        this.onChangeGlobal = this.onChangeGlobal.bind(this)
    }

    onChangeGlobal() {
        const { history, global : { tag, filter } } = this.props;
        this.setState({ isGlobal: !this.state.isGlobal });
        if(history.location.pathname.includes('/my')){
            history.push(history.location.pathname.replace('/my', ''))
        } else {
             filter!=='feed' && history.push('/' + filter + (tag.length > 0 ? "" : '/my'))
        }
    }

    componentDidUpdate(prevProps: Props){
        const { history, activeUser, global: { tag, filter } } = this.props;

        if(history.location.pathname.includes('/my') && !isActiveUser(activeUser)){
            history.push(history.location.pathname.replace('/my', ''))
        }
        else if(!isActiveUser(prevProps.activeUser) !== !isActiveUser(activeUser) && filter !== 'feed'){
            this.setState({isGlobal: tag.length > 0});
            history.push(history.location.pathname + (tag.length > 0 ? "" : '/my'));
        }
        else if(prevProps.global.tag !== tag && filter !== 'feed' && tag !== ""){
            let isGlobal = tag !== "my"
            this.setState({isGlobal})
        }
        else if(prevProps.global.filter !== 'feed' && prevProps.global.tag !== tag && filter !== 'feed' && tag === ""){
            if(prevProps.global.tag !== "my"){
                let isGlobal = false
                history.push(history.location.pathname + '/my');
                this.setState({ isGlobal })
            }
        }
    }

    render() {
        const { activeUser, global } = this.props;
        const { isGlobal, introduction } = this.state;
        const { filter } = global;
        const isMy = isMyPage(global, activeUser);
        const isActive = isActiveUser(activeUser);
        const OurVision = apiBase(`/assets/our-vision.${global.canUseWebp?"webp":"png"}`);

        const menuConfig: {
            history: History,
            label: string,
            items: MenuItem[]
        } = {
            history: this.props.history,
            label: isMy && filter === "feed" ? _t("entry-filter.filter-feed-friends") : _t(`entry-filter.filter-${filter}`),
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

        const mobileMenuConfig = !isActive ? menuConfig : {...menuConfig, items:[{
            label: _t(`entry-filter.filter-feed-friends`),
            href: `/@${activeUser?.username}/feed`,
            active: filter === 'feed',
            id: 'feed'
        }, ...menuConfig.items]}

        return <div>
                    {introduction.length > 0 &&  <div className="overlay"></div>}
                    <div className="entry-index-menu">
                        <div className="the-menu align-items-center">
                        {isActive &&
                            <div className="sub-menu mt-3 mt-md-0">
                                <ul className={`nav nav-pills position-relative nav-fill ${introduction.includes('feed') ? "flash" : ""}`}>
                                    <li className="nav-item">
                                        <Link to={`/@${activeUser?.username}/feed`} className={_c(`nav-link my-link ${filter === "feed" ? "active" : ""}`)}>
                                            {_t("entry-filter.filter-feed-friends")}
                                        </Link>
                                    </li>
                                {introduction.includes('feed') && 
                                    <Introduction
                                        title={_t('entry-filter.filter-trending')}
                                        media={OurVision}
                                        onClose={() => this.setState({introduction:[]})}
                                        description={<>{_t('entry-filter.filter-global-part1')}
                                        <span className="text-capitalize">
                                            {_t(`entry-filter.filter-${filter === 'feed' ? "trending" : filter}`)}
                                        </span>
                                        {(isGlobal || filter === "feed") ? _t('entry-filter.filter-global-part2') : _t('entry-filter.filter-global-part3')} 
                                        {!isGlobal && filter !== "feed" && <Link to='/communities'> {_t('discussion.btn-join')}</Link>}<Link to='/communities'> {_t('discussion.btn-join')} {_t('communities.title')}</Link></>}
                                    />
                                }
                                  </ul>
                                  
                            </div>
                        }
                        <div className='d-flex align-items-center'>

                            <div className="main-menu d-none d-lg-flex">
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

                            <div className="main-menu d-flex d-lg-none">
                                <div className="sm-menu">
                                    <DropDown {...mobileMenuConfig} float="left"/>
                                </div>
                                <div className="lg-menu">
                                    <ul className="nav nav-pills nav-fill">
                                        {mobileMenuConfig.items.map((i, k) => {
                                            return <li key={k} className="nav-item">
                                                <Link to={i.href!} className={_c(`nav-link link-${i.id} ${i.active ? "active" : ""}`)}>{i.label}</Link>
                                            </li>
                                        })}
                                    </ul>
                                </div>
                            </div>

                            {isActive && filter !== "feed" &&
                                <Form.Check
                                    id="check-isGlobal"
                                    type="checkbox"
                                    label={_t('entry-filter.filter-global')}
                                    name="isGlobal"
                                    className="d-flex align-items-center ml-3 ml-md-5 border-left pl-5"
                                    checked={isGlobal}
                                    onChange={this.onChangeGlobal}
                                    custom={true}
                                />
                            }
                            </div>
                        </div>
                        <div className="d-flex align-items-center ml-auto ml-md-0">
                            <span className="info-icon mr-0 mr-md-2"
                                onClick={() => 
                                    this.setState({ introduction: Array.from(new Set([...this.state.introduction, filter])) })
                                }
                            >
                                {informationVariantSvg}
                            </span>
                            {/* <OverlayTrigger
                                delay={{ show: 0, hide: 1500 }}
                                key={'bottom'}
                                placement={'bottom'}
                                overlay={
                                    <Tooltip id={`tooltip-${'bottom'}`}>
                                        {_t('entry-filter.filter-global-part1')}
                                        <span className="text-capitalize">
                                            {_t(`entry-filter.filter-${filter}`)}
                                        </span>
                                        {(isGlobal || filter === "feed") ? _t('entry-filter.filter-global-part2') : _t('entry-filter.filter-global-part3')} 
                                        {!isGlobal && filter !== "feed" && <Link to='/communities'> {_t('discussion.btn-join')}</Link>}
                                    </Tooltip>
                                }
                                >
                                <span className="info-icon mr-0 mr-md-2">{informationVariantSvg}</span>
                            </OverlayTrigger> */}
                            <ListStyleToggle global={this.props.global} toggleListStyle={this.props.toggleListStyle}/>
                        </div>
                    </div>
            </div>}
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
