import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usrActivity } from "./private-api";
import {
  claimAccount,
  claimAccountByKeychain,
  comment,
  CommentOptions,
  formatError,
  MetaData
} from "./operations";
import { FullAccount } from "../store/accounts/types";
import { PrivateKey } from "@hiveio/dhive";
import tempEntry from "../helper/temp-entry";
import * as ss from "../util/session-storage";
import { error } from "../components/feedback";
import { useMappedStore } from "../store/use-mapped-store";
import { useContext } from "react";
import { EntriesCacheContext, QueryIdentifiers } from "../core";
import { Entry } from "../store/entries/types";

interface Params {
  bl?: string | number;
  tx?: string | number;
}

export function useUserActivity(username: string | undefined, ty: number) {
  return useMutation(["user-activity", username, ty], async (params: Params | undefined) => {
    if (username) {
      await usrActivity(username, ty, params?.bl, params?.tx);
    }
  });
}

export function useAccountClaiming(account: FullAccount) {
  return useMutation(
    ["account-claiming", account.name],
    async ({ isKeychain, key }: { key?: PrivateKey; isKeychain?: boolean }) => {
      try {
        if (isKeychain) {
          return await claimAccountByKeychain(account);
        }

        if (key) {
          return await claimAccount(account, key);
        }

        throw new Error();
      } catch (error) {
        throw new Error("Failed RC claiming. Please, try again or contact with support.");
      }
    }
  );
}

// parent should be provided if entry is sub-comment there
export function useCreateReply(entry: Entry, parent?: Entry, onSuccess?: () => void) {
  const { activeUser } = useMappedStore();
  const { addReply, updateRepliesCount } = useContext(EntriesCacheContext);
  const queryClient = useQueryClient();

  return useMutation(
    ["reply-create", activeUser?.username, entry.author, entry.permlink],
    async ({
      permlink,
      text,
      jsonMeta,
      options,
      point
    }: {
      permlink: string;
      text: string;
      jsonMeta: MetaData;
      point: boolean;
      options?: CommentOptions;
    }) => {
      if (!activeUser || !activeUser.data.__loaded) {
        throw new Error("[Reply][Create] – no active user provided");
      }

      await comment(
        activeUser.username,
        entry.author,
        entry.permlink,
        permlink,
        "",
        text,
        jsonMeta,
        options ?? null,
        point
      );
      return tempEntry({
        author: activeUser.data as FullAccount,
        permlink,
        parentAuthor: entry.author,
        parentPermlink: entry.permlink,
        title: "",
        body: text,
        tags: [],
        description: null
      });
    },
    {
      onSuccess: (data) => {
        // add new reply to store
        addReply(entry, data);

        // remove reply draft
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        if (entry.children === 0) {
          // Update parent comment.
          updateRepliesCount(entry, 1);
        }
        const previousReplies =
          queryClient.getQueryData<Entry[]>([
            QueryIdentifiers.FETCH_DISCUSSIONS,
            parent?.author ?? entry.author,
            parent?.permlink ?? entry.permlink
          ]) ?? [];
        queryClient.setQueryData(
          [
            QueryIdentifiers.FETCH_DISCUSSIONS,
            parent?.author ?? entry.author,
            parent?.permlink ?? entry.permlink
          ],
          [data, ...previousReplies]
        );

        onSuccess?.();
      },
      onError: (e) => error(...formatError(e))
    }
  );
}

export function useUpdateReply(entry: Entry, onSuccess?: () => void) {
  const { activeUser } = useMappedStore();
  const { updateCache } = useContext(EntriesCacheContext);
  const queryClient = useQueryClient();

  return useMutation(
    ["reply-update", activeUser?.username, entry.author, entry.permlink],
    async ({
      text,
      jsonMeta,
      options,
      point
    }: {
      text: string;
      jsonMeta: MetaData;
      point: boolean;
      options?: CommentOptions;
    }) => {
      if (!activeUser || !activeUser.data.__loaded) {
        throw new Error("[Reply][Create] – no active user provided");
      }

      await comment(
        activeUser.username,
        entry.parent_author!,
        entry.parent_permlink!,
        entry.permlink,
        "",
        text,
        jsonMeta,
        options ?? null,
        point
      );
      return {
        ...entry,
        body: text
      };
    },
    {
      onSuccess: (data) => {
        // add new reply to store
        updateCache([data]);

        // remove reply draft
        ss.remove(`reply_draft_${entry.author}_${entry.permlink}`);

        const previousReplies =
          queryClient.getQueryData<Entry[]>([
            QueryIdentifiers.FETCH_DISCUSSIONS,
            entry.author,
            entry.permlink
          ]) ?? [];
        queryClient.setQueryData(
          [QueryIdentifiers.FETCH_DISCUSSIONS, entry.author, entry.permlink],
          [
            ...previousReplies.filter(
              (e) => e.author !== data.author || e.permlink !== data.permlink
            ),
            data
          ]
        );
        queryClient.invalidateQueries([
          QueryIdentifiers.FETCH_DISCUSSIONS,
          entry.author,
          entry.permlink
        ]);

        onSuccess?.();
      },
      onError: (e) => error(...formatError(e))
    }
  );
}
