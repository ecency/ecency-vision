import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {Link} from "react-router-dom";

import {Button, Form, FormControl, Modal, Spinner} from "react-bootstrap";

import base58 from "bs58";

import numeral from "numeral";

import queryString from "query-string";

import {PrivateKey, cryptoUtils, AccountCreateOperation, Authority} from "@hiveio/dhive";

import {Community} from "../store/communities/types";
import {User} from "../store/users/types";

import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";
import KeyOrHot from "../components/key-or-hot";
import LoginRequired from "../components/login-required";
import Feedback from "../components/feedback";
import {error} from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";

import {_t} from "../i18n";

import {getAccount} from "../api/hive";
import {getCommunities, getSubscriptions} from "../api/bridge";
import {formatError, updateCommunity, setUserRole} from "../api/operations";
import {hsTokenRenew} from "../api/private";

import {client} from "../api/hive";

import {makeHsCode} from "../helper/hive-signer";
import parseAsset from "../helper/parse-asset";
import defaults from "../constants/defaults.json";

import random from "../util/rnd";

import {checkSvg, alertCircleSvg} from "../img/svg";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

const hs = require("hivesigner");

interface State {
    list: Community[];
    loading: boolean;
    query: string;
    sort: string;
}

class CommunitiesPage extends Component<PageProps, State> {
    state: State = {
        list: [],
        loading: true,
        query: "",
        sort: "hot",
    };

    _timer: any = null;
    _mounted: boolean = true;

    componentDidMount() {
        this.fetch();

        const {activeUser, subscriptions, updateSubscriptions} = this.props;
        if (activeUser && subscriptions.length === 0) {
            getSubscriptions(activeUser.username).then(r => {
                if (r) updateSubscriptions(r);
            });
        }
    }

    componentDidUpdate(prevProps: Readonly<PageProps>) {
        const {activeUser, updateSubscriptions} = this.props;
        if (prevProps.activeUser?.username !== activeUser?.username) {
            if (activeUser) {
                getSubscriptions(activeUser.username).then(r => {
                    if (r) updateSubscriptions(r);
                });
            }
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    fetch = () => {
        const {query, sort} = this.state;
        this.stateSet({loading: true});

        getCommunities("", 100, query, (sort === "hot" ? "rank" : sort))
            .then((r) => {
                if (r) {
                    const list = sort === "hot" ? r.sort(() => Math.random() - 0.5) : r;
                    this.stateSet({list});
                }
            })
            .finally(() => {
                this.stateSet({loading: false});
            });
    };

    queryChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        if (this._timer) {
            clearTimeout(this._timer);
            this._timer = null;
        }

        this.stateSet({query: e.target.value}, () => {
            this._timer = setTimeout(() => {
                this.fetch();
            }, 1000);
        });
    };

    sortChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>) => {
        this.stateSet({sort: e.target.value}, (): void => {
            this.fetch();
        });
    };

