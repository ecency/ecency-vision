import React, {Component} from "react";

import {History} from "history";

import {Link} from "react-router-dom";

import {EntryFilter, Global} from "../../store/global/types";
import {ActiveUser} from "../../store/active-user/types";

import DropDown, {MenuItem} from "../dropdown";
import ListStyleToggle from "../list-style-toggle";

import {_t} from "../../i18n";
import * as ls from "../../util/local-storage";
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

export enum IntroductionType {
    FRIENDS = 'FRIENDS',
    TRENDING = 'TRENDING',
    HOT = 'HOT',
    NEW = 'NEW',
    NONE = "NONE"
}

interface States {
    isGlobal: boolean;
    introduction:  IntroductionType;
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
        const { activeUser, history: { location: { pathname} }, global : { filter } } = props;
        let isGlobal = !pathname.includes('/my');
        if(activeUser && isActiveUser(activeUser) && pathname.includes(activeUser.username)){
            isGlobal = false;
        }
        let showInitialIntroductionJourney = activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
        if(activeUser && isActiveUser(activeUser) && (showInitialIntroductionJourney === 'false' || showInitialIntroductionJourney===null)){
            showInitialIntroductionJourney = true;
            ls.set(`${activeUser.username}HadTutorial`, 'true');
        }
        if(showInitialIntroductionJourney === true){
            showInitialIntroductionJourney = IntroductionType.FRIENDS
        }
        else {
            showInitialIntroductionJourney = IntroductionType.NONE
        }
        this.state = { isGlobal, introduction: showInitialIntroductionJourney };
        this.onChangeGlobal = this.onChangeGlobal.bind(this);
        if(showInitialIntroductionJourney === IntroductionType.NONE){
            if (typeof window !== 'undefined') {
                document.getElementById('overlay') && document.getElementById('overlay')!.classList.remove("overlay-for-introduction");
                document.getElementById('feed') && document.getElementById('feed')!.classList.remove("active");
                document.getElementById(filter) && document.getElementById(filter)!.classList.add("active");
                document.getElementsByTagName('ul') && document.getElementsByTagName('ul')[0]!.classList.remove("flash");
            }
        }
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
            let path = history.location.pathname + (tag.length > 0 ? "" : '/');
            path = path.replace('//',"/");
            history.push(path);
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

