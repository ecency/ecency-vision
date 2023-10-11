import React, { useEffect, useRef, useState } from "react";
import { Entry } from "../../store/entries/types";
import { Draft } from "../../api/private-api";
import { MatchType, PostBase, VideoProps } from "./types";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { extractMetaData } from "../../helper/posting";
import {
  BodyVersioningManager,
  ThreeSpeakManager,
  useAdvancedManager,
  useApiDraftDetector,
  useBodyVersioningManager,
  useCommunityDetector,
  useEntryDetector,
  useLocalDraftManager,
  useThreeSpeakManager
} from "./hooks";
import { postBodySummary, proxifyImageSrc } from "@ecency/render-helper";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import EditorToolbar, { toolbarEventListener } from "../../components/editor-toolbar";
import useMount from "react-use/lib/useMount";
import { handleFloatingContainer } from "../../components/floating-faq";
import { useUnmount } from "react-use";
import { useMappedStore } from "../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";
import { connect } from "react-redux";
import Meta from "../../components/meta";
import FullHeight from "../../components/full-height";
import Theme from "../../components/theme";
import Feedback, { error } from "../../components/feedback";
import ModalConfirm from "../../components/modal-confirm";
import { _t } from "../../i18n";
import MdHandler from "../../components/md-handler";
import NavBarElectron from "../../../desktop/app/components/navbar";
import NavBar from "../../components/navbar";
import _c from "../../util/fix-class-names";
import { Button, Col, Form, Row, Spinner } from "react-bootstrap";
import TextareaAutocomplete from "../../components/textarea-autocomplete";
import { AvailableCredits } from "../../components/available-credits";
import ClickAwayListener from "../../components/clickaway-listener";
import { checkSvg, contentLoadSvg, contentSaveSvg, helpIconSvg } from "../../img/svg";
import { BeneficiaryEditorDialog } from "../../components/beneficiary-editor";
import PostScheduler from "../../components/post-scheduler";
import moment from "moment/moment";
import isCommunity from "../../helper/is-community";
import WordCount from "../../components/word-counter";
import CommunitySelector from "../../components/community-selector";
import isEqual from "react-fast-compare";
import TagSelector from "../../components/tag-selector";
import { handleShortcuts } from "./functions";
import LoginRequired from "../../components/login-required";
import Drafts from "../../components/drafts";
import { usePublishApi, useSaveDraftApi, useScheduleApi } from "./api";
import { makePath as makePathEntry } from "../../components/entry-link";
import { RewardType } from "../../api/operations";
import { SubmitPreviewContent } from "./submit-preview-content";
import { useUpdateApi } from "./api/update";
import "./_index.scss";
import { SubmitVideoAttachments } from "./submit-video-attachments";
import { useThreeSpeakMigrationAdapter } from "./hooks/three-speak-migration-adapter";
import { useEntryCache } from "../../core/caches/entries-cache";

interface MatchProps {
  match: MatchType;
}

