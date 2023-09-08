import { useMutation } from "@tanstack/react-query";
import {
  createPermlink,
  extractMetaData,
  makeCommentOptions,
  makeJsonMetaData
} from "../../../helper/posting";
import * as bridgeApi from "../../../api/bridge";
import isCommunity from "../../../helper/is-community";
import { addSchedule } from "../../../api/private-api";
import { error } from "../../../components/feedback";
import { _t } from "../../../i18n";
import { useMappedStore } from "../../../store/use-mapped-store";
import { version } from "../../../../../package.json";

export function useScheduleApi(onClear: () => void) {
  const { activeUser } = useMappedStore();

  return useMutation(
    ["schedule"],
    async ({
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

      const meta = extractMetaData(body);
      const jsonMeta = makeJsonMetaData(meta, tags, description, version);
      const options = makeCommentOptions(author, permlink, reward, beneficiaries);

      const reblog = isCommunity(tags[0]) && reblogSwitch;

      try {
        await addSchedule(author, permlink, title, body, jsonMeta, options, schedule, reblog);
        onClear();
      } catch (e) {
        if (e.response?.data?.message) {
          error(e.response?.data?.message);
        } else {
          error(_t("g.server-error"));
        }
      }
    }
  );
}
