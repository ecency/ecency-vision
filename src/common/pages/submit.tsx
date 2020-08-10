import React, {Component} from "react";

import {connect} from "react-redux";

import {match} from "react-router";

import queryString from "query-string";

import isEqual from "react-fast-compare";

import {Form, FormControl, Button, Spinner} from "react-bootstrap";

import defaults from "../constants/defaults.json";

import {
    renderPostBody,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import {Entry} from "../store/entries/types";

import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import FullHeight from "../components/full-height";
import EditorToolbar from "../components/editor-toolbar";
import TagSelector from "../components/tag-selector";
import Tag from "../components/tag";
import LoginRequired from "../components/login-required";
import WordCount from "../components/word-counter";
import {makePath as makePathEntry} from "../components/entry-link";
import {error, success} from "../components/feedback";

import {getDrafts, addDraft, updateDraft, Draft} from "../api/private";

import {createPermlink, extractMetaData, makeJsonMetaData, makeCommentOptions, createPatch} from "../helper/posting";

import {RewardType, comment, formatError} from "../api/operations";
import * as bridgeApi from "../api/bridge";
import * as hiveApi from "../api/hive";

import {_t} from "../i18n";

import * as ls from "../util/local-storage";

import {version} from "../../../package.json";

import {contentSaveSvg} from "../img/svg";

interface PostBase {
    title: string;
    tags: string[];
    body: string;
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
        const {title, tags, body} = this.props;

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

                <div className="preview-body markdown-view" dangerouslySetInnerHTML={{__html: renderPostBody(body)}}/>
            </>
        );
    }
}

import {PageProps, pageMapDispatchToProps, pageMapStateToProps} from "./common";
import {History, Location} from "history";
import {Global} from "../store/global/types";

interface MatchParams {
    permlink?: string;
    username?: string;
    draftId?: string;
}

interface Props extends PageProps {
    match: match<MatchParams>;
}

interface State extends PostBase {
    reward: RewardType;
    preview: PostBase;
    inProgress: boolean;
    editingEntry: Entry | null;
    editingDraft: Draft | null;
}

class SubmitPage extends Component<Props, State> {
    state: State = {
        title: "",
        tags: [],
        body: "",
        reward: "default",
        inProgress: false,
        editingEntry: null,
        editingDraft: null,
        preview: {
            title: "",
            tags: [],
            body: "",
        },
    };

    _updateTimer: any = null;
    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    componentDidMount = (): void => {
        this.loadLocalDraft();

        this.detectCommunity();

        this.detectEntry().then();

        this.detectDraft().then();
    };

