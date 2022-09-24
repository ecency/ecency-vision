import React from "react";

import {Modal} from "react-bootstrap";

import {FormControl} from "react-bootstrap";

import isEqual from "react-fast-compare";

import {ActiveUser} from "../../store/active-user/types";
import {Community} from "../../store/communities/types";
import {Global} from "../../store/global/types";
import {Subscription} from "../../store/subscriptions/types";

import BaseComponent from "../base";
import UserAvatar from "../user-avatar/index";

import {_t} from "../../i18n";

import isCommunity from "../../helper/is-community";

import {getCommunities, getCommunity, getSubscriptions} from "../../api/bridge";

import {menuDownSvg} from "../../img/svg";

interface BrowserProps {
    global: Global;
    activeUser: ActiveUser;
    onSelect: (name: string | null) => void;
    onHide: () => void;
}

interface BrowserState {
    subscriptions: Subscription[],
    query: string,
    results: Community[]
}

export class Browser extends BaseComponent<BrowserProps, BrowserState> {
    state: BrowserState = {
        subscriptions: [],
        query: "",
        results: [],
    }

    _timer: any = null;

    componentDidMount() {
        this.fetchSubscriptions().then();
        document.getElementById("search-communities-input")?.focus()
    }

    fetchSubscriptions = () => {
        const {activeUser} = this.props;
        return getSubscriptions(activeUser.username).then(subscriptions => {
            if (subscriptions) {
                this.stateSet({subscriptions})
            }
        })
    }

    queryChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.stateSet({query: e.target.value}, () => {
            this._timer = setTimeout(() => {
                this.search();
            }, 200);
        });
    }

    search = () => {
        const {query} = this.state;

        getCommunities("", 14, query, "rank")
            .then((results) => {
                if (results) {
                    this.stateSet({results});
                }
            })
    }

    render() {
        const {activeUser, onSelect, onHide} = this.props;
        const {subscriptions, results, query} = this.state;

        const search = <div className="search">
            <FormControl type="text" size="sm" placeholder={_t("community-selector.search-placeholder")} value={query} onChange={this.queryChanged} id="search-communities-input" spellCheck={true} />
        </div>

        if (query) {
            return <div className="browser">
                {search}

                <div className="browser-list">
                    <div className="list-body">
                        {results.length > 0 && (
                            <>
                                {results.map(x => <a key={x.name} href="#" className="list-item" onClick={(e) => {
                                    e.preventDefault();
                                    onSelect(x.name);
                                    onHide();
                                }}>
                                    <div className="item-main">
                                        {UserAvatar({...this.props, username: x.name, size: "small"})}
                                        <div className="item-info">
                                            <span className="item-name notransalte">{x.title}</span>
                                        </div>
                                    </div>
                                </a>)}
                            </>
                        )}
                        {results.length === 0 && <div className="empty-list">{_t("g.empty-list")}</div>}
                    </div>
                </div>
            </div>
        }

        return <div className="browser">
            {search}

            <div className="browser-list">
                <div className="list-body">
                    <a href="#" className="list-item" onClick={(e) => {
                        e.preventDefault();
                        onSelect(null);
                        onHide();
                    }}>
                        <div className="item-main">
                            {UserAvatar({...this.props, username: activeUser.username, size: "small"})}
                            <div className="item-info">
                                <span className="item-name notransalte">{_t("community-selector.my-blog")}</span>
                            </div>
                        </div>
                    </a>

                    {subscriptions.length > 0 && (
                        <>
                            {subscriptions.map(x => <a href="#" key={x[0]} className="list-item" onClick={(e) => {
                                e.preventDefault();
                                onSelect(x[0]);
                                onHide();
                            }}>
                                <div className="item-main">
                                    {UserAvatar({...this.props, username: x[0], size: "small"})}
                                    <div className="item-info">
                                        <span className="item-name notransalte">{x[1]}</span>
                                    </div>
                                </div>
                            </a>)}
                        </>
                    )}
                </div>
            </div>
        </div>;
    }
}

interface Props {
    global: Global;
    activeUser: ActiveUser;
    tags: string[],
    onSelect: (prev: string | null, next: string | null) => void;
}

interface State {
    community: Community | null;
    visible: boolean;
    picked: boolean
}

export class CommunitySelector extends BaseComponent<Props, State> {
    state: State = {
        community: null,
        visible: false,
        picked: false
    }

    componentDidMount() {
        this.detectCommunity().then();
    }

    componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
        if (!isEqual(this.props.tags, prevProps.tags)) {
            if(this.props.tags.length > 0){
                this.setState({ picked: false });
            }
            this.detectCommunity().then();
        }
    }

    extractCommunityName = (): string | null => {
        const {tags} = this.props;
        const [tag,] = tags;

        if (!tag) {
            return null;
        }

        if (!isCommunity(tag)) {
            return null;
        }

        return tag;
    }

    detectCommunity = async () => {
        const name = this.extractCommunityName();

        if (!name) {
            this.stateSet({community: null});
            return
        }

        let community: Community | null;

        try {
            community = await getCommunity(name);
        } catch (e) {
            community = null;
        }

        this.stateSet({community});
    }

    toggle = () => {
        const {visible} = this.state;
        this.stateSet({visible: !visible});
    }

    render() {
        const {activeUser, tags, onSelect} = this.props;
        const {community, visible, picked} = this.state;

        let content;
        if (community) {
            content = <>
                {UserAvatar({...this.props, username: community.name, size: "small"})}
                <span className="label">{community.title}</span> {menuDownSvg}
            </>;
        } else {

            if (tags.length > 0 || picked) {
                content = <>
                    {UserAvatar({...this.props, username: activeUser.username, size: "small"})}
                    <span className="label">{_t("community-selector.my-blog")}</span> {menuDownSvg}
                </>
            } else {
                content = <><span className="label">{_t("community-selector.choose")}</span> {menuDownSvg}</>
            }
        }

        return <>
            <a href="#" className="community-selector" onClick={(e) => {
                e.preventDefault();
                this.toggle();
            }}>{content}</a>

            {visible && (
                <Modal onHide={this.toggle} show={true} centered={true} animation={false} className="community-selector-modal" >
                    <Modal.Header closeButton={true}/>

                    <Modal.Body >
                        <Browser {...this.props} onHide={this.toggle} onSelect={(name: string | null) => {
                            const prev = this.extractCommunityName();
                            onSelect(prev, name);
                            this.stateSet({picked: true});
                        }}/>
                    </Modal.Body>
                </Modal>
            )}
        </>
    }
}

export default (p: Props) => {
    const props: Props = {
        global: p.global,
        activeUser: p.activeUser,
        tags: p.tags,
        onSelect: p.onSelect
    };

    return <CommunitySelector {...props} />
}