export function Submit(props: PageProps & MatchProps) {
  const postBodyRef = useRef<HTMLDivElement | null>(null);
  const threeSpeakManager = useThreeSpeakManager();
  const { body, setBody } = useBodyVersioningManager();
  const previousBody = usePrevious(body);

  const { activeUser } = useMappedStore();
  const previousActiveUser = usePrevious(activeUser);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail, removeThumbnail] = useLocalStorage<string>(
    PREFIX + "draft_selected_image"
  );
  const [clearModal, setClearModal] = useState(false);
  const [preview, setPreview] = useState<PostBase>({
    title: "",
    tags: [],
    body: "",
    description: ""
  });
  const [disabled, setDisabled] = useState(true);
  const [drafts, setDrafts] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [isDraftEmpty, setIsDraftEmpty] = useState(false);

  // Misc
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  let _updateTimer: any; // todo think about it

  const { setLocalDraft } = useLocalDraftManager(
    props.match,
    setIsDraftEmpty,
    (title, tags, body) => {
      setTitle(title);
      setTags(tags);
      setBody(body);
    }
  );
  const {
    advanced,
    setAdvanced,
    reward,
    setReward,
    description,
    setDescription,
    reblogSwitch,
    setReblogSwitch,
    beneficiaries,
    setBeneficiaries,
    schedule,
    setSchedule,
    hasAdvanced,
    clearAdvanced
  } = useAdvancedManager();

  useThreeSpeakMigrationAdapter({
    body,
    setBody
  });

  useCommunityDetector(props.location, (community) => {
    setTags([...tags, community]);
  });

  const { data } = useEntryCache(
    "",
    props.match.params.username?.replace("@", ""),
    props.match.params.permlink
  );

  useEntryDetector(props.match, props.history, (entry) => {
    if (entry) {
      setTitle(entry.title);
      setTags([...new Set(entry.json_metadata?.tags ?? [])]);
      setBody(entry.body);
      setDescription(entry.json_metadata?.description ?? postBodySummary(body, 200));
      data?.json_metadata?.image && setSelectedThumbnail(data?.json_metadata?.image[0]);
      setEditingEntry(entry);
      threeSpeakManager.setIsEditing(true);
    } else if (editingEntry) {
      setEditingEntry(null);
      threeSpeakManager.setIsEditing(false);
    } else {
      threeSpeakManager.setIsEditing(false);
    }
  });

  useApiDraftDetector(
    props.match,
    props.location,
    (draft) => {
      setTitle(draft.title);
      setTags(
        draft.tags
          .trim()
          .split(/[ ,]+/)
          .filter((t) => !!t)
      );
      setBody(draft.body);
      setEditingDraft(draft);
      setBeneficiaries(draft.meta?.beneficiaries ?? []);
      setReward(draft.meta?.rewardType ?? "default");
      setSelectedThumbnail(draft.meta?.image?.[0]);
      setDescription(draft.meta?.description ?? "");

      [...Object.values(draft.meta?.videos ?? {})].forEach((item) =>
        threeSpeakManager.attach(item)
      );

      setTimeout(() => setIsDraftEmpty(false), 100);
    },
    () => {
      clear();
      props.history.replace("/submit");
    }
  );

  const { mutateAsync: doSchedule, isLoading: posting } = useScheduleApi(() => clear());
  const { mutateAsync: saveDraft, isLoading: saving } = useSaveDraftApi(props.history);
  const { mutateAsync: publish, isLoading: publishing } = usePublishApi(props.history, () =>
    clear()
  );
  const { mutateAsync: update, isLoading: updating } = useUpdateApi(props.history, () => clear());

  useMount(() => {
    window.addEventListener("resize", handleResize);
  });

  useUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  useEffect(() => {
    if (postBodyRef.current) {
      postBodyRef.current.addEventListener("paste", (event) =>
        toolbarEventListener(event, "paste")
      );
      postBodyRef.current.addEventListener("dragover", (event) =>
        toolbarEventListener(event, "dragover")
      );
      postBodyRef.current.addEventListener("drop", (event) => toolbarEventListener(event, "drop"));
    }
  }, [postBodyRef]);

  useEffect(() => {
    if (activeUser?.username !== previousActiveUser?.username && activeUser && previousActiveUser) {
      // delete active user from beneficiaries list
      setBeneficiaries(beneficiaries.filter((x) => x.account !== activeUser.username));

      // clear not current user videos
      threeSpeakManager.clear();
    }
  }, [activeUser]);

  useEffect(() => {
    setLocalDraft({ tags, title, body, description });
  }, [tags, title, body]);

  useEffect(() => {
    handleFloatingContainer(showHelp, "submit");
  }, [showHelp]);

  useEffect(() => {
    updatePreview();
  }, [title, body, tags]);

  useEffect(() => {
    threeSpeakManager.checkBodyForVideos(body);
  }, [body]);

  const updatePreview = (): void => {
    if (_updateTimer) {
      clearTimeout(_updateTimer);
      _updateTimer = null;
    }

    // Not sure why we are using setTimeOut(), but it causes some odd behavior and sets input value to preview.body when you try to delete/cancel text
    _updateTimer = setTimeout(() => {
      const { thumbnails } = extractMetaData(body);
      setPreview({ title, tags, body, description });
      const existingImages = data.json_metadata.image ?? [];
      const newThumbnails = thumbnails ? [...existingImages, ...thumbnails] : existingImages;
      setThumbnails([...new Set(newThumbnails)]);
      if (editingEntry === null) {
        setLocalDraft({ title, tags, body, description });
      }
      setIsDraftEmpty(!Boolean(title?.length || tags?.length || body?.length));
    }, 50);
  };

  const handleResize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      setShowHelp(false);
      handleFloatingContainer(false, "submit");
    }
  };

  const clear = () => {
    setTitle("");
    setTags([]);
    setBody("");

    // clear advanced
    setAdvanced(false);
    setReward("default");
    setBeneficiaries([]);
    setSchedule(null);
    setReblogSwitch(false);
    setClearModal(false);
    setIsDraftEmpty(true);
    setDescription("");

    threeSpeakManager.clear();
    clearAdvanced();
    removeThumbnail();
  };

  const tagsChanged = (nextTags: string[]): void => {
    if (isEqual(tags, nextTags)) {
      // tag selector calls onchange event 2 times on each change.
      // one for add event one for sort event.
      // important to check if tags really changed.
      return;
    }

    setTags(nextTags);

    // Toggle off reblog switch if it is true and the first tag is not community tag.
    if (reblogSwitch) {
      const isCommunityTag = tags?.length > 0 && isCommunity(tags[0]);

      if (!isCommunityTag) {
        setReblogSwitch(false);
      }
    }
  };

  const setVideoEncoderBeneficiary = async (video: VideoProps) => {
    const videoBeneficiary = JSON.parse(video.beneficiaries);
    const videoEncoders = [
      {
        account: "spk.beneficiary",
        src: "ENCODER_PAY",
        weight: 900
      },
      {
        account: "threespeakleader",
        src: "ENCODER_PAY",
        weight: 100
      }
    ];
    const joinedBeneficiary = [...videoBeneficiary, ...videoEncoders];
    setBeneficiaries(joinedBeneficiary);
  };

  const cancelUpdate = () => {
    if (!editingEntry) {
      return;
    }

    const newLoc = makePathEntry(
      editingEntry?.category!,
      editingEntry.author,
      editingEntry.permlink
    );
    props.history.push(newLoc);
  };

  const focusInput = (parentSelector: string): void => {
    const el = document.querySelector(`${parentSelector} .form-control`) as HTMLInputElement;
    if (el) {
      el.focus();
    }
  };

  const validate = () => {
    if (title.trim() === "") {
      focusInput(".title-input");
      error(_t("submit.empty-title-alert"));
      return false;
    }

    if (tags?.length === 0) {
      focusInput(".tag-input");
      error(_t("submit.empty-tags-alert"));
      return false;
    }

    if (body.trim() === "") {
      focusInput(".body-input");
      error(_t("submit.empty-body-alert"));
      return false;
    }

    if (threeSpeakManager.hasMultipleUnpublishedVideo) {
      error(_t("submit.should-be-only-one-unpublished"));
      return false;
    }

    return true;
  };

  return (
    <>
      <Meta
        title={`(${props.notifications.unread || ""}) ` + _t("submit.page-title")}
        description={_t("submit.page-description")}
      />
      <FullHeight />
      <Theme global={props.global} />
      <Feedback activeUser={props.activeUser} />
      {clearModal && <ModalConfirm onConfirm={clear} onCancel={() => setClearModal(false)} />}
      {props.global.isElectron && <MdHandler global={props.global} history={props.history} />}
      {props.global.isElectron ? <NavBarElectron {...props} /> : <NavBar history={props.history} />}
      <div
        className={_c(
          `app-content submit-page ${editingEntry !== null ? "editing" : ""} ${
            props.global.isElectron ? " mt-0 pt-6" : ""
          }`
        )}
      >
        <div className="editor-panel">
          {editingEntry === null && activeUser && (
            <div className="community-input">
              <CommunitySelector
                global={props.global}
                activeUser={activeUser}
                tags={tags}
                onSelect={(prev, next) => {
                  const newTags = [...[next ? next : ""], ...tags.filter((x) => x !== prev)].filter(
                    (x) => x
                  );

                  tagsChanged(newTags);
                }}
              />
            </div>
          )}
          <EditorToolbar
            {...props}
            setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
            toggleNsfwC={() => {
              threeSpeakManager.setIsNsfw(true);
            }}
            comment={false}
            setVideoMetadata={(v) => {
              threeSpeakManager.attach(v);
              // Attach videos as special token in a body and render it in a preview
              setBody(`${body}\n[3speak](${v._id})`);
            }}
          />
          <div className="title-input">
            <Form.Control
              className="accepts-emoji"
              placeholder={_t("submit.title-placeholder")}
              autoFocus={true}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              spellCheck={true}
            />
          </div>
          <div className="tag-input">
            <TagSelector
              tags={tags}
              {...props}
              maxItem={10}
              onChange={tagsChanged}
              onValid={(v) => setDisabled(v)}
            />
          </div>
          <div className="body-input" onKeyDown={handleShortcuts} ref={postBodyRef}>
            <TextareaAutocomplete
              acceptCharset="UTF-8"
              global={props.global}
              id="the-editor"
              className="the-editor accepts-emoji form-control"
              as="textarea"
              placeholder={_t("submit.body-placeholder")}
              value={body && body.length > 0 ? body : preview.body}
              onChange={(e: { target: { value: string } }) => {
                setBody(e.target.value);
              }}
              disableRows={true}
              maxrows={100}
              spellCheck={true}
              activeUser={(activeUser && activeUser.username) || ""}
            />
          </div>
          <SubmitVideoAttachments />
          {activeUser ? (
            <AvailableCredits
              className="mr-2"
              operation="comment_operation"
              username={activeUser.username}
              activeUser={activeUser}
              location={props.location}
            />
          ) : (
            <></>
          )}
          <div className="bottom-toolbar">
            {editingEntry === null && editingDraft === null && (
              <Button variant="outline-info" onClick={() => setClearModal(true)}>
                {_t("submit.clear")}
              </Button>
            )}

            <div className="d-flex align-items-center">
              <Button
                variant="outline-primary"
                onClick={(e) => setAdvanced(!advanced)}
                className="ml-auto"
              >
                {advanced ? (
                  _t("submit.preview")
                ) : (
                  <>
                    {_t("submit.advanced")}
                    {hasAdvanced() ? " •••" : null}
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
              <LoginRequired {...props}>
                <Button
                  className="d-inline-flex align-items-center"
                  onClick={() => {
                    if (!validate()) {
                      return;
                    }

                    doSchedule({
                      title,
                      tags,
                      body,
                      reward,
                      reblogSwitch,
                      beneficiaries,
                      schedule,
                      description
                    });
                  }}
                  disabled={posting || publishing}
                >
                  {(posting || publishing) && (
                    <Spinner
                      animation="grow"
                      variant="light"
                      size="sm"
                      style={{ marginRight: "6px" }}
                    />
                  )}
                  {_t("submit.schedule")}
                </Button>
              </LoginRequired>
            </div>
          ) : (
            <div className="bottom-toolbar">
              {editingEntry === null && (
                <>
                  <span />
                  <div className="action-buttons">
                    <ClickAwayListener onClickAway={() => setShowHelp(false)}>
                      <Button
                        className="help-button"
                        style={{ marginRight: "6px" }}
                        onClick={() => setShowHelp(!showHelp)}
                      >
                        {helpIconSvg} {_t("floating-faq.help")}
                      </Button>
                    </ClickAwayListener>
                    {props.global.usePrivate && isDraftEmpty ? (
                      <LoginRequired {...props}>
                        <Button
                          variant="outline-primary"
                          style={{ marginRight: "6px" }}
                          onClick={() => setDrafts(!drafts)}
                        >
                          {contentLoadSvg} {_t("submit.load-draft")}
                        </Button>
                      </LoginRequired>
                    ) : (
                      <LoginRequired {...props}>
                        <Button
                          variant="outline-primary"
                          style={{ marginRight: "6px" }}
                          onClick={() => {
                            if (!validate()) {
                              return;
                            }
                            saveDraft({
                              tags,
                              title,
                              body,
                              description,
                              selectedThumbnail,
                              selectionTouched,
                              editingDraft,
                              beneficiaries,
                              reward
                            });
                          }}
                          disabled={disabled || saving || posting || publishing}
                        >
                          {contentSaveSvg}{" "}
                          {editingDraft === null
                            ? _t("submit.save-draft")
                            : _t("submit.update-draft")}
                        </Button>
                      </LoginRequired>
                    )}
                    <LoginRequired {...props}>
                      <Button
                        className="d-inline-flex align-items-center"
                        onClick={() => {
                          if (!validate()) {
                            return;
                          }

                          publish({
                            reblogSwitch,
                            title,
                            tags,
                            body,
                            description,
                            reward,
                            beneficiaries,
                            selectedThumbnail,
                            selectionTouched
                          });
                        }}
                        disabled={disabled || posting || saving || publishing}
                      >
                        {(posting || publishing) && (
                          <Spinner
                            animation="grow"
                            variant="light"
                            size="sm"
                            style={{ marginRight: "6px" }}
                          />
                        )}
                        {_t("submit.publish")}
                      </Button>
                    </LoginRequired>
                  </div>
                </>
              )}
              {drafts && activeUser && <Drafts {...props} onHide={() => setDrafts(!drafts)} />}

              {editingEntry !== null && (
                <>
                  <Button variant="outline-secondary" onClick={cancelUpdate}>
                    {_t("submit.cancel-update")}
                  </Button>
                  <LoginRequired {...props}>
                    <Button
                      className="d-inline-flex align-items-center"
                      onClick={() => {
                        if (!validate()) {
                          return;
                        }

                        update({
                          editingEntry,
                          tags,
                          title,
                          body,
                          description,
                          selectedThumbnail,
                          selectionTouched
                        });
                      }}
                      disabled={posting || publishing}
                    >
                      {(posting || publishing) && (
                        <Spinner
                          animation="grow"
                          variant="light"
                          size="sm"
                          style={{ marginRight: "6px" }}
                        />
                      )}
                      {_t("submit.update")}
                    </Button>
                  </LoginRequired>
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
                              onChange={(e) => {
                                setReward(e.target.value as RewardType);
                              }}
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
                            <BeneficiaryEditorDialog
                              body={body}
                              author={activeUser?.username}
                              list={beneficiaries}
                              onAdd={(item) => {
                                const b = [...beneficiaries, item].sort((a, b) =>
                                  a.account < b.account ? -1 : 1
                                );
                                setBeneficiaries(b);
                              }}
                              onDelete={(username) => {
                                const b = [
                                  ...beneficiaries.filter(
                                    (x: { account: string }) => x.account !== username
                                  )
                                ];
                                setBeneficiaries(b);
                              }}
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
                          value={description || postBodySummary(body, 200)}
                          onChange={(e) => {
                            setDescription(e.target.value);
                          }}
                          rows={3}
                          maxLength={200}
                        />
                        <Form.Text muted={true}>
                          {description !== "" ? description : postBodySummary(body, 200)}
                        </Form.Text>
                      </Col>
                    </Form.Group>
                    {editingEntry === null && (
                      <>
                        {props.global.usePrivate && !threeSpeakManager.hasUnpublishedVideo && (
                          <Form.Group as={Row}>
                            <Form.Label column={true} sm="3">
                              {_t("submit.schedule")}
                            </Form.Label>
                            <Col sm="9">
                              <PostScheduler
                                date={schedule ? moment(schedule) : null}
                                onChange={(d) => {
                                  setSchedule(d ? d.toISOString(true) : null);
                                }}
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
                            onChange={(e) => {
                              setReblogSwitch(e.target.checked);
                            }}
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
                            if (!thumbnails.includes(selectedThumbnail ?? "")) {
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
                                    setSelectedThumbnail(item);
                                    setSelectionTouched(true);
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
              <SubmitPreviewContent
                history={props.history}
                title={preview.title}
                body={preview.body}
                tags={preview.tags}
              />
              {toolBar}
            </div>
          );
        })()}
      </div>
    </>
  );
}

const SubmitWithProviders = (props: PageProps & MatchProps) => {
  return (
    <BodyVersioningManager>
      <ThreeSpeakManager>
        <Submit {...props} />
      </ThreeSpeakManager>
    </BodyVersioningManager>
  );
};

export default connect(pageMapStateToProps, pageMapDispatchToProps)(SubmitWithProviders as any);
