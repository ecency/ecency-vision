import React, { Component } from "react";

import { connect } from "react-redux";

import { match } from "react-router";

import queryString from "query-string";

import isEqual from "react-fast-compare";

import { History } from "history";

import { Button, Col, Form, FormControl, Row, Spinner } from "react-bootstrap";

import moment, { Moment } from "moment";

import defaults from "../constants/defaults.json";
import {
  postBodySummary,
  proxifyImageSrc,
  renderPostBody,
  setProxyBase
} from "@ecency/render-helper";
import { Entry } from "../store/entries/types";
import { Global } from "../store/global/types";
import { FullAccount } from "../store/accounts/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Theme from "../components/theme";
import Feedback, { error, success } from "../components/feedback";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import FullHeight from "../components/full-height";
import EditorToolbar from "../components/editor-toolbar";
import TagSelector from "../components/tag-selector";
import CommunitySelector from "../components/community-selector";
import Tag from "../components/tag";
import LoginRequired from "../components/login-required";
import WordCount from "../components/word-counter";
import { makePath as makePathEntry } from "../components/entry-link";
import MdHandler from "../components/md-handler";
import BeneficiaryEditor from "../components/beneficiary-editor";
import PostScheduler from "../components/post-scheduler";
import ClickAwayListener from "../components/clickaway-listener";
import { detectEvent, toolbarEventListener } from "../components/editor-toolbar";
import "./submit.scss";

import {
  addDraft,
  addSchedule,
  Draft,
  DraftMetadata,
  getDrafts,
  updateDraft
} from "../api/private-api";

import {
  createPatch,
  createPermlink,
  extractMetaData,
  makeCommentOptions,
  makeJsonMetaData
} from "../helper/posting";

import tempEntry, { correctIsoDate } from "../helper/temp-entry";
import isCommunity from "../helper/is-community";

import { BeneficiaryRoute, comment, formatError, reblog, RewardType } from "../api/operations";

import * as bridgeApi from "../api/bridge";
import * as hiveApi from "../api/hive";

import { _t } from "../i18n";

import _c from "../util/fix-class-names";

import * as ls from "../util/local-storage";

import { version } from "../../../package.json";

import { checkSvg, contentSaveSvg, contentLoadSvg, helpIconSvg } from "../img/svg";

import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import ModalConfirm from "../components/modal-confirm";
import TextareaAutocomplete from "../components/textarea-autocomplete";
import Drafts from "../components/drafts";
import { AvailableCredits } from "../components/available-credits";
import { handleFloatingContainer } from "../components/floating-faq";

setProxyBase(defaults.imageServer);

interface PostBase {
  title: string;
  tags: string[];
  body: string;
  description: string | null;
}

interface Advanced {
  reward: RewardType;
  beneficiaries: BeneficiaryRoute[];
  schedule: string | null;
  reblogSwitch: boolean;
  description: string | null;
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
    const { title, tags, body, global } = this.props;
    let renderedPreview = renderPostBody(body, false, global.canUseWebp);
    return (
      <>
        <div className="preview-title">{title}</div>

        <div className="preview-tags">
          {tags.map((x) => {
            return (
              <span className="preview-tag" key={x}>
                {Tag({
                  ...this.props,
                  tag: x,
                  children: <span>{x}</span>,
                  type: "span"
                })}
              </span>
            );
          })}
        </div>

        <div
          className="preview-body markdown-view"
          dangerouslySetInnerHTML={{ __html: renderedPreview }}
        />
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
  description: string | null;
  editingEntry: Entry | null;
  saving: boolean;
  editingDraft: Draft | null;
  advanced: boolean;
  clearModal: boolean;
  disabled: boolean;
  thumbnails: string[];
  selectedThumbnail: string;
  selectionTouched: boolean;
  isDraftEmpty: boolean;
  drafts: boolean;
  showHelp: boolean;
}

class SubmitPage extends BaseComponent<Props, State> {
  postBodyRef: React.RefObject<HTMLDivElement>;
  constructor(props: Props) {
    super(props);
    this.postBodyRef = React.createRef();
  }
  state: State = {
    title: "",
    tags: [],
    body: "",
    description: null,
    reward: "default",
    posting: false,
    editingEntry: null,
    saving: false,
    editingDraft: null,
    selectionTouched: false,
    advanced: false,
    beneficiaries: [],
    thumbnails: [],
    selectedThumbnail: "",
    schedule: null,
    reblogSwitch: false,
    clearModal: false,
    preview: {
      title: "",
      tags: [],
      body: "",
      description: ""
    },
    disabled: true,
    isDraftEmpty: true,
    drafts: false,
    showHelp: false
  };