        let showInitialIntroductionJourney = activeUser && isActiveUser(activeUser) && ls.get(`${activeUser.username}HadTutorial`);
        if(prevProps.activeUser !==activeUser && activeUser && isActiveUser(activeUser) && (showInitialIntroductionJourney==='false' || showInitialIntroductionJourney===null)){
            showInitialIntroductionJourney = true;
            ls.set(`${activeUser.username}HadTutorial`, 'true');
            this.setState({introduction: showInitialIntroductionJourney ? IntroductionType.FRIENDS : IntroductionType.NONE})
        }
    }

    onClosePopup = () => {
        this.setState({introduction: IntroductionType.NONE})
    }

    getPopupTitle = () => {
        let value = '';
        switch(this.state.introduction){
            case IntroductionType.TRENDING:
                value = 'filter-trending';
                break;
            case IntroductionType.HOT:
                value = 'filter-hot';
                break;
            case IntroductionType.NEW:
                value = 'filter-created';
                break;
            case IntroductionType.FRIENDS:
                value = 'filter-feed-friends';
                break;
            default:
                value = value;

            }
        return _t(`entry-filter.${value}`)
    }

    onNextWeb = () => {
        let value: IntroductionType = this.state.introduction;
        switch(value){
            case IntroductionType.TRENDING:
                value = IntroductionType.HOT;
                break;
            case IntroductionType.HOT:
                value = IntroductionType.NEW;
                break;
            case IntroductionType.NEW:
                value = IntroductionType.NONE;
                break;
            default:
                value = value;
        } 
        this.setState({ introduction: value })
    }

    onNextMobile = () => {
        let value : IntroductionType = this.state.introduction;
        switch(value){
            case IntroductionType.TRENDING:
                value = IntroductionType.HOT;
                break;
            case IntroductionType.HOT:
                value = IntroductionType.NEW;
                break;
            case IntroductionType.FRIENDS:
                value = IntroductionType.TRENDING;
                break;
            case IntroductionType.NEW:
                value = IntroductionType.NONE;
                break;
            default:
                value = value;
        } 
        this.setState({ introduction: value })
    }

    onPreviousWeb = () => {
        const { activeUser } = this.props;
        let value: IntroductionType = this.state.introduction;
        switch(value){
            case IntroductionType.NEW:
                value = IntroductionType.HOT;
                break;
            case IntroductionType.HOT:
                value = IntroductionType.TRENDING;
                break;
            case IntroductionType.TRENDING:
                value = activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS: IntroductionType.NONE;
                break;
            default:
                value = value;
        } 
        this.setState({ introduction: value })
    }
    
    onPreviousMobile = () => {
        const { activeUser } = this.props;
        let value : IntroductionType = this.state.introduction;
        switch(value){
            case IntroductionType.NEW:
                value = IntroductionType.HOT;
                break;
            case IntroductionType.HOT:
                value = IntroductionType.TRENDING;
                break;
            case IntroductionType.TRENDING:
                value = activeUser && isActiveUser(activeUser) ? IntroductionType.FRIENDS: IntroductionType.NONE;
                break;
            case IntroductionType.FRIENDS:
                value = IntroductionType.NONE;
                break;
            default:
                value = value;
        } 
        this.setState({ introduction: value })
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
                        id: x,
                        flash: (x === 'trending' && introduction === IntroductionType.TRENDING) || (x === 'hot' && introduction === IntroductionType.HOT) || (x === 'created' && introduction === IntroductionType.NEW)
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

        const introductionDescription = <>
                                            {_t('entry-filter.filter-global-part1')}
                                            <span className="text-capitalize">
                                                {_t(`${this.getPopupTitle()}`)}
                                            </span>
                                            {(isGlobal || filter === "feed") ? _t('entry-filter.filter-global-part2') : _t('entry-filter.filter-global-part3')} 
                                            {!isGlobal && filter !== "feed" && <Link to='/communities'> {_t('discussion.btn-join')}</Link>}
                                            <Link to='/communities'> {_t('discussion.btn-join')} {_t('communities.title')}</Link>
                                        </>;
        const introductionOverlayClass = introduction === IntroductionType.NONE ? "d-none" : "overlay-for-introduction"

        return <div>
                    <div className={introductionOverlayClass} id="overlay"/>
                    <div className="entry-index-menu">
                        <div className="the-menu align-items-center">
                        {isActive &&
                            <div className="sub-menu mt-3 mt-md-0">
                                <ul className={`nav nav-pills position-relative nav-fill ${introduction === IntroductionType.NONE ? "" : introduction === IntroductionType.FRIENDS ? "flash" : ""}`}>
                                    <li className={`nav-item`}>
                                        <Link to={`/@${activeUser?.username}/feed`} className={_c(`nav-link my-link ${(filter === "feed" && (introduction === IntroductionType.NONE || introduction === IntroductionType.FRIENDS) ) ? "active" : ""}   ${introduction !== IntroductionType.NONE && introduction === IntroductionType.FRIENDS ? "active" : ""}`)} id='feed'>
                                            {_t("entry-filter.filter-feed-friends")}
                                        </Link>
                                    </li>
                                {introduction !== IntroductionType.NONE  && introduction === IntroductionType.FRIENDS && 
                                    <Introduction
                                        title={_t('entry-filter.filter-feed-friends')}
                                        media={OurVision}
                                        onNext={() => {
                                            let value = IntroductionType.TRENDING;
                                            this.setState({ introduction: value })}
                                        }
                                        onPrevious={() => {
                                            let value = IntroductionType.NONE;
                                            this.setState({ introduction: value })}
                                        }
                                        onClose={this.onClosePopup}
                                        description={introductionDescription}
                                    />
                                }
                                  </ul>
                            </div>
                        }
                        <div className='d-flex align-items-center'>

                            <div className="main-menu d-none d-lg-flex">
                                <div className="sm-menu position-relative">
                                    <DropDown {...menuConfig} float="left"/>
                                </div>
                                <div className="lg-menu position-relative">
                                    <ul className={`nav nav-pills nav-fill`}>
                                        {menuConfig.items.map((i, k) => {
                                            return <li key={k} className={`nav-item ${i.flash ? "flash" : ""}`}>
                                                <Link to={i.href!} className={_c(`nav-link link-${i.id} ${(introduction!==IntroductionType.NONE && !i.flash && i.active)?"":(i.active || i.flash) ? "active" : ""}`)} id={i.id}>{i.label}</Link>
                                            </li>
                                        })}
                                        {introduction !== IntroductionType.NONE && introduction !== IntroductionType.FRIENDS && (introduction === IntroductionType.HOT || introduction === IntroductionType.TRENDING || introduction === IntroductionType.NEW) &&
                                        <Introduction
                                            title={this.getPopupTitle()}
                                            media={OurVision}
                                            placement={introduction === IntroductionType.TRENDING ? "25%" :  introduction === IntroductionType.HOT ? "50%" : "75%"}
                                            onNext={this.onNextWeb}
                                            onPrevious={this.onPreviousWeb}
                                            onClose={this.onClosePopup}
                                            description={introductionDescription}
                                            showFinish={introduction === IntroductionType.NEW}
                                        />
                                }
                                    </ul>
                                </div>
                            </div>

                            <div className="main-menu d-flex d-lg-none">
                                <div className="sm-menu position-relative">
                                    <DropDown {...mobileMenuConfig} float="left"/>
                                    {introduction !== IntroductionType.NONE &&
                                        <Introduction
                                            title={this.getPopupTitle()}
                                            media={OurVision}
                                            onNext={this.onNextMobile}
                                            onPrevious={this.onPreviousMobile}
                                            onClose={this.onClosePopup}
                                            description={introductionDescription}
                                            showFinish={introduction === IntroductionType.NEW}
                                        />
                                    }
                                </div>
                                <div className="lg-menu position-relative">
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
                                    this.setState({ introduction: filter === 'feed' ? IntroductionType.FRIENDS : filter === 'trending' ? IntroductionType.TRENDING : filter === 'hot' ? IntroductionType.HOT : filter === 'created' ? IntroductionType.NEW : IntroductionType.NONE })
                                }
                            >
                                {informationVariantSvg}
                            </span>
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
