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
  const { videos, isNsfw, buildBody } = useThreeSpeakManager();
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
      const unpublished3SpeakVideo = Object.values(videos).find(
        (v) => v.status === "publish_manual"
      );
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
        videoMetadata: unpublished3SpeakVideo,
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

      // If post have one unpublished video need to modify
      //    json metadata which matches to 3Speak
      if (unpublished3SpeakVideo) {
        // Permlink should be got from 3speak video metadata
        permlink = unpublished3SpeakVideo.permlink;
        // update speak video with title, body and tags
        await updateSpeakVideoInfo(
          activeUser.username,
          buildBody(body),
          unpublished3SpeakVideo._id,
          title,
          tags,
          isNsfw
        );
        // set specific metadata for 3speak
        jsonMeta.app = "3speak/0.3.0";
        jsonMeta.type = "video";
      }

      const options = makeCommentOptions(author, permlink, reward, beneficiaries);

      try {
        await comment(
          author,
          "",
          parentPermlink,
          permlink,
          title,
          buildBody(cbody),
          jsonMeta,
          options,
          true
        );

        // Create entry object in store and cache
        const entry = {
          ...tempEntry({
            author: authorData!,
            permlink,
            parentAuthor: "",
            parentPermlink,
            title,
            body: buildBody(body),
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
        if (!!unpublished3SpeakVideo && activeUser.username === unpublished3SpeakVideo.owner) {
          success(_t("video-upload.publishing"));
          setTimeout(() => {
            markAsPublished(activeUser!.username, unpublished3SpeakVideo._id);
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
