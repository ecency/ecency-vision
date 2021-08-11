import React, {Component} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import queryString from "query-string";

import isEqual from "react-fast-compare";

import {History} from "history";

import {Form, FormControl, Button, Spinner, Col, Row} from "react-bootstrap";

import moment, {Moment} from "moment";

import defaults from "../constants/defaults.json";

import {renderPostBody, setProxyBase} from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import {Entry} from "../store/entries/types";
import {Global} from "../store/global/types";
import {FullAccount} from "../store/accounts/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import FullHeight from "../components/full-height";
import EditorToolbar from "../components/editor-toolbar";
import TagSelector from "../components/tag-selector";
import CommunitySelector from "../components/community-selector";
import Tag from "../components/tag";
import LoginRequired from "../components/login-required";
import WordCount from "../components/word-counter";
import {makePath as makePathEntry} from "../components/entry-link";
import {error, success} from "../components/feedback";
import MdHandler from "../components/md-handler";
import BeneficiaryEditor from "../components/beneficiary-editor";
import PostScheduler from "../components/post-scheduler";

import {getDrafts, addDraft, updateDraft, addSchedule, Draft} from "../api/private-api";

import {createPermlink, extractMetaData, makeJsonMetaData, makeCommentOptions, createPatch} from "../helper/posting";

import tempEntry, {correctIsoDate} from "../helper/temp-entry";
import isCommunity from "../helper/is-community" ;

import {RewardType, comment, reblog, formatError, BeneficiaryRoute} from "../api/operations";

import * as bridgeApi from "../api/bridge";
import * as hiveApi from "../api/hive";

import {_t} from "../i18n";

import _c from "../util/fix-class-names"

import * as ls from "../util/local-storage";

import {version} from "../../../package.json";

import {contentSaveSvg} from "../img/svg";

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import ModalConfirm from "../components/modal-confirm";
import ResizableTextarea from "../components/resizable-text-area";

interface PostBase {
    title: string;
    tags: string[];
    body: string;
}

interface Advanced {
    reward: RewardType;
    beneficiaries: BeneficiaryRoute[];
    schedule: string | null,
    reblogSwitch: boolean;
}

interface PreviewProps extends PostBase {
    history: History;
    global: Global;
}

class PreviewContent extends Component<PreviewProps> {
    shouldComponentUpdate(nextProps: Readonly<PreviewProps>): boolean {
        return (
            !isEqual(this.props.title, nextProps.title) ||
            !isEqual(this.props.tags, nextProps.tags) ||
            !isEqual(this.props.body, nextProps.body)
        );
    }

    render() {
        const {title, tags, body, global} = this.props;

        return (
            <>
                <div className="preview-title">{title}</div>

                <div className="preview-tags">
                    {tags.map((x) => {
                        return (
                            <span className="preview-tag" key={x}>
                                {
                                    Tag({
                                        ...this.props,
                                        tag: x,
                                        children: <span>{x}</span>,
                                        type: "span"
                                    })
                                }
                            </span>
                        );
                    })}
                </div>

                <div className="preview-body markdown-view" dangerouslySetInnerHTML={{__html: renderPostBody(body, false, global.canUseWebp)}}/>
            </>
        );
    }
}

interface MatchParams {
    permlink?: string;
    username?: string;
    draftId?: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State extends PostBase, Advanced {
    preview: PostBase;
    posting: boolean;
    editingEntry: Entry | null;
    saving: boolean;
    editingDraft: Draft | null;
    advanced: boolean;
    clearModal: boolean;
}

class SubmitPage extends BaseComponent<Props, State> {
    state: State = {
        title: "",
        tags: [],
        body: "",
        reward: "default",
        posting: false,
        editingEntry: null,
        saving: false,
        editingDraft: null,
        advanced: false,
        beneficiaries: [],
        schedule: null,
        reblogSwitch: false,
        clearModal: false,
        preview: {
            title: "",
            tags: [],
            body: "",
        },
    };

    _updateTimer: any = null;

    componentDidMount = (): void => {
        this.loadLocalDraft();

        this.loadAdvanced();

        this.detectCommunity();

        this.detectEntry().then();

        this.detectDraft().then();
    };

