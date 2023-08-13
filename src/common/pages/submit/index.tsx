import { useEffect, useRef, useState } from "react";
import { BeneficiaryRoute, RewardType } from "../../api/operations";
import { Entry } from "../../store/entries/types";
import { Draft } from "../../api/private-api";
import { MatchType, PostBase } from "./types";
import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "../common";
import { ThreeSpeakVideo } from "../../api/threespeak";
import { extractMetaData } from "../../helper/posting";
import {
  useAdvancedManager,
  useApiDraftDetector,
  useCommunityDetector,
  useEntryDetector,
  useLoadLocalDraft
} from "./hooks";
import { postBodySummary } from "@ecency/render-helper";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import { toolbarEventListener } from "../../components/editor-toolbar";
import useMount from "react-use/lib/useMount";
import { handleFloatingContainer } from "../../components/floating-faq";
import { useUnmount } from "react-use";
import { useMappedStore } from "../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";
import { connect } from "react-redux";

interface MatchProps {
  match: MatchType;
}

export function Submit(props: PageProps & MatchProps) {
  const postBodyRef = useRef<Element | null>(null);

  const { activeUser } = useMappedStore();
  const previousActiveUser = usePrevious(activeUser);
  const previousLocation = usePrevious(props.location);

  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [body, setBody] = useState("");
  const [description, setDescription] = useState<string | null>(null);

  // advanced
  const [reward, setReward] = useState<RewardType>("default");
  const [posting, setPosting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectionTouched, setSelectionTouched] = useState(false);
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRoute[]>([]);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [selectedThumbnail, setSelectedThumbnail] = useLocalStorage<string>(
    PREFIX + "draft_selected_image"
  );
  const [schedule, setSchedule] = useState<string | null>(null);
  const [reblogSwitch, setReblogSwitch] = useState(false);
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

  // 3speak
  const [is3Speak, setIs3Speak] = useState(false);
  const [videoId, setVideoId] = useState("");
  const [speakPermlink, setSpeakPermlink] = useState("");
  const [speakAuthor, setSpeakAuthor] = useState("");
  const [isNsfw, setIsNsfw] = useState(false);
  const [videoMetadata, setVideoMetadata] = useState<ThreeSpeakVideo | null>(null);

  // Misc
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editingDraft, setEditingDraft] = useState<Draft | null>(null);

  let _updateTimer: any; // todo think about it

  const { isDraftEmpty, setIsDraftEmpty } = useLoadLocalDraft(props.match, (title, tags, body) => {
    setTitle(title);
    setTags(tags);
    setBody(body);
    updatePreview();
  });
  const { advanced } = useAdvancedManager();

  useCommunityDetector(props.location, (community) => {
    setTags([...tags, community]);
  });

  useEntryDetector(props.match, props.history, (entry) => {
    if (entry) {
      setTitle(entry.title);
      setTags([...new Set(entry.json_metadata?.tags ?? [])]);
      setBody(entry.body);
      setDescription(entry.json_metadata?.description ?? postBodySummary(body, 200));
      setEditingEntry(entry);
      updatePreview();
    } else if (editingEntry) {
      setEditingEntry(null);
    }
  });

  useApiDraftDetector(props.match, props.location, (draft) => {
    setTitle(draft.title);
    setTags(draft.tags.trim().split(/[ ,]+/));
    setBody(draft.body);
    setEditingDraft(draft);
    setBeneficiaries(draft.meta?.beneficiaries ?? []);
    setReward(draft.meta?.rewardType ?? "default");
    setSelectedThumbnail(draft.meta?.image?.[0]);
    setDescription(draft.meta?.description ?? "");
    updatePreview();
  });

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
    if (activeUser?.username !== previousActiveUser?.username && activeUser) {
      // delete active user from beneficiaries list
      setBeneficiaries(beneficiaries.filter((x) => x.account !== activeUser.username));
    }
  }, [activeUser]);

  const updatePreview = (): void => {
    if (_updateTimer) {
      clearTimeout(_updateTimer);
      _updateTimer = null;
    }

    // Not sure why we are using setTimeOut(), but it causes some odd behavior and sets input value to preview.body when you try to delete/cancel text
    _updateTimer = setTimeout(() => {
      const { thumbnails } = extractMetaData(body);
      setPreview({ title, tags, body, description });
      setThumbnails(thumbnails ?? []);
      if (editingEntry === null) {
        this.saveLocalDraft();
      }
      setIsDraftEmpty(Boolean(title?.length || tags?.length || body?.length));
    }, 50);
  };

  const handleResize = () => {
    if (typeof window !== "undefined" && window.innerWidth < 992) {
      setShowHelp(false);
      handleFloatingContainer(false, "submit");
    }
  };
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(Submit as any);