  _updateTimer: any = null;

  componentDidMount = (): void => {
    this.loadLocalDraft();

    this.loadAdvanced();

    this.detectCommunity();

    this.detectEntry().then();

    this.detectDraft().then();

    let selectedThumbnail = ls.get("draft_selected_image");
    if (selectedThumbnail?.length > 0) {
      this.selectThumbnails(selectedThumbnail);
    }

    this.addToolbarEventListners();
    if (typeof window !== "undefined") {
      window.addEventListener("resize", this.handleResize);
    }
  };

  componentDidUpdate(prevProps: Readonly<Props>) {
    const { activeUser, location } = this.props;

    // active user changed
    if (activeUser?.username !== prevProps.activeUser?.username) {
      // delete active user from beneficiaries list
      if (activeUser) {
        const { beneficiaries } = this.state;
        if (beneficiaries.find((x) => x.account === activeUser.username)) {
          const b = [...beneficiaries.filter((x) => x.account !== activeUser.username)];
          this.stateSet({ beneficiaries: b });
        }
      }
    }

    // location change. only occurs once a draft picked on drafts dialog
    if (location.pathname !== prevProps.location.pathname) {
      this.detectDraft().then();
    }
  }

  componentWillUnmount(): void {
    this.removeToolbarEventListners();
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", this.handleResize);
    }
  }

  addToolbarEventListners = () => {
    if (this.postBodyRef) {
      const el = this.postBodyRef?.current;

      if (el) {
        el.addEventListener("paste", this.handlePaste);
        el.addEventListener("dragover", this.handleDragover);
        el.addEventListener("drop", this.handleDrop);
      }
    }
  };

  removeToolbarEventListners = () => {
    if (this.postBodyRef) {
      const el = this.postBodyRef?.current;

      if (el) {
        el.removeEventListener("paste", this.handlePaste);
        el.removeEventListener("dragover", this.handleDragover);
        el.removeEventListener("drop", this.handleDrop);
      }
    }
  };