    componentDidUpdate(prevProps: Readonly<Props>) {
        const {activeUser, location} = this.props;

        // active user changed
        if (activeUser?.username !== prevProps.activeUser?.username) {
            // delete active user from beneficiaries list
            if (activeUser) {
                const {beneficiaries} = this.state;
                if (beneficiaries.find(x => x.account === activeUser.username)) {
                    const b = [...beneficiaries.filter(x => x.account !== activeUser.username)];
                    this.stateSet({beneficiaries: b});
                }
            }
        }

        // location change. only occurs once a draft picked on drafts dialog
        if (location.pathname !== prevProps.location.pathname) {
            this.detectDraft().then();
        }
    }

    isEntry = (): boolean => {
        const {match, activeUser} = this.props;
        const {path, params} = match;

        return !!(activeUser && path.endsWith("/edit") && params.username && params.permlink);
    }

    isDraft = (): boolean => {
        const {match, activeUser} = this.props;
        const {path, params} = match;

        return !!(activeUser && path.startsWith("/draft") && params.draftId);
    }

    detectEntry = async () => {
        const {match, history} = this.props;
        const {params} = match;

        if (this.isEntry()) {
            let entry;
            try {
                entry = await bridgeApi.normalizePost(await hiveApi.getPost(params.username!.replace("@", ""), params.permlink!));
            } catch (e) {
                error(formatError(e));
                return;
            }

            if (!entry) {
                error('Could not fetch post data.');
                history.push('/submit');
                return;
            }

            const {title, body} = entry;
            let tags = entry.json_metadata?.tags || [];
            tags = [...new Set(tags)];

            this.stateSet({title, tags, body, editingEntry: entry}, this.updatePreview);
        } else {
            if (this.state.editingEntry) {
                this.stateSet({editingEntry: null});
            }
        }
    };

    detectDraft = async () => {
        const {match, activeUser, history} = this.props;
        const {params} = match;

        if (this.isDraft()) {
            let drafts: Draft[];

            try {
                drafts = await getDrafts(activeUser?.username!);
            } catch (err) {
                drafts = [];
            }

            drafts = drafts.filter(x => x._id === params.draftId);
            if (drafts.length === 1) {
                const [draft] = drafts;
                const {title, body} = draft;

                let tags: string[];

                try {
                    tags = draft.tags.trim() ? draft.tags.split(/[ ,]+/) : [];
                } catch (e) {
                    tags = [];
                }

                this.stateSet({title, tags, body, editingDraft: draft}, this.updatePreview);
            } else {
                error('Could not fetch draft data.');
                history.push('/submit');
                return;
            }
        } else {
            if (this.state.editingDraft) {
                this.stateSet({editingDraft: null});
            }
        }
    }

    detectCommunity = () => {
        const {location} = this.props;
        const qs = queryString.parse(location.search);
        if (qs.com) {
            const com = qs.com as string;

            this.stateSet({tags: [com]});
        }
    }

    loadLocalDraft = (): void => {
        if (this.isEntry() || this.isDraft()) {
            return;
        }

        const localDraft = ls.get("local_draft") as PostBase;
        if (!localDraft) {
            return;
        }

        const {title, tags, body} = localDraft;
        this.stateSet({title, tags, body}, this.updatePreview);
    };

    saveLocalDraft = (): void => {
        const {title, tags, body} = this.state;
        const localDraft: PostBase = {title, tags, body};
        ls.set("local_draft", localDraft);
    };

    loadAdvanced = (): void => {
        const advanced = ls.get("local_advanced") as Advanced;
        if (!advanced) {
            return;
        }

        this.stateSet({...advanced});
    }

    saveAdvanced = (): void => {
        const {reward, beneficiaries, schedule, reblogSwitch} = this.state;

        const advanced: Advanced = {
            reward,
            beneficiaries,
            schedule,
            reblogSwitch
        }

        ls.set("local_advanced", advanced);
    }

    hasAdvanced = (): boolean => {
        const {reward, beneficiaries, schedule, reblogSwitch} = this.state;

        return reward !== "default" || beneficiaries.length > 0 || schedule !== null || reblogSwitch;
    }

    titleChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const {value: title} = e.target;
        this.stateSet({title}, () => {
            this.updatePreview();
        });
    };

