"use client";

import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { PostBase, VideoProps } from "./_types";
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
} from "./_hooks";
import { postBodySummary, proxifyImageSrc } from "@ecency/render-helper";
import useLocalStorage from "react-use/lib/useLocalStorage";
import useMount from "react-use/lib/useMount";
import { useUnmount } from "react-use";
import usePrevious from "react-use/lib/usePrevious";
import {
  checkSvg,
  contentLoadSvg,
  contentSaveSvg,
  helpIconSvg,
  informationSvg
} from "@/assets/img/svg";
import moment from "moment/moment";
import isEqual from "react-fast-compare";
import { handleShortcuts } from "./_functions";
import { usePublishApi, useSaveDraftApi, useScheduleApi } from "./_api";
import {
  BeneficiaryEditorDialog,
  CommunitySelector,
  PostSchedulerDialog,
  SubmitPreviewContent,
  SubmitVideoAttachments,
  TagSelector,
  WordCount
} from "@/app/submit/_components";
import { useUpdateApi } from "@/app/submit/_api/update";
import "./_index.scss";
import { useThreeSpeakMigrationAdapter } from "@/app/submit/_hooks/three-speak-migration-adapter";
import { ModalConfirm } from "@ui/modal-confirm";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { IntroTour } from "@ui/intro-tour";
import { IntroStep } from "@ui/core";
import { PollsContext, PollsManager } from "@/app/submit/_hooks/polls-manager";
import { FullHeight } from "@/features/ui";
import {
  AvailableCredits,
  ClickAwayListener,
  EditorToolbar,
  error,
  Feedback,
  LoginRequired,
  Navbar,
  Theme,
  toolbarEventListener
} from "@/features/shared";
import i18next from "i18next";
import { extractMetaData, isCommunity, makeEntryPath } from "@/utils";
import { Draft, Entry, RewardType } from "@/entities";
import { DraftsDialog } from "@/features/shared/drafts";
import { dotsMenuIconSvg } from "@ui/icons";
import { TextareaAutocomplete } from "@/features/shared/textarea-autocomplete";
import { useEntryPollExtractor } from "@/features/polls";
import { PREFIX } from "@/utils/local-storage";
import { useGlobalStore } from "@/core/global-store";
import { useRouter } from "next/navigation";
import { handleFloatingContainer } from "@/features/faq";

interface Props {
  path: string;
  username?: string;
  permlink?: string;
  draftId?: string;
}

