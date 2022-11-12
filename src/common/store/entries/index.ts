import update from "immutability-helper";

import { Dispatch } from "redux";

import { AppState } from "../index";

import {
  Actions,
  ActionTypes,
  FetchAction,
  FetchErrorAction,
  FetchedAction,
  InvalidateAction,
  UpdateAction,
  Entries,
  Entry
} from "./types";

import { CommonActionTypes } from "../common";

import { clone } from "../util";

import filterTagExtract from "../../helper/filter-tag-extract";

import { getPostsRanked, getAccountPosts, dataLimit } from "../../api/bridge";

import { search, SearchResult } from "../../api/search-api";

import moment, { Moment } from "moment";

import * as ss from "../../util/session-storage";

export const makeGroupKey = (what: string, tag: string = ""): string => {
  if (tag) {
    return `${what}-${tag}`;
  }
  return `${what}`;
};

export const initialState: Entries = {
  __manual__: {
    entries: [],
    error: null,
    sid: "",
    loading: false,
    hasMore: false
  },
  __promoted__: {
    entries: [],
    error: null,
    sid: "",
    loading: false,
    hasMore: false
  }
};

export default (state: Entries = initialState, action: Actions): Entries => {
  switch (action.type) {
    case CommonActionTypes.LOCATION_CHANGE: {
      const { pathname } = action.payload.location;
      const params = filterTagExtract(pathname);

      if (!params) {
        return state;
      }

      const { filter, tag } = params;
      const groupKey = makeGroupKey(filter, tag);

      // Create a new group if group is not exists in store or PUSH action triggered.
      if (state[`${groupKey}`] === undefined || action.payload.action === "PUSH") {
        return update(state, {
          [`${groupKey}`]: {
            $set: { entries: [], error: null, sid: "", loading: true, hasMore: false }
          }
        });
      }

      return state;
    }
    case ActionTypes.FETCH: {
      const { groupKey } = action;
      return update(state, {
        [`${groupKey}`]: { $merge: { loading: true, error: null } }
      });
    }
    case ActionTypes.FETCH_ERROR: {
      const { groupKey, error } = action;
      return update(state, {
        [`${groupKey}`]: { $merge: { loading: false, error } }
      });
    }
    case ActionTypes.FETCHED: {
      const { groupKey, entries, sid, hasMore } = action;
      const merged = update(state, {
        [`${groupKey}`]: { $merge: { loading: false, sid, error: null, hasMore } }
      });

      // Filter entries
      const newEntries = entries.filter((x) => {
        return (
          state[groupKey].entries.find((y) => y.author == x.author && y.permlink == x.permlink) ===
          undefined
        );
      });

      return update(merged, {
        [`${groupKey}`]: { entries: { $push: newEntries } }
      });
    }
    case ActionTypes.INVALIDATE: {
      const { groupKey } = action;

      return update(state, {
        [`${groupKey}`]: {
          $merge: { entries: [], loading: false, error: null, hasMore: false }
        }
      });
    }
    case ActionTypes.UPDATE: {
      const { entry } = action;

      const st = clone(state);
      const groupKeys = Object.keys(st);

      // Iterate over all groups and update the entry
      for (const k of groupKeys) {
        st[k].entries = st[k].entries.map((e: Entry): Entry | SearchResult => {
          if (e.author === entry.author && e.permlink === entry.permlink) {
            return entry;
          }

          return e;
        });
      }

      return clone(st);
    }
    default:
      return state;
  }
};

/* Actions */
export const fetchEntries =
  (what: string = "", tag: string = "", more: boolean = false) =>
  (dispatch: Dispatch, getState: () => AppState) => {
    const { entries, activeUser } = getState();

    const groupKey = makeGroupKey(what, tag);

    const theEntries = entries[groupKey].entries;
    const sid = entries[groupKey].sid;
    if (!more && theEntries.length > 0) {
      return;
    }

    const lastEntry = theEntries[theEntries.length - 1];

    let start_author = "";
    let start_permlink = "";

    if (lastEntry) {
      start_author = lastEntry.author;
      start_permlink = lastEntry.permlink;
    }

    dispatch(fetchAct(groupKey));

    const observer = activeUser?.username || "";

    // let promise: Promise<Entry[] | null>;
    let promise: Promise<any>;
    if (tag.startsWith("@")) {
      // @username/posts|replies|comments|feed
      const username = tag.replace("@", "");

      promise = getAccountPosts(what, username, start_author, start_permlink, dataLimit, observer);
    } else if (["controversial", "rising"].includes(what)) {
      let sinceDate: undefined | Moment;

      switch (tag) {
        case "today":
          sinceDate = moment().subtract("1", "day");
          break;
        case "week":
          sinceDate = moment().subtract("1", "week");
          break;
        case "month":
          sinceDate = moment().subtract("1", "month");
          break;
        case "year":
          sinceDate = moment().subtract("1", "year");
          break;
        default:
          sinceDate = undefined;
      }
      let q = "* type:post";
      let sort = what === "rising" ? "children" : what;
      const since = sinceDate ? sinceDate.format("YYYY-MM-DDTHH:mm:ss") : undefined;
      const hideLow_ = "0";
      const scrollId = sid;
      const scrollId_ = scrollId ? scrollId : undefined;
      const votes = tag === "today" ? 50 : 200;
      promise = search(q, sort, hideLow_, since, scrollId_, votes);
    } else {
      // trending/tag
      promise = getPostsRanked(what, start_author, start_permlink, dataLimit, tag, observer);
    }

    promise
      .then((resp) => {
        if (resp.results) {
          dispatch(
            fetchedAct(groupKey, resp.results, resp.scroll_id, resp.results.length >= dataLimit)
          );
        } else if (resp) {
          dispatch(fetchedAct(groupKey, resp, "", resp.length >= dataLimit));
        } else {
          dispatch(fetchErrorAct(groupKey, "", "server error"));
        }
      })
      .catch((e) => {
        dispatch(fetchErrorAct(groupKey, "", "network error"));
      });
  };

export const addEntry = (entry: Entry) => (dispatch: Dispatch) => {
  dispatch(fetchedAct("__manual__", [entry], "", false));
};

export const updateEntry = (entry: any) => (dispatch: Dispatch) => {
  dispatch(updateAct(entry));
};

export const invalidateEntries = (groupKey: string) => (dispatch: Dispatch) => {
  dispatch(invalidateAct(groupKey));
};

/* Action Creators */

export const fetchAct = (groupKey: string): FetchAction => {
  return {
    type: ActionTypes.FETCH,
    groupKey
  };
};

export const fetchErrorAct = (
  groupKey: string,
  sid: string = "",
  error: string
): FetchErrorAction => {
  return {
    type: ActionTypes.FETCH_ERROR,
    groupKey,
    sid,
    error
  };
};

export const fetchedAct = (
  groupKey: string,
  entries: Entry[],
  sid: string,
  hasMore: boolean
): FetchedAction => {
  return {
    type: ActionTypes.FETCHED,
    groupKey,
    entries,
    sid,
    hasMore
  };
};

export const invalidateAct = (groupKey: string): InvalidateAction => {
  return {
    type: ActionTypes.INVALIDATE,
    groupKey
  };
};

export const updateAct = (entry: Entry | SearchResult, sid: string = ""): UpdateAction => {
  return {
    type: ActionTypes.UPDATE,
    sid,
    entry
  };
};
