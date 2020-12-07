import React, {Component, Fragment} from "react";

import {History} from "history";

import {Modal, Button, FormControl} from "react-bootstrap";

import {Global} from "../../store/global/types";
import {Account} from "../../store/accounts/types";

import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";

import {getFollowing, getFollowers, getAccounts, getAccount} from "../../api/hive";
import {getRelationshipBetweenAccounts} from "../../api/bridge";

import {_t} from "../../i18n";
import accountReputation from "../../helper/account-reputation";
import {pencilOutlineSvg} from "../../img/svg";

interface Friend {
    name: string;
    fullName?: string;
    reputation: string | number;
}

interface ListProps {
    global: Global;
    history: History;
    account: Account;
    mode: "follower" | "following";
    addAccount: (data: Account) => void;
}

interface ListState {
    loading: boolean;
    data: Friend[];
    hasMore: boolean;
    search: string;
}

const loadLimit = 60;

export class List extends Component<ListProps, ListState> {
    state: ListState = {
        loading: false,
        data: [],
        hasMore: false,
        search: "",
    };

    _mounted: boolean = true;

    componentDidMount() {
        this.fetchFirst();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    fKey = () => {
        const {mode} = this.props;

        return mode === "following" ? "following" : "follower";
    };

    fetch = async (start = "", limit = loadLimit): Promise<Friend[]> => {
        const {account, mode} = this.props;

        const loadFn = (mode === "following" ? getFollowing : getFollowers);

        return loadFn(account.name, start, "blog", limit)
            .then((resp) => {
                const accountNames = resp.map((e) => e[this.fKey()]);
                return getAccounts(accountNames).then((resp2) => resp2);
            })
            .then((accounts) =>
                accounts.map((a) => ({
                    name: a.name,
                    fullName: a.profile?.name || "",
                    reputation: a.reputation!
                }))
            );
    };

    fetchFirst = async () => {
        this.stateSet({loading: true, data: [], hasMore: false});
        let data: Friend[];

        try {
            data = await this.fetch();
        } catch (e) {
            data = [];
        }

        this.stateSet({
            data,
            hasMore: data.length >= loadLimit,
            loading: false,
        });
    };

    fetchMore = async () => {
        const {data} = this.state;
        const lastItem = [...data].pop()!;
        const startUserName = lastItem.name;

        this.stateSet({loading: true});

        let moreData: Friend[];

        try {
            moreData = await this.fetch(startUserName);
        } catch (e) {
            moreData = [];
        }

        const newData = [...data, ...moreData.filter((a) => !data.find((b) => b.name === a.name))];

        this.stateSet({
            data: newData,
            hasMore: moreData.length >= loadLimit,
            loading: false,
        });
    };

    search = async () => {
        const {search} = this.state;

        if (!search) {
            return this.fetchFirst();
        }

        this.stateSet({loading: true});

        const {account, mode} = this.props;

        const follower = (mode === "following" ? account.name : search);
        const following = (mode === "following" ? search : account.name);

        let connection: boolean;
        let ac: Account | null = null;
        try {
            const resp = await getRelationshipBetweenAccounts(follower, following);
            connection = !!(resp && resp.follows);
            if (connection) {
                ac = await getAccount(search);
            }
        } catch (e) {
            connection = false;
        }

        const data: Friend[] = (connection && ac) ? [{
            name: ac.name,
            fullName: ac.profile?.name || "",
            reputation: ac.reputation!
        }] : [];

        this.stateSet({
            data,
            hasMore: false,
            loading: false,
        });
    };

    searchChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({search: e.target.value.trim()});
    };

    searchKeyDown = (e: React.KeyboardEvent) => {
        if (e.keyCode === 13) {
            this.search();
        }
    };

    render() {
        const {loading, data, hasMore, search} = this.state;

        return (
            <>
                <div className="friends-content">
                    {loading && (
                        <div className="loading">
                            <LinearProgress/>
                        </div>
                    )}
                    <div className="friends-list">
                        <div className="friend-search-box">
                            <FormControl
                                value={search}
                                disabled={loading}
                                placeholder={_t("friends.search-placeholder")}
                                onChange={this.searchChanged}
                                onKeyDown={this.searchKeyDown}
                            />
                        </div>

                        <div className="list-body">
                            {!loading && data.length === 0 && <div className="empty-list"> {_t("g.empty-list")}</div>}

                            {data.map((item) => (
                                <div className="list-item" key={item.name}>
                                    <div className="item-main">
                                        {ProfileLink({
                                            ...this.props,
                                            username: item.name,
                                            children: <>{UserAvatar({...this.props, username: item.name, size: "small"})}</>
                                        })}
                                        <div className="item-info">
                                            {ProfileLink({
                                                ...this.props,
                                                username: item.name,
                                                children: <a className="item-name notransalte">{item.name}</a>
                                            })}
                                            {(item?.reputation !== undefined) && <span className="item-reputation">{accountReputation(item.reputation)}</span>}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {data.length > 1 && !search && (
                        <div className="load-more">
                            <Button disabled={loading || !hasMore} onClick={this.fetchMore}>
                                {_t("g.load-more")}
                            </Button>
                        </div>
                    )}
                </div>
            </>
        );
    }
}

interface Props {
    global: Global;
    history: History;
    account: Account;
    addAccount: (data: Account) => void;
    onHide: () => void;
}

export class Followers extends Component<Props> {
    render() {
        const {account, onHide} = this.props;
        const title = _t("friends.followers", {n: account.follow_stats?.follower_count!});

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List {...this.props} mode="follower"/>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}

export class Following extends Component<Props> {
    render() {
        const {account, onHide} = this.props;
        const title = _t("friends.following", {n: account.follow_stats?.following_count!});

        return (
            <>
                <Modal onHide={onHide} show={true} centered={true} animation={false} size="lg">
                    <Modal.Header closeButton={true}>
                        <Modal.Title>{title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <List {...this.props} mode="following"/>
                    </Modal.Body>
                </Modal>
            </>
        );
    }
}