    componentDidUpdate(prevProps: Readonly<Props>) {
        const {activeUser, location} = this.props;

        // after first initial
        if (activeUser?.username !== prevProps.activeUser?.username) {
            this.detectEntry().then();
            this.detectDraft().then();
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
        const {match} = this.props;
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
        const {match, activeUser} = this.props;
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
        this.stateSet({title, tags, body});
    };

    saveLocalDraft = (): void => {
        const {title, tags, body} = this.state;
        const localDraft: PostBase = {title, tags, body};
        ls.set("local_draft", localDraft);
    };

    titleChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: title} = e.target;
        this.stateSet({title}, () => {
            this.updatePreview();
        });
    };

    tagsChanged = (tags: string[]): void => {
        this.stateSet({tags}, () => {
            this.updatePreview();
        });
    };

    bodyChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: body} = e.target;
        this.stateSet({body}, () => {
            this.updatePreview();
        });
    };

    rewardChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const reward = e.target.value as RewardType;
        this.stateSet({reward});
    };

    clear = (): void => {
        this.stateSet({title: "", tags: [], body: ""});
        this.updatePreview();
    };

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

    publish = async (): Promise<void> => {
        const {activeUser, history, addEntry} = this.props;
        const {title, tags, body, reward} = this.state;

        this.stateSet({inProgress: true});

        const author = activeUser?.username!;
        let permlink = createPermlink(title);

        // If permlink has already used create it again with random suffix
        let c;
        try {
            c = await bridgeApi.getPost(author, permlink);
        } catch (e) {
            c = null;
        }

        if (c && c.author) {
            permlink = createPermlink(title, true);
        }

        const [parentPermlink] = tags;
        const meta = extractMetaData(body);
        const jsonMeta = makeJsonMetaData(meta, tags, version);
        const options = makeCommentOptions(author, permlink, reward);

        this.stateSet({inProgress: true});
        comment(author, "", parentPermlink, permlink, title, body, jsonMeta, options)
            .then(() => hiveApi.getPost(author, permlink))
            .then((post: any) => bridgeApi.normalizePost(post))
            .then((entry: Entry | null) => {
                this.stateSet({inProgress: false});

                success(_t("submit.published"));

                if (entry) {
                    addEntry(entry);
                }

                const newLoc = makePathEntry(parentPermlink, author, permlink);
                history.push(newLoc);
            })
            .catch((e) => {
                this.stateSet({inProgress: false});
                error(formatError(e));
            });
    };

    update = async (): Promise<void> => {
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

        this.stateSet({inProgress: true});
        comment(activeUser?.username!, "", category, permlink, title, newBody, jsonMeta, null)
            .then(() => hiveApi.getPost(author, permlink))
            .then((post: any) => bridgeApi.normalizePost(post))
            .then((entry: Entry | null) => {
                this.stateSet({inProgress: false});

                success(_t("submit.updated"));

                if (entry) {
                    updateEntry(entry);
                }

                const newLoc = makePathEntry(category, author, permlink);
                history.push(newLoc);
            })
            .catch((e) => {
                this.stateSet({inProgress: false});
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
        const {activeUser, history} = this.props;
        const {title, body, tags, editingDraft} = this.state;
        const tagJ = tags.join(' ')

        let promise: Promise<any>;

        if (editingDraft) {
            promise = updateDraft(activeUser?.username!, editingDraft._id, title, body, tagJ).then(r => {
                console.log(r);
            })
        } else {
            promise = addDraft(activeUser?.username!, title, body, tagJ).then(resp => {
                const {drafts} = resp;
                const draft = drafts[drafts.length - 1];

                history.push(`/draft/${draft._id}`);
            })
        }

        promise
            .then(() => success(_t('submit.draft-saved')))
            .catch(() => error(_t('g.server-error')));
    }

    render() {
        const {title, tags, body, reward, preview, inProgress, editingEntry} = this.state;

        //  Meta config
        const metaProps = {
            title: "Create a post",
        };

        const canPublish = title.trim() !== "" && tags.length > 0 && tags.length <= 10 && body.trim() !== "";
        const spinner = <Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>;

        return (
            <>
                <Meta {...metaProps} />
                <FullHeight/>
                <Theme global={this.props.global}/>
                <Feedback/>
                {NavBar({...this.props})}

                <div className="app-content submit-page">
                    <div className="editor-side">
                        {EditorToolbar({...this.props})}
                        <div className="title-input">
                            <Form.Control
                                className="accepts-emoji"
                                placeholder={_t("submit.title-placeholder")}
                                autoFocus={true}
                                value={title}
                                onChange={this.titleChanged}
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
                            <Form.Control
                                id="the-editor"
                                className="the-editor accepts-emoji"
                                as="textarea"
                                placeholder={_t("submit.body-placeholder")}
                                value={body}
                                onChange={this.bodyChanged}
                            />
                        </div>
                        {editingEntry === null && (
                            <div className="bottom-toolbar">
                                <div className="reward">
                                    <span>{_t("submit.reward")}</span>
                                    <Form.Control as="select" value={reward} onChange={this.rewardChanged}>
                                        <option value="default">{_t("submit.reward-default")}</option>
                                        <option value="sp">{_t("submit.reward-sp")}</option>
                                        <option value="dp">{_t("submit.reward-dp")}</option>
                                    </Form.Control>
                                </div>
                                <Button variant="light" onClick={this.clear}>
                                    {_t("submit.clear")}
                                </Button>
                            </div>
                        )}
                    </div>
                    <div className="flex-spacer"/>
                    <div className="preview-side">
                        <div className="preview-header">
                            <h2 className="preview-header-title">{_t("submit.preview")}</h2>

                            <WordCount selector=".preview-body" watch={true}/>
                        </div>
                        <PreviewContent history={this.props.history} global={this.props.global} {...preview} />
                        <div className="bottom-toolbar">
                            {editingEntry === null && (
                                <>
                                    <span/>
                                    <div>
                                        <Button variant="outline-primary" style={{marginRight: "6px"}} onClick={this.saveDraft}>{contentSaveSvg} {_t("submit.save-draft")}</Button>
                                        {LoginRequired({
                                            ...this.props,
                                            children: <Button
                                                className="d-inline-flex align-items-center"
                                                onClick={this.publish}
                                                disabled={!canPublish || inProgress}
                                            >
                                                {inProgress && spinner}
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
                                            disabled={!canPublish || inProgress}
                                        >
                                            {inProgress && spinner}
                                            {_t("submit.update")}
                                        </Button>
                                    })}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </>
        );
    }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SubmitPage);
