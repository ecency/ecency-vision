import React, {Fragment} from "react";

import {connect} from "react-redux";

import {Link} from "react-router-dom";

import { Button, Form, FormControl, Modal, Spinner, OverlayTrigger, Tooltip, InputGroup } from "react-bootstrap";

import base58 from "bs58";

import numeral from "numeral";

import queryString from "query-string";

import hs from "hivesigner";

import {PrivateKey, cryptoUtils, AccountCreateOperation, Authority} from "@hiveio/dhive";

import {Community} from "../store/communities/types";

import {User} from "../store/users/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme/index";
import NavBar from "../components/navbar/index";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import CommunityListItem from "../components/community-list-item";
import SearchBox from "../components/search-box";
import KeyOrHot from "../components/key-or-hot";
import LoginRequired from "../components/login-required";
import Feedback, { success } from "../components/feedback";
import {error} from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import {_t} from "../i18n";

import {getAccount} from "../api/hive";
import {getCommunities, getSubscriptions} from "../api/bridge";
import {formatError, updateCommunity, setUserRole} from "../api/operations";
import {hsTokenRenew} from "../api/auth-api";

import {client} from "../api/hive";

import * as keychain from "../helper/keychain";

import {makeHsCode} from "../helper/hive-signer";
import parseAsset from "../helper/parse-asset";
import defaults from "../constants/defaults.json";

import random from "../util/rnd";

import {checkSvg, alertCircleSvg, informationVariantSvg, copyContent} from "../img/svg";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import { handleInvalid, handleOnInput } from "../util/input-util";


interface State {
    list: Community[];
    loading: boolean;
    query: string;
    sort: string;
}

class CommunitiesPage extends BaseComponent<PageProps, State> {
    state: State = {
        list: [],
        loading: true,
        query: "",
        sort: "hot",
    };

    _timer: any = null;

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

    fetch = () => {
        const {query, sort} = this.state;
        this.stateSet({loading: true});

        getCommunities("", 100, query ? query : null, (sort === "hot" ? "rank" : sort))
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

    queryChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
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

    sortChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
        this.stateSet({sort: e.target.value}, (): void => {
            this.fetch();
        });
    };

    render() {
        const {global} = this.props;
        const {list, loading, query, sort} = this.state;
        const noResults = !loading && list.length === 0;

        //  Meta config
        const metaProps = {
            title: _t("communities.title"),
            url: "/communities",
            canonical: `${defaults.base}/communities`,
            description: _t("communities.description"),
        };
        let containerClasses = global.isElectron ? "app-content communities-page mt-0 pt-6" : "app-content communities-page"

        return (
            <>
                <Meta {...metaProps} />
                <ScrollToTop/>
                <Theme global={this.props.global}/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                        reloadFn: this.fetch,
                        reloading: loading,
                    }) :
                    NavBar({...this.props})}

                <div className={containerClasses}>
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

const namePattern = "^hive-[1]\\d{4,6}$";

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

class CommunityCreatePage extends BaseComponent<PageProps, CreateState> {
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

    componentDidMount() {
        client.database.getChainProperties().then(r => {
            const asset = parseAsset(r.account_creation_fee.toString());
            const fee = `${numeral(asset.amount).format('0.000')} ${asset.symbol}`;
            this.stateSet({fee});
        });
    }

    genUsername = (): string => {
        return `hive-${Math.floor(Math.random() * 100000) + 100000}`;
    };

    genWif = (): string => {
        return 'P' + base58.encode(cryptoUtils.sha256(random()));
    };

    onInput = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const {target: el} = e;
        const {name: key, value} = el;