  handleResize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      this.setState({ showHelp: false });
      handleFloatingContainer(false, "submit");
    }
  };

  handlePaste = (event: Event): void => {
    toolbarEventListener(event, "paste");
  };

  handleDragover = (event: Event): void => {
    toolbarEventListener(event, "dragover");
  };

  handleDrop = (event: Event): void => {
    toolbarEventListener(event, "drop");
  };

  handleValidForm = (value: boolean) => {
    this.setState({ disabled: value });
  };

  isEntry = (): boolean => {
    const { match, activeUser } = this.props;
    const { path, params } = match;

    return !!(activeUser && path.endsWith("/edit") && params.username && params.permlink);
  };

  isDraft = (): boolean => {
    const { match, activeUser } = this.props;
    const { path, params } = match;

    return !!(activeUser && path.startsWith("/draft") && params.draftId);
  };

  detectEntry = async () => {
    const { match, history } = this.props;
    const { params } = match;

    if (this.isEntry()) {
      let entry;
      try {
        entry = await bridgeApi.normalizePost(
          await hiveApi.getPost(params.username!.replace("@", ""), params.permlink!)
        );
      } catch (e) {
        error(...formatError(e));
        return;
      }

      if (!entry) {
        error("Could not fetch post data.");
        history.push("/submit");
        return;
      }

      const { title, body } = entry;

      let description = entry.json_metadata?.description || postBodySummary(body, 200);
      let tags = entry.json_metadata?.tags || [];
      tags = [...new Set(tags)];

      this.stateSet({ title, tags, body, description, editingEntry: entry }, this.updatePreview);
    } else {
      if (this.state.editingEntry) {
        this.stateSet({ editingEntry: null });
      }
    }
  };

  detectDraft = async () => {
    const { match, activeUser, history } = this.props;
    const { params } = match;

    if (this.isDraft()) {
      let drafts: Draft[];

      try {
        drafts = await getDrafts(activeUser?.username!);
      } catch (err) {
        drafts = [];
      }

      drafts = drafts.filter((x) => x._id === params.draftId);
      if (drafts?.length === 1) {
        const [draft] = drafts;
        const { title, body } = draft;

        let tags: string[];

        try {
          tags = draft.tags.trim() ? draft.tags.split(/[ ,]+/) : [];
        } catch (e) {
          tags = [];
        }

        const image = draft.meta?.image && draft.meta?.image.length > 0 ? draft.meta.image[0] : "";
        this.stateSet(
          {
            title,
            tags,
            body,
            editingDraft: draft,
            beneficiaries: draft.meta?.beneficiaries || [],
            reward: draft.meta?.rewardType || "default",
            selectedThumbnail: image,
            description: draft.meta?.description || ""
          },
          this.updatePreview
        );
      } else {
        error("Could not fetch draft data.");
        history.push("/submit");
        return;
      }
    } else {
      if (this.state.editingDraft) {
        this.stateSet({ editingDraft: null });
      }
    }
  };

  detectCommunity = () => {
    const { location } = this.props;
    const qs = queryString.parse(location.search);
    if (qs.com) {
      const com = qs.com as string;

      this.stateSet({ tags: [com] });
    }
  };

  loadLocalDraft = (): void => {
    if (this.isEntry() || this.isDraft()) {
      return;
    }

    const localDraft = ls.get("local_draft") as PostBase;
    if (!localDraft) {
      this.stateSet({ isDraftEmpty: true });
      return;
    }

    const { title, tags, body } = localDraft;
    this.stateSet({ title, tags, body }, this.updatePreview);

    for (const key in localDraft) {
      if (localDraft && localDraft[key] && localDraft[key].length > 0) {
        this.stateSet({ isDraftEmpty: false });
      }
    }
  };

  saveLocalDraft = (): void => {
    const { title, tags, body, description } = this.state;
    const localDraft: PostBase = { title, tags, body, description };
    ls.set("local_draft", localDraft);
  };

  loadAdvanced = (): void => {
    const advanced = ls.get("local_advanced") as Advanced;
    if (!advanced) {
      return;
    }

    this.stateSet({ ...advanced });
  };

  saveAdvanced = (): void => {
    const { reward, beneficiaries, schedule, reblogSwitch, description } = this.state;

    const advanced: Advanced = {
      reward,
      beneficiaries,
      schedule,
      reblogSwitch,
      description
    };

    ls.set("local_advanced", advanced);
  };

  hasAdvanced = (): boolean => {
    const { reward, beneficiaries, schedule, reblogSwitch, description } = this.state;

    return (
      reward !== "default" ||
      beneficiaries?.length > 0 ||
      schedule !== null ||
      reblogSwitch ||
      description !== ""
    );
  };

  titleChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: title } = e.target;
    this.stateSet({ title }, () => {
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

    this.stateSet({ tags }, () => {
      this.updatePreview();
    });

    // Toggle off reblog switch if it is true and the first tag is not community tag.
    const { reblogSwitch } = this.state;
    if (reblogSwitch) {
      const isCommunityTag = tags?.length > 0 && isCommunity(tags[0]);

      if (!isCommunityTag) {
        this.stateSet({ reblogSwitch: false }, this.saveAdvanced);
      }
    }
  };

  bodyChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: body } = e.target;
    this.stateSet({ body }, () => {
      this.updatePreview();
    });
  };

  descriptionChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const { value: description } = e.target;
    this.stateSet({ description }, this.saveAdvanced);
  };

  rewardChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    const reward = e.target.value as RewardType;
    this.stateSet({ reward }, this.saveAdvanced);
  };

  beneficiaryAdded = (item: BeneficiaryRoute) => {
    const { beneficiaries } = this.state;
    const b = [...beneficiaries, item].sort((a, b) => (a.account < b.account ? -1 : 1));
    this.stateSet({ beneficiaries: b }, this.saveAdvanced);
  };

  beneficiaryDeleted = (username: string) => {
    const { beneficiaries } = this.state;
    const b = [...beneficiaries.filter((x) => x.account !== username)];
    this.stateSet({ beneficiaries: b }, this.saveAdvanced);
  };

  scheduleChanged = (d: Moment | null) => {
    this.stateSet({ schedule: d ? d.toISOString(true) : null }, this.saveAdvanced);
  };

  reblogSwitchChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
    this.stateSet({ reblogSwitch: e.target.checked }, this.saveAdvanced);
  };

  clear = (): void => {
    this.stateSet(
      {
        title: "",
        tags: [],
        body: "",
        advanced: false,
        reward: "default",
        beneficiaries: [],
        schedule: null,
        reblogSwitch: false,
        clearModal: false,
        isDraftEmpty: true
      },
      () => {
        this.clearAdvanced();
        this.updatePreview();
        ls.remove("draft_selected_image");
      }
    );

    const { editingDraft } = this.state;
    if (editingDraft) {
      const { history } = this.props;
      history.push("/submit");
    }
  };

  clearAdvanced = (): void => {
    this.stateSet(
      {
        advanced: false,
        reward: "default",
        beneficiaries: [],
        schedule: null,
        reblogSwitch: false,
        description: ""
      },
      () => {
        this.saveAdvanced();
      }
    );
  };

  toggleAdvanced = (): void => {
    const { advanced } = this.state;
    this.stateSet({ advanced: !advanced });
  };

  updatePreview = (): void => {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = null;
    }

    this._updateTimer = setTimeout(() => {
      const { title, tags, body, editingEntry, description } = this.state;
      const { thumbnails } = extractMetaData(body);
      this.stateSet({ preview: { title, tags, body, description }, thumbnails: thumbnails || [] });
      if (editingEntry === null) {
        this.saveLocalDraft();
      }
      if (title?.length || tags?.length || body?.length) {
        this.stateSet({ isDraftEmpty: false });
      } else {
        this.stateSet({ isDraftEmpty: true });
      }
    }, 500);
  };

  focusInput = (parentSelector: string): void => {
    const el = document.querySelector(`${parentSelector} .form-control`) as HTMLInputElement;
    if (el) {
      el.focus();
    }
  };

  validate = (): boolean => {
    const { title, tags, body } = this.state;

    if (title.trim() === "") {
      this.focusInput(".title-input");
      error(_t("submit.empty-title-alert"));
      return false;
    }

    if (tags?.length === 0) {
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
  };

  publish = async (): Promise<void> => {
    if (!this.validate()) {
      return;
    }

    const { activeUser, history, addEntry } = this.props;
    const { title, tags, body, description, reward, reblogSwitch, beneficiaries } = this.state;

    // clean body
    const cbody = body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

    // make sure active user fully loaded
    if (!activeUser || !activeUser.data.__loaded) {
      return;
    }

    this.stateSet({ posting: true });

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
    let jsonMeta = this.buildMetadata();
    if (jsonMeta && jsonMeta.image && jsonMeta.image.length > 0) {
      jsonMeta.image_ratios = await Promise.all(
        jsonMeta.image
          .slice(0, 5)
          .map((element: string) => this.getHeightAndWidthFromDataUrl(proxifyImageSrc(element)))
      );
    }

    const options = makeCommentOptions(author, permlink, reward, beneficiaries);
    this.stateSet({ posting: true });
    comment(author, "", parentPermlink, permlink, title, cbody, jsonMeta, options, true)
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
            tags,
            description
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
        error(...formatError(e));
      })
      .finally(() => {
        this.stateSet({ posting: false });
      });
  };

  update = async (): Promise<void> => {
    if (!this.validate()) {
      return;
    }

    const { activeUser, updateEntry, history } = this.props;
    const { title, tags, body, description, editingEntry } = this.state;
    if (!editingEntry) {
      return;
    }

    const { body: oldBody, author, permlink, category, json_metadata } = editingEntry;
    // clean and copy body
    let newBody = body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");
    const patch = createPatch(oldBody, newBody.trim());
    if (patch && patch.length < Buffer.from(editingEntry.body, "utf-8").length) {
      newBody = patch;
    }

    let jsonMeta = Object.assign(
      {},
      json_metadata,
      this.buildMetadata(),
      { tags },
      { description }
    );

    if (jsonMeta && jsonMeta.image && jsonMeta.image.length > 0) {
      jsonMeta.image_ratios = await Promise.all(
        jsonMeta.image
          .slice(0, 5)
          .map((element: string) => this.getHeightAndWidthFromDataUrl(proxifyImageSrc(element)))
      );
    }

    this.stateSet({ posting: true });

    comment(activeUser?.username!, "", category, permlink, title, newBody, jsonMeta, null)
      .then(() => {
        this.stateSet({ posting: false });

        // Update the entry object in store
        const entry: Entry = {
          ...editingEntry,
          title,
          body,
          category: tags[0],
          json_metadata: jsonMeta,
          updated: correctIsoDate(moment().toISOString())
        };
        updateEntry(entry);

        success(_t("submit.updated"));
        const newLoc = makePathEntry(category, author, permlink);
        history.push(newLoc);
      })
      .catch((e) => {
        this.stateSet({ posting: false });
        error(...formatError(e));
      });
  };

  cancelUpdate = () => {
    const { history } = this.props;
    const { editingEntry } = this.state;
    if (!editingEntry) {
      return;
    }

    const newLoc = makePathEntry(
      editingEntry?.category!,
      editingEntry.author,
      editingEntry.permlink
    );
    history.push(newLoc);
  };

  saveDraft = () => {
    if (!this.validate()) {
      return;
    }

    const { activeUser, history } = this.props;
    const { title, body, tags, editingDraft, beneficiaries, reward, schedule } = this.state;
    const tagJ = tags.join(" ");

    const meta = this.buildMetadata();
    const draftMeta: DraftMetadata = {
      ...meta,
      beneficiaries,
      rewardType: reward
    };

    let promise: Promise<any>;

    this.stateSet({ saving: true });

    if (editingDraft) {
      promise = updateDraft(
        activeUser?.username!,
        editingDraft._id,
        title,
        body,
        tagJ,
        draftMeta
      ).then(() => {
        success(_t("submit.draft-updated"));
      });
    } else {
      promise = addDraft(activeUser?.username!, title, body, tagJ, draftMeta).then((resp) => {
        success(_t("submit.draft-saved"));

        const { drafts } = resp;
        const draft = drafts[drafts?.length - 1];

        history.push(`/draft/${draft._id}`);
      });
    }

    promise
      .catch(() => error(_t("g.server-error")))
      .finally(() => this.stateSet({ saving: false }));
  };

  schedule = async () => {
    if (!this.validate()) {
      return;
    }

    const { activeUser } = this.props;
    const { title, tags, body, reward, reblogSwitch, beneficiaries, schedule, description } =
      this.state;

    // make sure active user and schedule date has set
    if (!activeUser || !schedule) {
      return;
    }

    this.stateSet({ posting: true });

    let author = activeUser.username;

    let permlink = createPermlink(title);

    // permlink duplication check
    let c;
    try {
      c = await bridgeApi.getPost(author, permlink);
    } catch (e) {}

    if (c && c.author) {
      // create permlink with random suffix
      permlink = createPermlink(title, true);
    }

    const meta = extractMetaData(body);
    const jsonMeta = makeJsonMetaData(meta, tags, description, version);
    const options = makeCommentOptions(author, permlink, reward, beneficiaries);

    const reblog = isCommunity(tags[0]) && reblogSwitch;

    this.stateSet({ posting: true });
    addSchedule(author, permlink, title, body, jsonMeta, options, schedule, reblog)
      .then((resp) => {
        success(_t("submit.scheduled"));
        this.clear();
      })
      .catch((e) => {
        if (e.response?.data?.message) {
          error(e.response?.data?.message);
        } else {
          error(_t("g.server-error"));
        }
      })
      .finally(() => this.stateSet({ posting: false }));
  };

  selectThumbnails = (selectedThumbnail: string) => {
    this.setState({ selectedThumbnail });
    ls.set("draft_selected_image", selectedThumbnail);
  };

  buildMetadata = () => {
    const { tags, body, description, selectedThumbnail, selectionTouched } = this.state;
    const { thumbnails, ...meta } = extractMetaData(body);
    let localThumbnail = ls.get("draft_selected_image");

    if (meta.image) {
      if (selectionTouched) {
        meta.image = [selectedThumbnail, ...meta.image!.splice(0, 9)];
      } else {
        meta.image = [...meta.image!.splice(0, 9)];
      }
    } else if (selectedThumbnail === localThumbnail) {
      ls.remove("draft_selected_image");
    } else {
      meta.image = selectedThumbnail ? [selectedThumbnail] : [];
    }
    if (meta.image) {
      meta.image = [...new Set(meta.image)];
    }
    const summary = description === null ? postBodySummary(this.state.body, 200) : description;

    return makeJsonMetaData(meta, tags, summary, version);
  };

  getHeightAndWidthFromDataUrl = (dataURL: string) =>
    new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve(img.width / img.height);
      };
      img.onerror = function () {
        resolve(0);
      };
      img.src = dataURL;
    });

  handleShortcuts = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey && e.key === "b") {
      detectEvent("bold");
    }
    if (e.altKey && e.key === "i") {
      detectEvent("italic");
    }
    if (e.altKey && e.key === "t") {
      detectEvent("table");
    }
    if (e.altKey && e.key === "k") {
      detectEvent("link");
    }
    if (e.altKey && e.key === "c") {
      detectEvent("codeBlock");
    }
    if (e.altKey && e.key === "d") {
      detectEvent("image");
    }
    if (e.altKey && e.key === "m") {
      detectEvent("blockquote");
    }
  };

  handleFloatingFaq = () => {
    const { showHelp } = this.state;
    this.setState({ showHelp: !showHelp }, () =>
      handleFloatingContainer(this.state.showHelp, "submit")
    );
  };

  render() {
    const {
      title,
      tags,
      body,
      reward,
      preview,
      posting,
      editingEntry,
      saving,
      editingDraft,
      advanced,
      beneficiaries,
      schedule,
      reblogSwitch,
      clearModal,
      selectedThumbnail,
      thumbnails,
      disabled,
      drafts
    } = this.state;

    //  Meta config
    const ncount =
      this.props.notifications.unread > 0 ? `(${this.props.notifications.unread}) ` : "";
    const metaProps = {
      title: ncount + _t("submit.page-title"),
      description: _t("submit.page-description")
    };

    const { global, activeUser } = this.props;

    const spinner = (
      <Spinner animation="grow" variant="light" size="sm" style={{ marginRight: "6px" }} />
    );
    // const isMobile = typeof window !== 'undefined' && window.innerWidth < 570;
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";
    return (
      <>
        <Meta {...metaProps} />
        <FullHeight />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        {clearModal && (
          <ModalConfirm
            onConfirm={this.clear}
            onCancel={() => this.setState({ clearModal: false })}
          />
        )}
        {global.isElectron && <MdHandler global={this.props.global} history={this.props.history} />}
        {global.isElectron ? (
          NavBarElectron({
            ...this.props
          })
        ) : (
          <NavBar history={this.props.history} />
        )}

        <div
          className={_c(
            `app-content submit-page ${editingEntry !== null ? "editing" : ""} ${containerClasses}`
          )}
        >
          <div className="editor-panel">
            {editingEntry === null && activeUser && (
              <div className="community-input">
                {CommunitySelector({
                  ...this.props,
                  activeUser,
                  tags,
                  onSelect: (prev, next) => {
                    const { tags } = this.state;

                    const newTags = [
                      ...[next ? next : ""],
                      ...tags.filter((x) => x !== prev)
                    ].filter((x) => x);

                    this.tagsChanged(newTags);
                  }
                })}
              </div>
            )}
            {EditorToolbar({ ...this.props })}
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
                onValid: this.handleValidForm
              })}
            </div>
            <div className="body-input" onKeyDown={this.handleShortcuts} ref={this.postBodyRef}>
              <TextareaAutocomplete
                acceptCharset="UTF-8"
                global={this.props.global}
                id="the-editor"
                className="the-editor accepts-emoji form-control"
                as="textarea"
                placeholder={_t("submit.body-placeholder")}
                value={(body && body.length) > 0 ? body : preview.body}
                onChange={this.bodyChanged}
                disableRows={true}
                maxrows={100}
                spellCheck={true}
                activeUser={(activeUser && activeUser.username) || ""}
              />
            </div>
            {activeUser ? (
              <AvailableCredits
                className="mr-2"
                operation="comment_operation"
                username={activeUser.username}
                activeUser={activeUser}
                location={this.props.location}
              />
            ) : (
              <></>
            )}
            <div className="bottom-toolbar">
              {editingEntry === null && (
                <Button variant="outline-info" onClick={() => this.setState({ clearModal: true })}>
                  {_t("submit.clear")}
                </Button>
              )}

              <div className="d-flex align-items-center">
                <Button variant="outline-primary" onClick={this.toggleAdvanced} className="ml-auto">
                  {advanced ? (
                    _t("submit.preview")
                  ) : (
                    <>
                      {_t("submit.advanced")}
                      {this.hasAdvanced() ? " •••" : null}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
          <div className="flex-spacer" />
          {(() => {
            const toolBar = schedule ? (
              <div className="bottom-toolbar">
                <span />
                {LoginRequired({
                  ...this.props,
                  children: (
                    <Button
                      className="d-inline-flex align-items-center"
                      onClick={this.schedule}
                      disabled={posting}
                    >
                      {posting && spinner}
                      {_t("submit.schedule")}
                    </Button>
                  )
                })}
              </div>
            ) : (
              <div className="bottom-toolbar">
                {editingEntry === null && (
                  <>
                    <span />
                    <div className="action-buttons">
                      <ClickAwayListener onClickAway={() => this.setState({ showHelp: false })}>
                        <Button
                          className="help-button"
                          style={{ marginRight: "6px" }}
                          onClick={this.handleFloatingFaq}
                        >
                          {helpIconSvg} {_t("floating-faq.help")}
                        </Button>
                      </ClickAwayListener>
                      {global.usePrivate && this.state.isDraftEmpty ? (
                        <>
                          {LoginRequired({
                            ...this.props,
                            children: (
                              <Button
                                variant="outline-primary"
                                style={{ marginRight: "6px" }}
                                onClick={() => this.stateSet({ drafts: !drafts })}
                              >
                                {contentLoadSvg} {_t("submit.load-draft")}
                              </Button>
                            )
                          })}
                        </>
                      ) : (
                        <>
                          {LoginRequired({
                            ...this.props,
                            children: (
                              <Button
                                variant="outline-primary"
                                style={{ marginRight: "6px" }}
                                onClick={this.saveDraft}
                                disabled={disabled || saving || posting}
                              >
                                {contentSaveSvg}{" "}
                                {editingDraft === null
                                  ? _t("submit.save-draft")
                                  : _t("submit.update-draft")}
                              </Button>
                            )
                          })}
                        </>
                      )}
                      {LoginRequired({
                        ...this.props,
                        children: (
                          <Button
                            className="d-inline-flex align-items-center"
                            onClick={this.publish}
                            disabled={disabled || posting || saving}
                          >
                            {posting && spinner}
                            {_t("submit.publish")}
                          </Button>
                        )
                      })}
                    </div>
                  </>
                )}
                {drafts && activeUser && (
                  <Drafts {...this.props} onHide={() => this.setState({ drafts: !drafts })} />
                )}

                {editingEntry !== null && (
                  <>
                    <Button variant="outline-secondary" onClick={this.cancelUpdate}>
                      {_t("submit.cancel-update")}
                    </Button>
                    {LoginRequired({
                      ...this.props,
                      children: (
                        <Button
                          className="d-inline-flex align-items-center"
                          onClick={this.update}
                          disabled={posting}
                        >
                          {posting && spinner}
                          {_t("submit.update")}
                        </Button>
                      )
                    })}
                  </>
                )}
              </div>
            );

            if (advanced) {
              return (
                <div className="advanced-panel">
                  <div className="panel-header">
                    <h2 className="panel-header-title">{_t("submit.advanced")}</h2>
                  </div>
                  <div className="panel-body">
                    <div className="container">
                      {editingEntry === null && (
                        <>
                          <Form.Group as={Row}>
                            <Form.Label column={true} sm="3">
                              {_t("submit.reward")}
                            </Form.Label>
                            <Col sm="9">
                              <Form.Control
                                as="select"
                                value={reward}
                                onChange={this.rewardChanged}
                              >
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
                              <BeneficiaryEditor
                                author={activeUser?.username}
                                list={beneficiaries}
                                onAdd={this.beneficiaryAdded}
                                onDelete={this.beneficiaryDeleted}
                              />
                              <Form.Text muted={true}>{_t("submit.beneficiaries-hint")}</Form.Text>
                            </Col>
                          </Form.Group>
                        </>
                      )}
                      <Form.Group as={Row}>
                        <Form.Label column={true} sm="3">
                          {_t("submit.description")}
                        </Form.Label>
                        <Col sm="9">
                          <Form.Control
                            as="textarea"
                            value={this.state.description || postBodySummary(body, 200)}
                            onChange={this.descriptionChanged}
                            rows={3}
                            maxLength={200}
                          />
                          <Form.Text muted={true}>
                            {this.state.description !== ""
                              ? this.state.description
                              : postBodySummary(body, 200)}
                          </Form.Text>
                        </Col>
                      </Form.Group>
                      {editingEntry === null && (
                        <>
                          {global.usePrivate && (
                            <Form.Group as={Row}>
                              <Form.Label column={true} sm="3">
                                {_t("submit.schedule")}
                              </Form.Label>
                              <Col sm="9">
                                <PostScheduler
                                  date={schedule ? moment(schedule) : null}
                                  onChange={this.scheduleChanged}
                                />
                                <Form.Text muted={true}>{_t("submit.schedule-hint")}</Form.Text>
                              </Col>
                            </Form.Group>
                          )}
                        </>
                      )}
                      {editingEntry === null && tags?.length > 0 && isCommunity(tags[0]) && (
                        <Form.Group as={Row}>
                          <Col sm="3" />
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
                      {thumbnails?.length > 0 && (
                        <Form.Group as={Row}>
                          <Form.Label column={true} sm="3">
                            {_t("submit.thumbnail")}
                          </Form.Label>
                          <div className="col-sm-9 d-flex flex-wrap selection-container">
                            {[...new Set(thumbnails)]!.map((item, i) => {
                              let selectedItem = selectedThumbnail;
                              switch (selectedItem) {
                                case "":
                                  selectedItem = thumbnails[0];
                                  break;
                              }
                              if (!thumbnails.includes(selectedThumbnail)) {
                                selectedItem = thumbnails[0];
                              }
                              return (
                                <div className="position-relative" key={item + i}>
                                  <div
                                    className={`selection-item shadow ${
                                      selectedItem === item ? "selected" : ""
                                    } mr-3 mb-2`}
                                    style={{
                                      backgroundImage: `url("${proxifyImageSrc(item, 260, 200)}")`
                                    }}
                                    onClick={() => {
                                      this.selectThumbnails(item);
                                      this.setState({ selectionTouched: true });
                                    }}
                                    key={item}
                                  />
                                  {selectedItem === item && (
                                    <div className="text-success check position-absolute bg-white rounded-circle d-flex justify-content-center align-items-center">
                                      {checkSvg}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </Form.Group>
                      )}
                    </div>
                  </div>
                  {toolBar}
                </div>
              );
            }

            return (
              <div className="preview-panel">
                <div className="panel-header">
                  <h2 className="panel-header-title">{_t("submit.preview")}</h2>
                  <WordCount selector=".preview-body" watch={true} />
                </div>
                <PreviewContent
                  history={this.props.history}
                  global={this.props.global}
                  {...preview}
                />
                {toolBar}
              </div>
            );
          })()}
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SubmitPage as any);