    tagsChanged = (tags: string[]): void => {
        if (isEqual(this.state.tags, tags)) {
            // tag selector calls onchange event 2 times on each change.
            // one for add event one for sort event.
            // important to check if tags really changed.
            return;
        }

        this.stateSet({tags}, () => {
            this.updatePreview();
        });

        // Toggle off reblog switch if it is true and the first tag is not community tag.
        const {reblogSwitch} = this.state;
        if (reblogSwitch) {
            const isCommunityTag = tags.length > 0 && isCommunity(tags[0]);

            if (!isCommunityTag) {
                this.stateSet({reblogSwitch: false}, this.saveAdvanced);
            }
        }
    };

    bodyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const {value: body} = e.target;
        this.stateSet({body}, () => {
            this.updatePreview();
        });
    };

    rewardChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const reward = e.target.value as RewardType;
        this.stateSet({reward}, this.saveAdvanced);
    };

    beneficiaryAdded = (item: BeneficiaryRoute) => {
        const {beneficiaries} = this.state;
        const b = [...beneficiaries, item].sort((a, b) => a.account < b.account ? -1 : 1);
        this.stateSet({beneficiaries: b}, this.saveAdvanced);
    }

    beneficiaryDeleted = (username: string) => {
        const {beneficiaries} = this.state;
        const b = [...beneficiaries.filter(x => x.account !== username)];
        this.stateSet({beneficiaries: b}, this.saveAdvanced);
    }

    scheduleChanged = (d: Moment | null) => {
        this.stateSet({schedule: d ? d.toISOString(true) : null}, this.saveAdvanced)
    }

    reblogSwitchChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        this.stateSet({reblogSwitch: e.target.checked}, this.saveAdvanced);
    }

    clear = (): void => {
        this.stateSet({title: "", tags: [], body: "", advanced: false, reward: "default", beneficiaries: [], schedule: null, reblogSwitch: false, clearModal: false}, () => {
            this.updatePreview();
            this.saveAdvanced();
        });

        const {editingDraft} = this.state;
        if (editingDraft) {
            const {history} = this.props;
            history.push('/submit');
        }
    };

    clearAdvanced = (): void => {
        this.stateSet({advanced: false, reward: "default", beneficiaries: [], schedule: null, reblogSwitch: false}, () => {
            this.saveAdvanced();
        });
    }

    toggleAdvanced = (): void => {
        const {advanced} = this.state;
        this.stateSet({advanced: !advanced})
    }

    updatePreview = (): void => {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }

        this._updateTimer = setTimeout(() => {
            const {title, tags, body, editingEntry} = this.state;
            this.stateSet({preview: {title, tags, body}});
            if (editingEntry === null) {
                this.saveLocalDraft();
            }
        }, 500);
    };

    focusInput = (parentSelector: string): void => {
        const el = document.querySelector(`${parentSelector} .form-control`) as HTMLInputElement;
        if (el) {
            el.focus();
        }
    }

    validate = (): boolean => {
        const {title, tags, body} = this.state;

        if (title.trim() === "") {
            this.focusInput(".title-input");
            error(_t("submit.empty-title-alert"));
            return false;
        }

        if (tags.length === 0) {
            this.focusInput(".tag-input");
            error(_t("submit.empty-tags-alert"));
            return false;
        }

        if (body.trim() === "") {
            this.focusInput(".body-input");
            error(_t("submit.empty-body-alert"));
            return false;
        }

        return true;
    }

    publish = async (): Promise<void> => {
        if (!this.validate()) {
            return;
        }

        const {activeUser, history, addEntry} = this.props;
        const {title, tags, body, reward, reblogSwitch, beneficiaries} = this.state;

        // make sure active user fully loaded
        if (!activeUser || !activeUser.data.__loaded) {
            return;
        }

        this.stateSet({posting: true});

        let author = activeUser.username;
        let authorData = activeUser.data as FullAccount;

        let permlink = createPermlink(title);

        // permlink duplication check
        let c;
        try {
            c = await bridgeApi.getPost(author, permlink);
        } catch (e) {
            /*error(_t("g.server-error"));
            this.stateSet({posting: false});
            return;*/
        }

        if (c && c.author) {
            // create permlink with random suffix
            permlink = createPermlink(title, true);
        }

        const [parentPermlink] = tags;
        const meta = extractMetaData(body);
        const jsonMeta = makeJsonMetaData(meta, tags, version);
        const options = makeCommentOptions(author, permlink, reward, beneficiaries);

        this.stateSet({posting: true});
        comment(author, "", parentPermlink, permlink, title, body, jsonMeta, options, true)
            .then(() => {

                this.clearAdvanced();

                // Create entry object in store
                const entry = {
                    ...tempEntry({
                        author: authorData!,
                        permlink,
                        parentAuthor: "",
                        parentPermlink,
                        title,
                        body,
                        tags
                    }),
                    max_accepted_payout: options.max_accepted_payout,
                    percent_hbd: options.percent_hbd
                };
                addEntry(entry);

                success(_t("submit.published"));
                this.clear();
                const newLoc = makePathEntry(parentPermlink, author, permlink);
                history.push(newLoc);
            })
            .then(() => {
                if (isCommunity(tags[0]) && reblogSwitch) {
                    reblog(author, author, permlink);
                }
            })
            .catch((e) => {
                error(formatError(e));
            })
            .finally(() => {
                this.stateSet({posting: false});
            });
    };

    update = async (): Promise<void> => {
        if (!this.validate()) {
            return;
        }

        const {activeUser, updateEntry, history} = this.props;
        const {title, tags, body, editingEntry} = this.state;

        if (!editingEntry) {
            return;
        }

        const {body: oldBody, author, permlink, category, json_metadata} = editingEntry;

        let newBody = body;
        const patch = createPatch(oldBody, newBody.trim());
        if (patch && patch.length < Buffer.from(editingEntry.body, "utf-8").length) {
            newBody = patch;
        }

        const meta = extractMetaData(body);
        const jsonMeta = Object.assign({}, json_metadata, meta, {tags});

        this.stateSet({posting: true});
        comment(activeUser?.username!, "", category, permlink, title, newBody, jsonMeta, null)
            .then(() => {
                this.stateSet({posting: false});

                // Update the entry object in store
                const entry: Entry = {
                    ...editingEntry,
                    title,
                    body,
                    category: tags[0],
                    json_metadata: jsonMeta,
                    updated: correctIsoDate(moment().toISOString())
                }
                updateEntry(entry);

                success(_t("submit.updated"));
                const newLoc = makePathEntry(category, author, permlink);
                history.push(newLoc);
            })
            .catch((e) => {
                this.stateSet({posting: false});
                error(formatError(e));
            });
    };

    cancelUpdate = () => {
        const {history} = this.props;
        const {editingEntry} = this.state;
        if (!editingEntry) {
            return;
        }

        const newLoc = makePathEntry(editingEntry?.category!, editingEntry.author, editingEntry.permlink);
        history.push(newLoc);
    };

    saveDraft = () => {
        if (!this.validate()) {
            return;
        }

        const {activeUser, history} = this.props;
        const {title, body, tags, editingDraft} = this.state;
        const tagJ = tags.join(' ');

        let promise: Promise<any>;

        this.stateSet({saving: true});

        if (editingDraft) {
            promise = updateDraft(activeUser?.username!, editingDraft._id, title, body, tagJ).then(() => {
                success(_t('submit.draft-updated'));
            })
        } else {
            promise = addDraft(activeUser?.username!, title, body, tagJ).then(resp => {
                success(_t('submit.draft-saved'));

                const {drafts} = resp;
                const draft = drafts[drafts.length - 1];

                history.push(`/draft/${draft._id}`);
            })
        }

        promise.catch(() => error(_t('g.server-error'))).finally(() => this.stateSet({saving: false}))
    }

    schedule = async () => {
        if (!this.validate()) {
            return;
        }

        const {activeUser} = this.props;
        const {title, tags, body, reward, reblogSwitch, beneficiaries, schedule} = this.state;

        // make sure active user and schedule date has set
        if (!activeUser || !schedule) {
            return;
        }

        this.stateSet({posting: true});

        let author = activeUser.username;

        let permlink = createPermlink(title);

        // permlink duplication check
        let c;
        try {
            c = await bridgeApi.getPost(author, permlink);
        } catch (e) {
        }

        if (c && c.author) {
            // create permlink with random suffix
            permlink = createPermlink(title, true);
        }

        const meta = extractMetaData(body);
        const jsonMeta = makeJsonMetaData(meta, tags, version);
        const options = makeCommentOptions(author, permlink, reward, beneficiaries);

        const reblog = isCommunity(tags[0]) && reblogSwitch;

        this.stateSet({posting: true});
        addSchedule(author, permlink, title, body, jsonMeta, options, schedule, reblog).then(resp => {
            success(_t('submit.scheduled'));
            this.clear();
        }).catch((e) => {
            if (e.response?.data?.message) {
                error(e.response?.data?.message);
            } else {
                error(_t('g.server-error'))
            }
        }).finally(() => this.stateSet({posting: false}))
    }

    render() {
        const {title, tags, body, reward, preview, posting, editingEntry, saving, editingDraft, advanced, beneficiaries, schedule, reblogSwitch, clearModal} = this.state;

        //  Meta config
        const metaProps = {
            title: _t("submit.page-title"),
            description: _t("submit.page-description"),
        };

        const {global, activeUser} = this.props;

        const spinner = <Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>;
        const isMobile = typeof window !== 'undefined' && window.innerWidth < 570;
        return (
            <>
                <Meta {...metaProps} />
                <FullHeight/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {clearModal && <ModalConfirm onConfirm={this.clear} onCancel={() => this.setState({clearModal:false})}/>}
                {global.isElectron && <MdHandler global={this.props.global} history={this.props.history}/>}
                {global.isElectron ?
                    NavBarElectron({
                        ...this.props,
                    }) :
                    NavBar({ ...this.props })}

                <div className={_c(`app-content submit-page ${editingEntry !== null ? "editing" : ""}`)}>
                    <div className="editor-panel">
                        {(editingEntry === null && activeUser) && <div className="community-input">
                            {CommunitySelector({
                                ...this.props,
                                activeUser,
                                tags,
                                onSelect: (prev, next) => {
                                    const {tags} = this.state;

                                    const newTags = [
                                        ...[next ? next : ""],
                                        ...tags.filter(x => x !== prev)
                                    ].filter(x => x);

                                    this.tagsChanged(newTags);
                                }
                            })}
                        </div>}
                        {EditorToolbar({...this.props})}
                        <div className="title-input">
                            <Form.Control
                                className="accepts-emoji"
                                placeholder={_t("submit.title-placeholder")}
                                autoFocus={true}
                                value={title}
                                onChange={this.titleChanged}
                                spellCheck={true}
                            />
                        </div>
                        <div className="tag-input">
                            {TagSelector({
                                ...this.props,
                                tags,
                                maxItem: 10,
                                onChange: this.tagsChanged,
                            })}
                        </div>
                        <div className="body-input">
                           {isMobile ? <ResizableTextarea
                                id="the-editor-xs"
                                className="the-editor accepts-emoji form-control"
                                placeholder={_t("submit.body-placeholder")}
                                value={body}
                                onChange={this.bodyChanged}
                                minRows={10}
                                maxRows={100}
                                spellCheck={true}
                                /> : <Form.Control
                                id="the-editor"
                                className="the-editor accepts-emoji"
                                as="textarea"
                                placeholder={_t("submit.body-placeholder")}
                                value={body}
                                onChange={this.bodyChanged}
                                rows={10}
                                spellCheck={true}
                            />}
                        </div>
                        {editingEntry === null && (
                            <div className="bottom-toolbar">
                                <Button variant="outline-info" onClick={()=>this.setState({clearModal: true})}>
                                    {_t("submit.clear")}
                                </Button>
                                <Button variant="outline-primary" onClick={this.toggleAdvanced}>
                                    {advanced ?
                                        _t("submit.preview") :
                                        <>
                                            {_t("submit.advanced")}
                                            {this.hasAdvanced() ? " •••" : null}
                                        </>}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex-spacer"/>
                    {(() => {
                        const toolBar = schedule ?
                            <div className="bottom-toolbar">
                                <span/>
                                {LoginRequired({
                                    ...this.props,
                                    children: <Button
                                        className="d-inline-flex align-items-center"
                                        onClick={this.schedule}
                                        disabled={posting}
                                    >
                                        {posting && spinner}
                                        {_t("submit.schedule")}
                                    </Button>
                                })}
                            </div> :
                            <div className="bottom-toolbar">
                                {editingEntry === null && (
                                    <>
                                        <span/>
                                        <div>
                                            {global.usePrivate && (
                                                <Button variant="outline-primary" style={{marginRight: "6px"}} onClick={this.saveDraft} disabled={saving || posting}>
                                                    {contentSaveSvg} {editingDraft === null ? _t("submit.save-draft") : _t("submit.update-draft")}
                                                </Button>)}
                                            {LoginRequired({
                                                ...this.props,
                                                children: <Button
                                                    className="d-inline-flex align-items-center"
                                                    onClick={this.publish}
                                                    disabled={posting || saving}
                                                >
                                                    {posting && spinner}
                                                    {_t("submit.publish")}
                                                </Button>
                                            })}
                                        </div>
                                    </>
                                )}

                                {editingEntry !== null && (
                                    <>
                                        <Button variant="outline-secondary" onClick={this.cancelUpdate}>
                                            {_t("submit.cancel-update")}
                                        </Button>
                                        {LoginRequired({
                                            ...this.props,
                                            children: <Button
                                                className="d-inline-flex align-items-center"
                                                onClick={this.update}
                                                disabled={posting}
                                            >
                                                {posting && spinner}
                                                {_t("submit.update")}
                                            </Button>
                                        })}
                                    </>
                                )}
                            </div>;

                        if (advanced) {
                            return <div className="advanced-panel">
                                <div className="panel-header">
                                    <h2 className="panel-header-title">{_t("submit.advanced")}</h2>
                                </div>
                                <div className="panel-body">
                                    <div className="container">
                                        <Form.Group as={Row}>
                                            <Form.Label column={true} sm="3">
                                                {_t("submit.reward")}
                                            </Form.Label>
                                            <Col sm="9">
                                                <Form.Control as="select" value={reward} onChange={this.rewardChanged}>
                                                    <option value="default">{_t("submit.reward-default")}</option>
                                                    <option value="sp">{_t("submit.reward-sp")}</option>
                                                    <option value="dp">{_t("submit.reward-dp")}</option>
                                                </Form.Control>
                                                <Form.Text muted={true}>{_t("submit.reward-hint")}</Form.Text>
                                            </Col>
                                        </Form.Group>
                                        <Form.Group as={Row}>
                                            <Form.Label column={true} sm="3">
                                                {_t("submit.beneficiaries")}
                                            </Form.Label>
                                            <Col sm="9">
                                                <BeneficiaryEditor author={activeUser?.username} list={beneficiaries} onAdd={this.beneficiaryAdded}
                                                                   onDelete={this.beneficiaryDeleted}/>
                                                <Form.Text muted={true}>{_t("submit.beneficiaries-hint")}</Form.Text>
                                            </Col>
                                        </Form.Group>
                                        {global.usePrivate && <Form.Group as={Row}>
                                          <Form.Label column={true} sm="3">
                                              {_t("submit.schedule")}
                                          </Form.Label>
                                          <Col sm="9">
                                            <PostScheduler date={schedule ? moment(schedule) : null} onChange={this.scheduleChanged}/>
                                            <Form.Text muted={true}>{_t("submit.schedule-hint")}</Form.Text>
                                          </Col>
                                        </Form.Group>}
                                        {tags.length > 0 && isCommunity(tags[0]) && (
                                            <Form.Group as={Row}>
                                                <Col sm="3"/>
                                                <Col sm="9">
                                                    <Form.Check
                                                        type="switch"
                                                        id="reblog-switch"
                                                        label={_t("submit.reblog")}
                                                        checked={reblogSwitch}
                                                        onChange={this.reblogSwitchChanged}
                                                    />
                                                    <Form.Text muted={true}>{_t("submit.reblog-hint")}</Form.Text>
                                                </Col>
                                            </Form.Group>
                                        )}
                                    </div>
                                </div>
                                {toolBar}
                            </div>
                        }

                        return <div className="preview-panel">
                            <div className="panel-header">
                                <h2 className="panel-header-title">{_t("submit.preview")}</h2>
                                <WordCount selector=".preview-body" watch={true}/>
                            </div>
                            <PreviewContent history={this.props.history} global={this.props.global} {...preview} />
                            {toolBar}
                        </div>;
                    })()}
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SubmitPage);
