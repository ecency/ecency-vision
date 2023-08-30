import { useMutation } from "@tanstack/react-query";
import { FullAccount } from "../../../store/accounts/types";
import { createPermlink, makeCommentOptions } from "../../../helper/posting";
import * as bridgeApi from "../../../api/bridge";
import { proxifyImageSrc } from "@ecency/render-helper";
import { markAsPublished, updateSpeakVideoInfo } from "../../../api/threespeak";
import {
  BeneficiaryRoute,
  comment,
  formatError,
  reblog,
  RewardType
} from "../../../api/operations";
import tempEntry from "../../../helper/temp-entry";
import { error, success } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { makePath as makePathEntry } from "../../../components/entry-link";
import isCommunity from "../../../helper/is-community";
import { History } from "history";
import { useMappedStore } from "../../../store/use-mapped-store";
import { useThreeSpeakManager } from "../hooks";
import { buildMetadata, getDimensionsFromDataUrl } from "../functions";
import { useContext } from "react";
import { EntriesCacheContext } from "../../../core";

export function usePublishApi(history: History, onClear: () => void) {
  const { activeUser } = useMappedStore();
  const {
    videoId,
    is3Speak: isThreespeak,
    speakPermlink,
    speakAuthor,
    isNsfw,
    videoMetadata
  } = useThreeSpeakManager();
  const { updateCache } = useContext(EntriesCacheContext);

  return useMutation(
    ["publish"],
    async ({
      title,
      tags,
      body,
      description,
      reward,
      reblogSwitch,
      beneficiaries,
      selectedThumbnail,
      selectionTouched
    }: {
      title: string;
      tags: string[];
      body: string;
      description: string | null;
      reward: RewardType;
      reblogSwitch: boolean;
      beneficiaries: BeneficiaryRoute[];
      selectedThumbnail?: string;
      selectionTouched: boolean;
    }) => {
      // clean body
      const cbody = body.replace(/[\x00-\x09\x0B-\x0C\x0E-\x1F\x7F-\x9F]/g, "");

      // make sure active user fully loaded
      if (!activeUser || !activeUser.data.__loaded) {
        return;
      }

      const author = activeUser.username;
      const authorData = activeUser.data as FullAccount;

      let permlink = createPermlink(title);

      // permlink duplication check
      let c;
      try {
        c = await bridgeApi.getPostHeader(author, permlink);
      } catch (e) {}

      if (c && c.author) {
        // create permlink with random suffix
        permlink = createPermlink(title, true);
      }

      const [parentPermlink] = tags;
      let jsonMeta = buildMetadata({
        title,
        body,
        tags,
        description,
        videoMetadata,
        selectionTouched,
        selectedThumbnail
      });

      if (jsonMeta && jsonMeta.image && jsonMeta.image.length > 0) {
        jsonMeta.image_ratios = await Promise.all(
          jsonMeta.image
            .slice(0, 5)
            .map((element: string) => getDimensionsFromDataUrl(proxifyImageSrc(element)))
        );
      }

      if (isThreespeak && speakPermlink !== "") {
        permlink = speakPermlink;
        // update speak video with title, body and tags
        await updateSpeakVideoInfo(activeUser.username, body, videoId, title, tags, isNsfw);
      }

      const options = makeCommentOptions(author, permlink, reward, beneficiaries);

      try {
        await comment(author, "", parentPermlink, permlink, title, cbody, jsonMeta, options, true);

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
        updateCache([entry]);

        success(_t("submit.published"));
        onClear();
        const newLoc = makePathEntry(parentPermlink, author, permlink);
        history.push(newLoc);

        //Mark speak video as published
        if (isThreespeak && activeUser.username === speakAuthor) {
          success(_t("vidoe-upload.publishing"));
          setTimeout(() => {
            markAsPublished(activeUser!.username, videoId);
          }, 10000);
        }
        if (isCommunity(tags[0]) && reblogSwitch) {
          await reblog(author, author, permlink);
        }
      } catch (e) {
        error(...formatError(e));
      }
    }
  );
}
