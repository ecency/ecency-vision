import { useMutation } from "@tanstack/react-query";
import * as bridgeApi from "../../../api/bridge";
import { addSchedule } from "@/api/private-api";
import { useThreeSpeakManager } from "../_hooks";
import { useContext } from "react";
import { PollsContext } from "@/app/submit/_hooks/polls-manager";
import { EntryMetadataManagement } from "@/features/entry-management";
import { usePollsCreationManagement } from "@/features/polls";
import { useGlobalStore } from "@/core/global-store";
import { createPermlink, isCommunity, makeCommentOptions } from "@/utils";
import { error } from "highcharts";
import { AxiosError } from "axios";
import i18next from "i18next";

export function useScheduleApi(onClear: () => void) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const { buildBody } = useThreeSpeakManager();
  const { activePoll, clearActivePoll } = useContext(PollsContext);

  const { clearAll } = usePollsCreationManagement();

  return useMutation({
    mutationKey: ["schedule"],
    mutationFn: async ({
      title,
      tags,
      body,
      reward,
      reblogSwitch,
      beneficiaries,
      schedule,
      description
    }: Record<string, any>) => {
      // make sure active user and schedule date has set
      if (!activeUser || !schedule) {
        return;
      }

      let author = activeUser.username;
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

      const jsonMeta = EntryMetadataManagement.EntryMetadataManager.shared
        .builder()
        .default()
        .extractFromBody(body)
        .withTags(tags)
        .withSummary(description ?? body)
        .withPoll(activePoll)
        .build();
      const options = makeCommentOptions(author, permlink, reward, beneficiaries);

      const reblog = isCommunity(tags[0]) && reblogSwitch;

      try {
        await addSchedule(
          author,
          permlink,
          title,
          buildBody(body),
          jsonMeta,
          options,
          schedule,
          reblog
        );
        onClear();
        clearActivePoll();
      } catch (e) {
        if (e instanceof AxiosError) {
          if (e.response?.data?.message) {
            error(e.response?.data?.message);
          } else {
            error(i18next.t("g.server-error"));
          }
        }
      }
    },
    onSuccess: () => {
      clearAll();
    }
  });
}