        // @ts-ignore
        this.stateSet({[key]: value});
    }

    usernameChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
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
        const {activeUser} = this.props;
        const {username, creatorKey} = this.state;
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
        const signer = (message: string): Promise<string> => {
            const hash = cryptoUtils.sha256(message);
            return new Promise<string>((resolve) => resolve(keys.activeKey.sign(hash).toString()));
        }
        const code = await makeHsCode(username, signer);

        return this.finalizeSubmit(code);
    }

    submitKc = async () => {
        const {activeUser} = this.props;
        const {username, fee} = this.state;
        if (!activeUser) return;

        this.stateSet({inProgress: true, progress: _t('communities-create.progress-account')});

        // create community account
        const keys = this.makePrivateKeys();
        const operation = ["account_create", {
            fee: fee,
            creator: activeUser.username,
            new_account_name: username,
            owner: {weight_threshold: 1, account_auths: [], key_auths: [[keys.ownerKey.createPublic().toString(), 1]]},
            active: {weight_threshold: 1, account_auths: [], key_auths: [[keys.activeKey.createPublic().toString(), 1]]},
            posting: {weight_threshold: 1, account_auths: [['ecency.app', 1]], key_auths: [[keys.postingKey.createPublic().toString(), 1]]},
            memo_key: keys.memoKey.createPublic().toString(),
            json_metadata: ""
        }];

        try {
            await keychain.broadcast(activeUser!.username, [operation], "Active");
        } catch
            (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // Add account to keychain
        try {
            await keychain.addAccount(username, {
                active: keys.activeKey.toString(),
                posting: keys.postingKey.toString(),
                memo: keys.memoKey.toString()
            });
        } catch (e) {
            error(formatError(e));
            this.stateSet({inProgress: false, progress: ''});
            return;
        }

        // create hive signer code from active private key
        const signer = (message: string): Promise<string> => keychain.signBuffer(username, message, "Active").then(r => r.result);
        const code = await makeHsCode(username, signer);

        return this.finalizeSubmit(code);
    }

    finalizeSubmit = async (hsCode: string) => {
        const {activeUser, addUser} = this.props;
        const {title, about, username} = this.state;
        if (!activeUser) return;

        // get access token from code and create user object
        let user: User;
        try {
            user = await hsTokenRenew(hsCode).then(x => ({
                username: x.username,
                accessToken: x.access_token,
                refreshToken: x.refresh_token,
                expiresIn: x.expires_in,
                postingKey: null
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

    submitHot = async () => {
        const {username, title, about} = this.state;

        const keys = this.makePrivateKeys();
        const auths = this.makeAuthorities(keys);
        const operation = this.makeOperation(auths, keys.memoKey);

        // create hive signer code from active private key to use after redirection from hivesigner
        const signer = (message: string): Promise<string> => {
            const hash = cryptoUtils.sha256(message);
            return new Promise<string>((resolve) => resolve(keys.activeKey.sign(hash).toString()));
        }
        const code = await makeHsCode(username, signer);
        if(code){
            const callback = `${window.location.origin}/communities/create-hs?code=${code}&title=${encodeURIComponent(title)}&about=${encodeURIComponent(about)}`;
            hs.sendOperation(operation, {callback}, () => {
            });

        }
    }

    copyToClipboard = (text: string) => {
        const textField = document.createElement('textarea');
        textField.innerText = text;
        document.body.appendChild(textField);
        textField.select();
        document.execCommand('copy');
        textField.remove();
        success(_t('profile-edit.copied'));
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("communities-create.page-title"),
            description: _t("communities-create.description"),
        };

        const {activeUser, global} = this.props;
        let communityImage = global.isElectron ?  "./img/community-img.svg" : require("../img/community-img.svg");


        const {fee, title, about, username, wif, usernameStatus, keyDialog, done, inProgress, progress} = this.state;
        let containerClasses = global.isElectron ? "app-content container-fluid mt-0 pt-6" : "app-content container-fluid"

        return (
            <>
                <Meta {...metaProps} />
                <Theme global={global}/>
                <Feedback/>
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props
                    }) :
                    NavBar({...this.props})}

                <div className={containerClasses}>
                    <div className="row align-items-center justify-content-center m-0">
                        <div className="col-6 d-none d-lg-block">
                            <img src={communityImage} className="w-100"/>
                        </div>
                        <div className="col-12 col-sm-8 col-lg-5 p-0 p-sm-3">
                            <div>
                                <h1 className={`community-title ${wif ? "mb-5" : ""} d-none d-lg-block`}>{_t("communities-create.page-title")}</h1>
                                <h1 className={`community-title ${wif ? "mb-5" : ""} d-lg-none`}>{_t("communities-create.page-title")}</h1>
                                {(!wif || !activeUser) && <>
                                                    <ul className="descriptive-list">
                                                        <li>{_t("communities-create.reason-one")}</li>
                                                        <li>{_t("communities-create.reason-two")}</li>
                                                        <li>{_t("communities-create.reason-three")}</li>
                                                    </ul>
                                                    <div className="learn-more">{_t("g.learn-more")} <Link to="/faq">{_t("g.faq")}</Link></div>
                                                </>
                                }

                        {!wif && <div className="col-12 d-lg-none p-0">
                            <img src={communityImage} className="w-100"/>
                        </div>}
                        <Form 
                            ref={this.form} 
                            className={`community-form ${inProgress ? "in-progress" : ""}`} 
                            onSubmit={(e: React.FormEvent) => {
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
                            }}
                        >
                        {(() => {
                            if (done) {
                                const url = `/created/${username}`;
                                return <div className="done">
                                    <p>{_t("communities-create.done")}</p>
                                    <p><strong><Link to={url}>{_t("communities-create.done-link-label")}</Link></strong></p>
                                </div>
                            }

                            return <>
                               {!wif && 
                        <>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    autoComplete="off"
                                    autoFocus={true}
                                    value={title}
                                    minLength={3}
                                    maxLength={20}
                                    onChange={this.onInput}
                                    required={true}
                                    onInvalid={(e: any) => handleInvalid(e, 'communities-create.', 'title-validation')}
                                    onInput={(e:any) => e.target.setCustomValidity("")}
                                    name="title"
                                    isValid={title.length > 2 && title.length < 21}
                                    placeholder={_t("communities-create.title")}
                                />
                            </Form.Group>
                            <Form.Group>
                                <Form.Control
                                    type="text"
                                    autoComplete="off"
                                    value={about}
                                    maxLength={120}
                                    onChange={this.onInput}
                                    name="about"
                                    placeholder={_t("communities-create.about")}
                                />
                            </Form.Group>
                            </>}
                               {(() => {
                                    if (activeUser && wif) {
                                        return <>
                                            <Form.Group>
                                                <div className="d-flex align-items-center">
                                                    <Form.Label className="mb-0 mr-2">{_t("communities-create.fee")}</Form.Label>
                                                    <OverlayTrigger
                                                        placement={'bottom'}
                                                        overlay={
                                                            <Tooltip id={`tooltip-bottom`}>
                                                                {_t("communities-create.reason-four")}
                                                            </Tooltip>
                                                        }
                                                        >
                                                        <span className="info-icon">{informationVariantSvg}</span>
                                                    </OverlayTrigger>
                                                </div>
                                                <div className="fee">{fee}</div>
                                            </Form.Group>
                                            <Form.Group>
                                                <Form.Label className="mb-0">{_t("communities-create.creator")}</Form.Label>
                                                <div>
                                                    <Link className="creator" to={`/@${activeUser.username}`}>@{activeUser.username}</Link>
                                                </div>
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
                                                <Form.Group>
                                                    <InputGroup 
                                                        className="mb-3"
                                                        onClick={() => this.copyToClipboard(wif)}
                                                    >
                                                        <Form.Control 
                                                            value={wif} 
                                                            disabled={true}
                                                            className="pointer"
                                                            id="copy-to-clipboard"
                                                        />
                                                        <InputGroup.Append>
                                                            <Button
                                                                variant="primary"
                                                                size="sm"
                                                                className="copy-to-clipboard"
                                                                onClick={() => this.copyToClipboard(`${wif}`)}
                                                            >
                                                                {copyContent}
                                                            </Button>
                                                        </InputGroup.Append>
                                                    </InputGroup>
                                                </Form.Group>
                                                
                                            </Form.Group>
                                            <Form.Group>
                                                <label className="label-text">
                                                    <input
                                                        type="checkbox"
                                                        required={true} 
                                                        onInvalid={(e: any) => handleInvalid(e, 'communities-create.', 'checkbox-validation')}
                                                        onInput={handleOnInput}
                                                    /> {_t("communities-create.confirmation")}</label>
                                            </Form.Group>
                                            <Form.Group>
                                                <Button className="w-100 p-3 bg-white text-primary" onClick={() => this.setState({ wif: "" })} id="black-on-night">
                                                    {_t("g.back")}
                                                </Button>
                                            </Form.Group>
                                            <Form.Group>
                                                <Button type="submit" disabled={inProgress} className="w-100 p-3" variant="primary">
                                                    {inProgress && (<Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>)}
                                                    {_t("communities-create.submit")}
                                                </Button>
                                            </Form.Group>
                                            {inProgress && <p>{progress}</p>}
                                        </>
                                    }

                                    if (!wif && activeUser) {
                                        return <Form.Group>
                                                    <Button type="submit" className="w-100 p-3">{_t('g.next')}</Button>
                                                </Form.Group>
                                    }

                                    return !wif && <Form.Group>
                                        {LoginRequired({
                                            ...this.props,
                                            children: <Button type="button" className="w-100 p-3">{_t('g.next')}</Button>
                                        })}
                                    </Form.Group>
                                })()}
                            </>
                        })()}
                            
                        </Form>
                    
                            </div>{keyDialog && (
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
                                },
                                onKc: () => {
                                    this.toggleKeyDialog();
                                    this.submitKc().then();
                                }
                            })}
                        </Modal.Body>
                    </Modal>
                )}
                        </div>
                    </div>
                </div>
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

class CommunityCreateHSPage extends BaseComponent<PageProps, CreateHsState> {
    state: CreateHsState = {
        username: '',
        done: false,
        inProgress: false,
        progress: ''
    }

    componentDidMount() {
        this.handle().then();
    }

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
                postingKey: null
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
        history.push(`/created/${user.username}`);
    }

    render() {
        //  Meta config
        const metaProps = {
            title: _t("communities-create.page-title"),
            description: _t("communities-create.description"),
        };

        const {global} = this.props;
        const {inProgress, progress, done} = this.state;
        let containerClasses = global.isElectron ? "app-content communities-page mt-0 pt-6" : "app-content communities-page"

        return <>
            <Meta {...metaProps} />
            <Theme global={global}/>
            <Feedback/>
            {global.isElectron ?
                NavBarElectron({
                    ...this.props
                }) :
                NavBar({...this.props})}

            <div className={containerClasses}>
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
                                this.handle().then()
                            }}>{_t('g.try-again')}</Button></p>
                        </div>
                    })()}
                </div>
            </div>
        </>
    }
}

export const CommunityCreateHSContainer = connect(pageMapStateToProps, pageMapDispatchToProps)(CommunityCreateHSPage);