    render() {
        const {list, loading, query, sort} = this.state;
        const noResults = !loading && list.length === 0;

        //  Meta config
        const metaProps = {
            title: _t("communities.title"),
            url: "/communities",
            canonical: `${defaults.base}/communities`,
            description: _t("communities.description"),
        };

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                {NavBar({...this.props})}

                <div className="app-content communities-page">
                    <div className="community-list">
                        <div className="list-header">
                            <h1 className="list-title">{_t("communities.title")}</h1>
                            <Link to="/communities/create" className="create-link">{_t('communities.create')}</Link>
                        </div>
                        <div className="list-form">
                            <div className="search">
                                <SearchBox placeholder={_t("g.search")} value={query} onChange={this.queryChanged} readOnly={loading}/>
                            </div>
                            <div className="sort">
                                <FormControl as="select" value={sort} onChange={this.sortChanged} disabled={loading}>
                                    <option value="hot">{_t("communities.sort-hot")}</option>
                                    <option value="rank">{_t("communities.sort-rank")}</option>
                                    <option value="subs">{_t("communities.sort-subs")}</option>
                                    <option value="new">{_t("communities.sort-new")}</option>
                                </FormControl>
                            </div>
                        </div>
                        {loading && <LinearProgress/>}
                        <div className="list-items">
                            {noResults && <div className="no-results">{_t("communities.no-results")}</div>}
                            {list.map((x, i) => (
                                <Fragment key={i}>
                                    {CommunityListItem({
                                        ...this.props,
                                        community: x
                                    })}
                                </Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(CommunitiesPage);

const namePattern = "^hive-1\\d{5}$";

interface CreateState {
    fee: string;
    title: string;
    about: string;
    username: string;
    wif: string;
    usernameStatus: null | "ok" | "conflict" | "not-valid";
    keyDialog: boolean;
    creatorKey: PrivateKey | null;
    done: boolean;
    inProgress: boolean;
    progress: string;
}

class CommunityCreatePage extends Component<PageProps, CreateState> {
    state: CreateState = {
        fee: "",
        title: "",
        about: "",
        username: "",
        wif: "",
        usernameStatus: null,
        keyDialog: false,
        creatorKey: null,
        done: false,
        inProgress: false,
        progress: ''
    }

    form = React.createRef<HTMLFormElement>();

    _timer: any = null;
    _mounted: boolean = true;

    componentDidMount() {
        client.database.getChainProperties().then(r => {
            const asset = parseAsset(r.account_creation_fee.toString());
            const fee = `${numeral(asset.amount).format('0.000')} ${asset.symbol}`;
            this.stateSet({fee});
        });
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    genUsername = (): string => {
        return `hive-${Math.floor(Math.random() * 100000) + 100000}`;
    };

    genWif = (): string => {
        return 'P' + base58.encode(cryptoUtils.sha256(random()));
    };

    onInput = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {target: el} = e;
        const {name: key, value} = el;

        this.stateSet({[key]: value});
    }

    usernameChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: username} = e.target;
        this.stateSet({username}, () => {
            clearTimeout(this._timer);
            this._timer = setTimeout(
                this.checkUsername,
                500
            );
        });
    }

    checkUsername = () => {
        const {username} = this.state;
        this.stateSet({usernameStatus: null});

        const re = new RegExp(namePattern);

        if (re.test(username)) {
            getAccount(username).then(r => {
                if (r) {
                    this.stateSet({usernameStatus: "conflict"});
                } else {
                    this.stateSet({usernameStatus: "ok"});
                }
            })
        } else {
            this.stateSet({usernameStatus: "not-valid"});
        }
    }

    genCredentials = () => {
        this.stateSet({
            username: this.genUsername(),
            wif: this.genWif(),
        }, this.checkUsername);
    }

    toggleKeyDialog = () => {
        const {keyDialog} = this.state;
        this.stateSet({keyDialog: !keyDialog});
    }

    makePrivateKeys = () => {
        const {username, wif} = this.state;

        return {
            ownerKey: PrivateKey.fromLogin(username, wif, "owner"),
            activeKey: PrivateKey.fromLogin(username, wif, "active"),
            postingKey: PrivateKey.fromLogin(username, wif, "posting"),
            memoKey: PrivateKey.fromLogin(username, wif, "memo")
        }
    }

    makeAuthorities = (keys: { ownerKey: PrivateKey, activeKey: PrivateKey, postingKey: PrivateKey }) => {
        const {activeUser} = this.props;
        const {ownerKey, activeKey, postingKey} = keys;

        return {
            ownerAuthority: Authority.from(ownerKey.createPublic()),
            activeAuthority: Authority.from(activeKey.createPublic()),
            postingAuthority: {
                ...Authority.from(postingKey.createPublic()),
                account_auths: [['ecency.app', 1]]
            } as Authority
        }
    }

    makeOperation = (auths: { ownerAuthority: Authority, activeAuthority: Authority, postingAuthority: Authority }, memoKey: PrivateKey): AccountCreateOperation => {
        const {activeUser} = this.props;
        const {fee, username} = this.state;

        return ["account_create", {
            fee: fee,
            creator: activeUser!.username,
            new_account_name: username,
            owner: auths.ownerAuthority,
            active: auths.activeAuthority,
            posting: auths.postingAuthority,
            memo_key: memoKey.createPublic(),
            json_metadata: ""
        }];
    }

    submit = async () => {
        const {activeUser, addUser} = this.props;
        const {title, about, username, creatorKey} = this.state;
        if (!activeUser || !creatorKey) return;

        this.stateSet({inProgress: true, progress: _t('communities-create.progress-account')});

        // create community account
        const keys = this.makePrivateKeys();
        const auths = this.makeAuthorities(keys);
        const operation = this.makeOperation(auths, keys.memoKey);

        try {
            await client.broadcast.sendOperations([operation], creatorKey);
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        this.stateSet({inProgress: true, progress: _t('communities-create.progress-user')});

        // create hive signer code from active private key
        const code = makeHsCode(username, keys.activeKey);

        // get access token from code and create user object
        let user: User;
        try {
            user = await hsTokenRenew(code).then(x => ({
                username: x.username,
                accessToken: x.access_token,
                refreshToken: x.refresh_token,
                expiresIn: x.expires_in,
            }));
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // add community user to reducer
        addUser(user);

        // set admin role
        this.stateSet({progress: _t('communities-create.progress-role', {u: activeUser.username})});

        try {
            await setUserRole(username, username, activeUser.username, "admin");
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // update community props
        this.stateSet({progress: _t('communities-create.progress-props')});

        try {
            await updateCommunity(username, username, {title, about, lang: 'en', description: '', flag_text: '', is_nsfw: false});
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // wait 3 seconds to hivemind synchronize community data
        await new Promise((r) => {
            setTimeout(() => {
                r(true);
            }, 3000);
        });

        this.stateSet({inProgress: false, done: true});
    }

    submitHot = () => {
        const {username, title, about} = this.state;

        const keys = this.makePrivateKeys();
        const auths = this.makeAuthorities(keys);
        const operation = this.makeOperation(auths, keys.memoKey);

        // create hive signer code from active private key to use after redirection from hivesigner
        const code = makeHsCode(username, keys.activeKey);
        const callback = `${window.location.origin}/communities/create-hs?code=${code}&title=${encodeURIComponent(title)}&about=${encodeURIComponent(about)}`;

        hs.sendOperation(operation, {callback}, () => {
        }, () => {
        });
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("communities-create.page-title"),
            description: _t("communities-create.description"),
        };

        const {activeUser} = this.props;

        const {fee, title, about, username, wif, usernameStatus, keyDialog, done, inProgress, progress} = this.state;

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={this.props.global}/>
                <Feedback/>
                {NavBar({...this.props})}

                <div className="app-content communities-page">
                    <Form ref={this.form} className={`community-form ${inProgress ? "in-progress" : ""}`} onSubmit={(e: React.FormEvent) => {
                        e.preventDefault();
                        e.stopPropagation();

                        if (!this.form.current?.checkValidity()) {
                            return;
                        }

                        const {wif} = this.state;
                        if (wif === '') {
                            this.genCredentials();
                            return;
                        }

                        this.toggleKeyDialog();
                    }}>
                        <h1 className="form-title">{_t("communities-create.page-title")}</h1>
                        {(() => {
                            if (done) {
                                const url = `/trending/${username}`;
                                return <div className="done">
                                    <p>{_t("communities-create.done")}</p>
                                    <p><strong><Link to={url}>{_t("communities-create.done-link-label")}</Link></strong></p>
                                </div>
                            }

                            return <>
                                <Form.Group>
                                    <Form.Label>{_t("communities-create.title")}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        autoComplete="off"
                                        autoFocus={true}
                                        value={title}
                                        minLength={3}
                                        maxLength={20}
                                        onChange={this.onInput}
                                        required={true}
                                        name="title"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label>{_t("communities-create.about")}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        autoComplete="off"
                                        value={about}
                                        maxLength={120}
                                        onChange={this.onInput}
                                        name="about"
                                    />
                                </Form.Group>
                                {(() => {
                                    if (activeUser && wif) {
                                        return <>
                                            <Form.Group>
                                                <Form.Label>{_t("communities-create.fee")}</Form.Label>
                                                <div className="fee">{fee}</div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>{_t("communities-create.creator")}</Form.Label>
                                                <div className="creator">@{activeUser.username}</div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>{_t("communities-create.username")}</Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    autoComplete="off"
                                                    value={username}
                                                    maxLength={11}
                                                    name="about"
                                                    pattern={namePattern}
                                                    title={_t("communities-create.username-wrong-format")}
                                                    onChange={this.usernameChanged}
                                                />
                                                {usernameStatus === "ok" && (
                                                    <Form.Text className="text-success">{checkSvg} {_t("communities-create.username-available")}</Form.Text>)}
                                                {usernameStatus === "conflict" && (
                                                    <Form.Text className="text-danger">{alertCircleSvg} {_t("communities-create.username-not-available")}</Form.Text>)}
                                                {usernameStatus === "not-valid" && (
                                                    <Form.Text className="text-danger">{alertCircleSvg} {_t("communities-create.username-wrong-format")}</Form.Text>)}
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label>{_t("communities-create.password")}</Form.Label>
                                                <pre className="password"><span>{wif}</span></pre>
                                            </Form.Group>
                                            <Form.Group>
                                                <label><input type="checkbox" required={true}/> {_t("communities-create.confirmation")}</label>
                                            </Form.Group>
                                            <Form.Group>
                                                <Button type="submit" disabled={inProgress}>
                                                    {inProgress && (<Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>)}
                                                    {_t("communities-create.submit")}</Button>
                                            </Form.Group>
                                            {inProgress && <p>{progress}</p>}
                                        </>
                                    }

                                    if (activeUser) {
                                        return <Form.Group>
                                            <Button type="submit">{_t('g.next')}</Button>
                                        </Form.Group>
                                    }

                                    return <Form.Group>
                                        {LoginRequired({
                                            ...this.props,
                                            children: <Button type="button">{_t('g.next')}</Button>
                                        })}
                                    </Form.Group>
                                })()}
                            </>
                        })()}
                    </Form>
                </div>

                {keyDialog && (
                    <Modal animation={false} show={true} centered={true} onHide={this.toggleKeyDialog} keyboard={false} className="community-key-modal modal-thin-header">
                        <Modal.Header closeButton={true}/>
                        <Modal.Body>
                            {KeyOrHot({
                                ...this.props,
                                activeUser: activeUser!,
                                inProgress: false,
                                onKey: (key) => {
                                    this.toggleKeyDialog();
                                    this.stateSet({creatorKey: key}, () => {
                                        this.submit().then();
                                    });
                                },
                                onHot: () => {
                                    this.toggleKeyDialog();
                                    this.submitHot();
                                }
                            })}
                        </Modal.Body>
                    </Modal>
                )}
            </>
        )
    }
}

export const CommunityCreateContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityCreatePage);

interface CreateHsState {
    username: string;
    done: boolean;
    inProgress: boolean;
    progress: string;
}

class CommunityCreateHSPage extends Component<PageProps, CreateHsState> {
    state: CreateHsState = {
        username: '',
        done: false,
        inProgress: false,
        progress: ''
    }

    _mounted: boolean = true;

    componentDidMount() {
        this.handle().then();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    handle = async () => {
        const {location, history, addUser, activeUser} = this.props;
        const qs = queryString.parse(location.search);
        const code = qs.code as string;
        const title = (qs.title as string) || '';
        const about = (qs.about as string) || '';

        if (!code || !activeUser) {
            history.push("/");
            return;
        }

        this.stateSet({inProgress: true, progress: _t('communities-create.progress-user')});

        // get access token from code and create user object
        let user: User;
        try {
            user = await hsTokenRenew(code).then(x => ({
                username: x.username,
                accessToken: x.access_token,
                refreshToken: x.refresh_token,
                expiresIn: x.expires_in,
            }));
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // add username to state
        this.stateSet({username: user.username});

        // add community user to reducer
        addUser(user);

        // set admin role
        this.stateSet({progress: _t('communities-create.progress-role', {u: activeUser.username})});

        try {
            await setUserRole(user.username, user.username, activeUser.username, "admin");
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // update community props
        this.stateSet({progress: _t('communities-create.progress-props')});

        try {
            await updateCommunity(user.username, user.username, {title, about, lang: 'en', description: '', flag_text: '', is_nsfw: false});
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // wait 3 seconds to hivemind synchronize community data
        await new Promise((r) => {
            setTimeout(() => {
                r(true);
            }, 3000);
        });

        // done
        this.stateSet({inProgress: false, done: true});

        // redirect to community page
        history.push(`/trending/${user.username}`);
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("communities-create.page-title"),
            description: _t("communities-create.description"),
        };

        const {inProgress, progress, done} = this.state;

        return <>
            <Meta {...metaProps} />
            <Theme global={this.props.global}/>
            <Feedback/>
            {NavBar({...this.props})}

            <div className="app-content communities-page">
                <div className="community-form">
                    <h1 className="form-title">{_t("communities-create.page-title")}</h1>
                    {(() => {
                        if (inProgress) {
                            return <p>{progress}</p>;
                        }

                        if (done) {
                            return null;
                        }

                        return <div>
                            <p className="text-danger">{_t('g.server-error')}</p>
                            <p><Button size="sm" onClick={() => {
                                window.location.reload();
                            }}>{_t('g.try-again')}</Button></p>
                        </div>
                    })()}
                </div>
            </div>
        </>
    }
}

export const CommunityCreateHSContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityCreateHSPage);

