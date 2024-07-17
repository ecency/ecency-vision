import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as bridgeApi from "../../../api/bridge";
import { markAsPublished, updateSpeakVideoInfo } from "@/api/threespeak";
import { comment, formatError, reblog } from "@/api/operations";
import { useThreeSpeakManager } from "../_hooks";
import { useContext } from "react";
import { PollsContext } from "@/app/submit/_hooks/polls-manager";
import { EntryBodyManagement, EntryMetadataManagement } from "@/features/entry-management";
import { GetPollDetailsQueryResponse } from "@/features/polls/api";
import { usePollsCreationManagement } from "@/features/polls";
import { useGlobalStore } from "@/core/global-store";
import { EntriesCacheContext } from "@/core/caches";
import { BeneficiaryRoute, Entry, FullAccount, RewardType } from "@/entities";
import {
  createPermlink,
  isCommunity,
  makeApp,
  makeCommentOptions,
  makeEntryPath,
  tempEntry
} from "@/utils";
import appPackage from "../../../../package.json";
import i18next from "i18next";
import { error, success } from "@/features/shared";
import { useRouter } from "next/navigation";
import { QueryIdentifiers } from "@/core/react-query";

export function usePublishApi(onClear: () => void) {
  const queryClient = useQueryClient();
  const router = useRouter();

  const activeUser = useGlobalStore((s) => s.activeUser);
  const { activePoll, clearActivePoll } = useContext(PollsContext);
  const { videos, isNsfw, buildBody } = useThreeSpeakManager();
  const { updateCache } = useContext(EntriesCacheContext);

  const { clearAll } = usePollsCreationManagement();

  return useMutation({
    mutationKey: ["publish"],
    mutationFn: async ({
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
      const cbody = EntryBodyManagement.EntryBodyManager.shared.builder().buildClearBody(body);

      // make sure active user fully loaded
      if (!activeUser || !activeUser.data.__loaded) {
        return [];
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
      const metaBuilder = await EntryMetadataManagement.EntryMetadataManager.shared
        .builder()
        .default()
        .extractFromBody(body)
        .withSummary(description ?? body)
        .withTags(tags)
        .withImages(selectedThumbnail, selectionTouched);
      const jsonMeta = metaBuilder
        .withVideo(title, description, unpublished3SpeakVideo)
        .withPoll(activePoll)
        .build();

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
        jsonMeta.app = makeApp(appPackage.version);
        jsonMeta.type = "video";
      }

      if (jsonMeta.type === "video" && activePoll) {
        throw new Error(i18next.t("polls.videos-collision-error"));
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
            description,
            jsonMeta
          }),
          max_accepted_payout: options.max_accepted_payout,
          percent_hbd: options.percent_hbd
        };
        updateCache([entry]);

        success(i18next.t("submit.published"));
        onClear();
        clearActivePoll();
        const newLoc = makeEntryPath(parentPermlink, author, permlink);
        router.push(newLoc);

        //Mark speak video as published
        if (!!unpublished3SpeakVideo && activeUser.username === unpublished3SpeakVideo.owner) {
          success(i18next.t("video-upload.publishing"));
          setTimeout(() => {
            markAsPublished(activeUser!.username, unpublished3SpeakVideo._id);
          }, 10000);
        }
        if (isCommunity(tags[0]) && reblogSwitch) {
          await reblog(author, author, permlink);
        }

        return [entry as Entry, activePoll] as const;
      } catch (e) {
        error(...formatError(e));
        throw e;
      }
    },
    onSuccess([entry, poll]) {
      clearAll();

      queryClient.setQueryData<GetPollDetailsQueryResponse | undefined>(
        [QueryIdentifiers.POLL_DETAILS, entry?.author, entry?.permlink],
        (data) => {
          if (!data) {
            return data;
          }

          return {
            author: entry.author,
            created: new Date().toISOString(),
            end_time: poll?.endTime.toISOString(),
            filter_account_age_days: poll?.filters.accountAge,
            permlink: entry.permlink,
            poll_choices: poll?.choices.map((c, i) => ({
              choice_num: i,
              choice_text: c,
              votes: null
            })),
            poll_stats: { total_voting_accounts_num: 0, total_hive_hp_incl_proxied: null },
            poll_trx_id: undefined,
            poll_voters: undefined,
            preferred_interpretation: poll?.interpretation,
            question: poll?.title,
            status: "active",
            tags: [],
            token: null
          } as unknown as GetPollDetailsQueryResponse;
        }
      );
    }
  });
}