function Submit({ path, draftId, username, permlink }: Props) {
  const postBodyRef = useRef<HTMLDivElement | null>(null);
  const threeSpeakManager = useThreeSpeakManager();
  const { setActivePoll, activePoll, clearActivePoll } = useContext(PollsContext);
  const { body, setBody } = useBodyVersioningManager();

  const router = useRouter();
  const usePrivate = useGlobalStore((s) => s.usePrivate);
  const activeUser = useGlobalStore((s) => s.activeUser);
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
  const [forceReactivateTour, setForceReactivateTour] = useState(false);

  // Misc
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);
  const [isTourFinished] = useLocalStorage(PREFIX + `_itf_submit`, false);

  const postPoll = useEntryPollExtractor(editingEntry);

  const tourEnabled = useMemo(() => !activeUser, [activeUser]);
  const introSteps = useMemo<IntroStep[]>(
    () => [
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.title-hint"),
        targetSelector: "#submit-title"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.tags-hint"),
        targetSelector: "#submit-tags-selector"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.body-hint"),
        targetSelector: "#the-editor"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.community-hint"),
        targetSelector: "#community-picker"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.toolbar-hint"),
        targetSelector: "#editor-toolbar"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.advanced-hint"),
        targetSelector: "#editor-advanced"
      },
      {
        title: i18next.t("submit-tour.title"),
        message: i18next.t("submit-tour.help-hint"),
        targetSelector: "#editor-help"
      }
    ],
    []
  );

  let _updateTimer: any; // todo think about it

  const { setLocalDraft } = useLocalDraftManager(
    path,
    username,
    permlink,
    draftId,
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
    clearAdvanced,
    getHasAdvanced
  } = useAdvancedManager();

  useThreeSpeakMigrationAdapter({
    body,
    setBody
  });

  useCommunityDetector((community) => setTags([...tags, community]));

  useEntryDetector(username, permlink, (entry) => {
    if (entry) {
      setTitle(entry.title);
      setTags(Array.from(new Set(entry.json_metadata?.tags ?? [])));
      setBody(entry.body);
      setDescription(entry.json_metadata?.description ?? postBodySummary(body, 200));
      entry?.json_metadata?.image && setSelectedThumbnail(entry?.json_metadata?.image[0]);
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
    draftId,
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
      router.replace("/submit");
    }
  );

  const { mutateAsync: doSchedule, isPending: posting } = useScheduleApi(() => clear());
  const { mutateAsync: saveDraft, isPending: saving } = useSaveDraftApi();
  const { mutateAsync: publish, isPending: publishing } = usePublishApi(() => clear());
  const { mutateAsync: update, isPending: updating } = useUpdateApi(() => clear());

  useMount(() => {
    window.addEventListener("resize", handleResize);
  });

  useUnmount(() => {
    if (typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
    }
  });

  useEffect(() => {
    if (postPoll) {
      setActivePoll(postPoll);
    }
  }, [postPoll]);

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
    handleFloatingContainer(showHelp);
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
      const existingImages = editingEntry?.json_metadata.image ?? [];
      const newThumbnails = thumbnails ? [...existingImages, ...thumbnails] : existingImages;
      setThumbnails(Array.from(new Set(newThumbnails)));
      if (editingEntry === null) {
        setLocalDraft({ title, tags, body, description });
      }
      setIsDraftEmpty(!Boolean(title?.length || tags?.length || body?.length));
    }, 50);
  };

  const handleResize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      setShowHelp(false);
      handleFloatingContainer(false);
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
        weight: 1000
      }
    ];
    const joinedBeneficiary = [...videoBeneficiary, ...videoEncoders];
    setBeneficiaries(joinedBeneficiary);
  };

  const cancelUpdate = () => {
    if (!editingEntry) {
      return;
    }

    const newLoc = makeEntryPath(
      editingEntry?.category!,
      editingEntry.author,
      editingEntry.permlink
    );
    router.push(newLoc);
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
      error(i18next.t("submit.empty-title-alert"));
      return false;
    }

    if (tags?.length === 0) {
      focusInput(".tag-input");
      error(i18next.t("submit.empty-tags-alert"));
      return false;
    }

    if (body.trim() === "") {
      focusInput(".body-input");
      error(i18next.t("submit.empty-body-alert"));
      return false;
    }

    if (threeSpeakManager.hasMultipleUnpublishedVideo) {
      error(i18next.t("submit.should-be-only-one-unpublished"));
      return false;
    }

    return true;
  };

  return (
    <>
      <FullHeight />
      <Theme />
      <Feedback />
      {clearModal && <ModalConfirm onConfirm={clear} onCancel={() => setClearModal(false)} />}
      <Navbar />

      <IntroTour
        forceActivation={forceReactivateTour}
        setForceActivation={setForceReactivateTour}
        steps={introSteps}
        id="submit"
        enabled={tourEnabled}
      />

      <div className={`app-content submit-page ${editingEntry !== null ? "editing" : ""}`}>
        <div className="editor-panel">
          {editingEntry === null && activeUser && (
            <div className="community-input whitespace-nowrap">
              <CommunitySelector
                tags={tags}
                onSelect={(prev, next) => {
                  const newTags = [...[next ? next : ""], ...tags.filter((x) => x !== prev)].filter(
                    (x) => x
                  );

                  tagsChanged(newTags);
                }}
              />

              <div className="flex justify-end w-full items-center gap-4">
                <Button
                  size="sm"
                  appearance="gray-link"
                  onClick={() => setForceReactivateTour(true)}
                  icon={informationSvg}
                >
                  {!isTourFinished && i18next.t("submit.take-tour")}
                </Button>
              </div>
            </div>
          )}
          <EditorToolbar
            setVideoEncoderBeneficiary={setVideoEncoderBeneficiary}
            toggleNsfwC={() => {
              threeSpeakManager.setIsNsfw(true);
            }}
            comment={false}
            existingPoll={activePoll}
            setVideoMetadata={(v) => {
              threeSpeakManager.attach(v);
              // Attach videos as special token in a body and render it in a preview
              setBody(`${body}\n[3speak](${v._id})`);
            }}
            onAddPoll={(v) => setActivePoll(v)}
            onDeletePoll={() => clearActivePoll()}
            readonlyPoll={!!editingEntry}
          />
          <div className="title-input">
            <FormControl
              id="submit-title"
              noStyles={true}
              type="text"
              className="accepts-emoji form-control px-3 py-1 w-full outline-none shadow-0"
              placeholder={i18next.t("submit.title-placeholder")}
              autoFocus={true}
              value={title}
              dir={"auto"}
              onChange={(e) => setTitle(e.target.value)}
              spellCheck={true}
            />
          </div>
          <div className="tag-input">
            <TagSelector
              tags={tags}
              maxItem={10}
              onChange={tagsChanged}
              onValid={(v) => setDisabled(v)}
            />
          </div>
          <div className="body-input" onKeyDown={handleShortcuts} ref={postBodyRef}>
            <TextareaAutocomplete
              acceptCharset="UTF-8"
              id="the-editor"
              className="the-editor accepts-emoji form-control"
              as="textarea"
              placeholder={i18next.t("submit.body-placeholder")}
              value={body && body.length > 0 ? body : preview.body}
              onChange={(e: { target: { value: string } }) => {
                setBody(e.target.value);
              }}
              disableRows={true}
              maxrows={100}
              dir={"auto"}
              spellCheck={true}
            />
          </div>
          <SubmitVideoAttachments />
          {activeUser ? (
            <AvailableCredits
              className="mr-2"
              operation="comment_operation"
              username={activeUser.username}
            />
          ) : (
            <></>
          )}
          <div className="bottom-toolbar">
            {editingEntry === null && editingDraft === null && (
              <Button appearance="info" outline={true} onClick={() => setClearModal(true)}>
                {i18next.t("submit.clear")}
              </Button>
            )}
            <Button
              id="editor-advanced"
              outline={true}
              onClick={() => setAdvanced(!advanced)}
              icon={getHasAdvanced && dotsMenuIconSvg}
            >
              {advanced ? i18next.t("submit.preview") : i18next.t("submit.advanced")}
            </Button>
          </div>
        </div>
        <div className="flex-spacer" />
        {(() => {
          const toolBar = schedule ? (
            <div className="bottom-toolbar">
              <span />
              <LoginRequired>
                <Button
                  icon={(posting || publishing) && <Spinner className="w-3.5 h-3.5" />}
                  iconPlacement="left"
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
                  {i18next.t("submit.schedule")}
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
                        id="editor-help"
                        className="help-button mr-[6px]"
                        onClick={() => setShowHelp(!showHelp)}
                        icon={helpIconSvg}
                        iconPlacement="left"
                      >
                        {i18next.t("floating-faq.help")}
                      </Button>
                    </ClickAwayListener>
                    {usePrivate && isDraftEmpty ? (
                      <LoginRequired>
                        <Button
                          outline={true}
                          className="mr-[6px]"
                          onClick={() => setDrafts(!drafts)}
                          icon={contentLoadSvg}
                          iconPlacement="left"
                        >
                          {i18next.t("submit.load-draft")}
                        </Button>
                      </LoginRequired>
                    ) : (
                      <LoginRequired>
                        <Button
                          outline={true}
                          className="mr-[6px]"
                          icon={contentSaveSvg}
                          iconPlacement="left"
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
                          {editingDraft === null
                            ? i18next.t("submit.save-draft")
                            : i18next.t("submit.update-draft")}
                        </Button>
                      </LoginRequired>
                    )}
                    <LoginRequired>
                      <Button
                        icon={(posting || publishing) && <Spinner className="w-3.5 h-3.5" />}
                        iconPlacement="left"
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
                        {i18next.t("submit.publish")}
                      </Button>
                    </LoginRequired>
                  </div>
                </>
              )}
              {activeUser && <DraftsDialog show={drafts} setShow={setDrafts} />}

              {editingEntry !== null && (
                <>
                  <Button appearance="secondary" outline={true} onClick={cancelUpdate}>
                    {i18next.t("submit.cancel-update")}
                  </Button>
                  <LoginRequired>
                    <Button
                      icon={(posting || publishing) && <Spinner className="w-3.5 h-3.5" />}
                      iconPlacement="left"
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
                      {i18next.t("submit.update")}
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
                  <h2 className="panel-header-title">{i18next.t("submit.advanced")}</h2>
                </div>
                <div className="panel-body">
                  <div className="container px-3">
                    {editingEntry === null && (
                      <>
                        <div className="grid grid-cols-12 mb-4">
                          <div className="col-span-12 sm:col-span-3">
                            <label>{i18next.t("submit.reward")}</label>
                          </div>
                          <div className="col-span-12 sm:col-span-9">
                            <FormControl
                              type="select"
                              value={reward}
                              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                                setReward(e.target.value as RewardType);
                              }}
                            >
                              <option value="default">{i18next.t("submit.reward-default")}</option>
                              <option value="sp">{i18next.t("submit.reward-sp")}</option>
                              <option value="dp">{i18next.t("submit.reward-dp")}</option>
                            </FormControl>
                            <small className="text-gray-600 dark:text-gray-400">
                              {i18next.t("submit.reward-hint")}
                            </small>
                          </div>
                        </div>
                        <div className="grid grid-cols-12 mb-4">
                          <div className="col-span-12 sm:col-span-3">
                            <label>{i18next.t("submit.beneficiaries")}</label>
                          </div>
                          <div className="col-span-12 sm:col-span-9">
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
                            <small className="text-gray-600 dark:text-gray-400">
                              {i18next.t("submit.beneficiaries-hint")}
                            </small>
                          </div>
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-12 mb-4">
                      <div className="col-span-12 sm:col-span-3">
                        <label>{i18next.t("submit.description")}</label>
                      </div>
                      <div className="col-span-12 sm:col-span-9">
                        <FormControl
                          type="textarea"
                          value={description || postBodySummary(body, 200)}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                            setDescription(e.target.value);
                          }}
                          rows={3}
                          maxLength={200}
                        />
                        <small className="text-gray-600 dark:text-gray-400">
                          {description !== "" ? description : postBodySummary(body, 200)}
                        </small>
                      </div>
                    </div>
                    {editingEntry === null && (
                      <>
                        {usePrivate && !threeSpeakManager.hasUnpublishedVideo && (
                          <div className="grid grid-cols-12 mb-4">
                            <div className="col-span-12 sm:col-span-3">
                              <label>{i18next.t("submit.schedule")}</label>
                            </div>
                            <div className="col-span-12 sm:col-span-9">
                              <PostSchedulerDialog
                                date={schedule ? moment(schedule) : null}
                                onChange={(d) => {
                                  setSchedule(d ? d.toISOString(true) : null);
                                }}
                              />
                              <div className="text-sm text-gray-600 dark:text-gray-400">
                                {i18next.t("submit.schedule-hint")}
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {editingEntry === null && tags?.length > 0 && isCommunity(tags[0]) && (
                      <div className="grid grid-cols-12 mb-4">
                        <div className="col-span-12 sm:col-span-3" />
                        <div className="col-span-12 sm:col-span-9">
                          <FormControl
                            type="checkbox"
                            isToggle={true}
                            id="reblog-switch"
                            label={i18next.t("submit.reblog")}
                            checked={reblogSwitch}
                            onChange={(v) => {
                              setReblogSwitch(v);
                            }}
                          />
                          <small className="text-gray-600 dark:text-gray-400">
                            {i18next.t("submit.reblog-hint")}
                          </small>
                        </div>
                      </div>
                    )}
                    {thumbnails?.length > 0 && (
                      <div className="grid grid-cols-12 mb-4">
                        <div className="col-span-12 sm:col-span-3">
                          <label>{i18next.t("submit.thumbnail")}</label>
                        </div>
                        <div className="col-span-12 sm:col-span-9 flex flex-wrap selection-container">
                          {Array.from(new Set(thumbnails)).map((item, i) => {
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
                              <div className="relative" key={item + i}>
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
                                  <div className="text-green check absolute bg-white rounded-full p-1 flex justify-center items-center">
                                    {checkSvg}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
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
                <h2 className="panel-header-title">{i18next.t("submit.preview")}</h2>
                <WordCount selector=".preview-body" watch={true} />
              </div>
              <SubmitPreviewContent title={preview.title} body={preview.body} tags={preview.tags} />
              {toolBar}
            </div>
          );
        })()}
      </div>
    </>
  );
}

export const SubmitWithProvidersPage = (props: Props) => {
  return (
    <BodyVersioningManager>
      <ThreeSpeakManager>
        <PollsManager>
          <Submit {...props} />
        </PollsManager>
      </ThreeSpeakManager>
    </BodyVersioningManager>
  );
};
