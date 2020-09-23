import React, {Component, Fragment} from "react";

import {connect} from "react-redux";

import {Link} from "react-router-dom";

import {Button, Form, FormControl, Modal, Spinner} from "react-bootstrap";

import base58 from "bs58";

import numeral from "numeral";

import {PrivateKey, cryptoUtils, AccountCreateOperation, Authority} from "@hiveio/dhive";

import {Community} from "../store/communities/types";

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

import {_t} from "../i18n";

import {getAccount} from "../api/hive";
import {getCommunities, getSubscriptions} from "../api/bridge";
import {formatError} from "../api/operations";
import {client} from "../api/hive";

import parseAsset from "../helper/parse-asset"

import random from "../util/rnd";

import {checkSvg, alertCircleSvg} from "../img/svg";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";

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
        };

        return (
            <>
                <Meta {...metaProps} />
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

const namePattern = "^hive-\\d{6}$";

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

    submit = async () => {
        const {activeUser} = this.props;
        const {fee, title, about, username, wif, creatorKey} = this.state;
        if (!activeUser || !creatorKey) return;

        this.stateSet({inProgress: true, progress: _t('communities-create.progress-account')});

        // Create account
        const ownerKey = PrivateKey.fromLogin(username, wif, "owner");
        const activeKey = PrivateKey.fromLogin(username, wif, "active");
        const postingKey = PrivateKey.fromLogin(username, wif, "posting");
        const memoKey = PrivateKey.fromLogin(username, wif, "memo");

        const operation: AccountCreateOperation = ["account_create", {
            fee: fee,
            creator: activeUser.username,
            new_account_name: username,
            owner: Authority.from(ownerKey.createPublic()),
            active: Authority.from(activeKey.createPublic()),
            posting: {...Authority.from(postingKey.createPublic()), account_auths: [['ecency.app', 1]]},
            memo_key: memoKey.createPublic(),
            json_metadata: ""
        }];

        try {
            await client.broadcast.sendOperations([operation], creatorKey);
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // Add admin role
        this.stateSet({progress: _t('communities-create.progress-role', {u: activeUser?.username})});

        const roleParams = {
            required_auths: [],
            required_posting_auths: [username],
            id: "community",
            json: JSON.stringify(
                ["setRole", {community: username, account: activeUser.username, role: "admin"}]
            )
        };

        try {
            await client.broadcast.sendOperations([["custom_json", {...roleParams}]], postingKey);
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // Update community props
        this.stateSet({progress: _t('communities-create.progress-props')});

        const propParams = {
            required_auths: [],
            required_posting_auths: [username],
            id: "community",
            json: JSON.stringify(
                ["updateProps", {community: username, props: {title, about}}]
            )
        };

        try {
            await client.broadcast.sendOperations([["custom_json", {...propParams}]], postingKey);
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // Wait 3 seconds for hivemind synchronization
        await new Promise((r) => {
            setTimeout(() => {
                r(true);
            }, 3000);
        });

        this.stateSet({inProgress: false, done: true});
    }

    submitHot = () => {
        const {username, wif} = this.state;

        const ownerKey = PrivateKey.fromLogin(username, wif, "owner");
        const activeKey = PrivateKey.fromLogin(username, wif, "active");
        const postingKey = PrivateKey.fromLogin(username, wif, "posting");
        const memoKey = PrivateKey.fromLogin(username, wif, "memo");

        const owner = Authority.from(ownerKey.createPublic());
        const active = Authority.from(activeKey.createPublic());
        const posting = {...Authority.from(postingKey.createPublic()), account_auths: [['ecency.app', 1]]}
        const memo = memoKey.createPublic();

        const u = `https://hivesigner.com/sign/account_create?new_account_name=${username}&owner=${JSON.stringify(owner)}&active=${JSON.stringify(active)}&posting=${JSON.stringify(posting)}&memo_key=${JSON.stringify(memo)}&json_metadata={}`;

        const win = window.open(u, '_blank');
        win!.focus();
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("communities-create.page-title"),
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
                                    <p><strong><a href={url}>{_t("communities-create.done-link-label")}</a></strong></p>
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
