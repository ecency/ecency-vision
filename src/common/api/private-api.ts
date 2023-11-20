import axios from "axios";

import { PointTransaction } from "../store/points/types";
import {
  ApiNotification,
  NotificationFilter,
} from "../store/notifications/types";
import { Entry } from "../store/entries/types";

import { getAccessToken } from "../helper/user-token";

import { apiBase } from "./helper";

import { AppWindow } from "../../client/window";

declare var window: AppWindow;

export interface ReceivedVestingShare {
  delegatee: string;
  delegator: string;
  timestamp: string;
  vesting_shares: string;
}

export const getReceivedVestingShares = (
  username: string
): Promise<ReceivedVestingShare[]> =>
  axios
    .get(apiBase(`/private-api/received-vesting/${username}`))
    .then((resp) => resp.data.list);

export interface RewardedCommunity {
  start_date: string;
  total_rewards: string;
  name: string;
}

export const getRewardedCommunities = (): Promise<RewardedCommunity[]> =>
  axios
    .get(apiBase(`/private-api/rewarded-communities`))
    .then((resp) => resp.data);

export interface LeaderBoardItem {
  _id: string;
  count: number;
  points: string;
}

export type LeaderBoardDuration = "day" | "week" | "month";

export const getLeaderboard = (
  duration: LeaderBoardDuration
): Promise<LeaderBoardItem[]> => {
  return axios
    .get(apiBase(`/private-api/leaderboard/${duration}`))
    .then((resp) => resp.data);
};

export interface CurationItem {
  efficiency: number;
  account: string;
  vests: number;
  votes: number;
  uniques: number;
}

export type CurationDuration = "day" | "week" | "month";

export const getCuration = (
  duration: CurationDuration
): Promise<CurationItem[]> => {
  return axios
    .get(apiBase(`/private-api/curation/${duration}`))
    .then((resp) => resp.data);
};

export const getAvailibleAccounts = (url: string) =>
  axios
    .create({ withCredentials: true })
    .get(`${url}/available-accounts`)
    .then(({ data }) => data);

export const signUp = (username: string, url: string): Promise<any> =>
  axios
    .create({ withCredentials: true })
    .post(`${url}/create-account`, {
      username: username,
    })
    .then((resp) => {
      return resp;
    });

export const subscribeEmail = (email: string): Promise<any> =>
  axios
    .post(apiBase(`/private-api/subscribe`), {
      email: email,
    })
    .then((resp) => {
      return resp;
    });

export const usrActivity = (
  username: string,
  ty: number,
  bl: string | number = "",
  tx: string | number = ""
) => {
  if (!window.usePrivate) {
    return new Promise((resolve) => resolve(null));
  }

  const params: {
    code: string | undefined;
    ty: number;
    bl?: string | number;
    tx?: string | number;
  } = { code: getAccessToken(username), ty };

  if (bl) params.bl = bl;
  if (tx) params.tx = tx;

  return axios.post(apiBase(`/private-api/usr-activity`), params);
};

export const getNotifications = (
  username: string,
  filter: NotificationFilter | null,
  since: string | null = null
): Promise<ApiNotification[]> => {
  const data: { code: string | undefined; filter?: string; since?: string } = {
    code: getAccessToken(username),
  };

  if (filter) {
    data.filter = filter;
  }

  if (since) {
    data.since = since;
  }

  return axios
    .post(apiBase(`/private-api/notifications`), data)
    .then((resp) => resp.data);
};

export const getCurrencyTokenRate = (
  currency: string,
  token: string
): Promise<number> =>
  axios
    .get(
      apiBase(
        `/private-api/market-data/${
          currency === "hbd" ? "usd" : currency
        }/${token}`
      )
    )
    .then((resp: any) => resp.data);

export const getUnreadNotificationCount = (
  username: string
): Promise<number> => {
  const data = { code: getAccessToken(username) };

  return data.code
    ? axios
        .post(apiBase(`/private-api/notifications/unread`), data)
        .then((resp) => resp.data.count)
    : Promise.resolve(0);
};

export const markNotifications = (
  username: string,
  id: string | null = null
) => {
  const data: { code: string | undefined; id?: string } = {
    code: getAccessToken(username),
  };
  if (id) {
    data.id = id;
  }

  return axios.post(apiBase(`/private-api/notifications/mark`), data);
};

export interface UserImage {
  created: string;
  timestamp: number;
  url: string;
  _id: string;
}

export const getImages = (username: string): Promise<UserImage[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/images`), data)
    .then((resp) => resp.data);
};

export const deleteImage = (
  username: string,
  imageID: string
): Promise<any> => {
  const data = { code: getAccessToken(username), id: imageID };
  return axios
    .post(apiBase(`/private-api/images-delete`), data)
    .then((resp) => resp.data);
};

export const addImage = (username: string, url: string): Promise<any> => {
  const data = { code: getAccessToken(username), url: url };
  return axios
    .post(apiBase(`/private-api/images-add`), data)
    .then((resp) => resp.data);
};

export interface Draft {
  body: string;
  created: string;
  post_type: string;
  tags: string;
  timestamp: number;
  title: string;
  _id: string;
}

export const getDrafts = (username: string): Promise<Draft[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/drafts`), data)
    .then((resp) => resp.data);
};

export const addDraft = (
  username: string,
  title: string,
  body: string,
  tags: string
): Promise<{ drafts: Draft[] }> => {
  const data = { code: getAccessToken(username), title, body, tags };
  return axios
    .post(apiBase(`/private-api/drafts-add`), data)
    .then((resp) => resp.data);
};

export const updateDraft = (
  username: string,
  draftId: string,
  title: string,
  body: string,
  tags: string
): Promise<any> => {
  const data = {
    code: getAccessToken(username),
    id: draftId,
    title,
    body,
    tags,
  };
  return axios
    .post(apiBase(`/private-api/drafts-update`), data)
    .then((resp) => resp.data);
};

export const deleteDraft = (
  username: string,
  draftId: string
): Promise<any> => {
  const data = { code: getAccessToken(username), id: draftId };
  return axios
    .post(apiBase(`/private-api/drafts-delete`), data)
    .then((resp) => resp.data);
};

export interface Schedule {
  _id: string;
  username: string;
  permlink: string;
  title: string;
  body: string;
  tags: string[];
  tags_arr: string;
  schedule: string;
  original_schedule: string;
  reblog: boolean;
  status: 1 | 2 | 3 | 4;
  message: string | null;
}

export const getSchedules = (username: string): Promise<Schedule[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/schedules`), data)
    .then((resp) => resp.data);
};

export const addSchedule = (
  username: string,
  permlink: string,
  title: string,
  body: string,
  meta: {},
  options: {},
  schedule: string,
  reblog: boolean
): Promise<any> => {
  const data = {
    code: getAccessToken(username),
    permlink,
    title,
    body,
    meta,
    options,
    schedule,
    reblog,
  };
  return axios
    .post(apiBase(`/private-api/schedules-add`), data)
    .then((resp) => resp.data);
};

export const deleteSchedule = (username: string, id: string): Promise<any> => {
  const data = { code: getAccessToken(username), id };
  return axios
    .post(apiBase(`/private-api/schedules-delete`), data)
    .then((resp) => resp.data);
};

export const moveSchedule = (username: string, id: string): Promise<any> => {
  const data = { code: getAccessToken(username), id };
  return axios
    .post(apiBase(`/private-api/schedules-move`), data)
    .then((resp) => resp.data);
};

export interface Bookmark {
  _id: string;
  author: string;
  permlink: string;
  timestamp: number;
  created: string;
}

export const getBookmarks = (username: string): Promise<Bookmark[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/bookmarks`), data)
    .then((resp) => resp.data);
};

export const addBookmark = (
  username: string,
  author: string,
  permlink: string
): Promise<{ bookmarks: Bookmark[] }> => {
  const data = { code: getAccessToken(username), author, permlink };
  return axios
    .post(apiBase(`/private-api/bookmarks-add`), data)
    .then((resp) => resp.data);
};

export const deleteBookmark = (
  username: string,
  bookmarkId: string
): Promise<any> => {
  const data = { code: getAccessToken(username), id: bookmarkId };
  return axios
    .post(apiBase(`/private-api/bookmarks-delete`), data)
    .then((resp) => resp.data);
};

export interface Favorite {
  _id: string;
  account: string;
  timestamp: number;
}

export const getFavorites = (username: string): Promise<Favorite[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/favorites`), data)
    .then((resp) => resp.data);
};

export const checkFavorite = (
  username: string,
  account: string
): Promise<boolean> => {
  const data = { code: getAccessToken(username), account };
  return axios
    .post(apiBase(`/private-api/favorites-check`), data)
    .then((resp) => resp.data);
};

export const addFavorite = (
  username: string,
  account: string
): Promise<{ favorites: Favorite[] }> => {
  const data = { code: getAccessToken(username), account };
  return axios
    .post(apiBase(`/private-api/favorites-add`), data)
    .then((resp) => resp.data);
};

export const deleteFavorite = (
  username: string,
  account: string
): Promise<any> => {
  const data = { code: getAccessToken(username), account };
  return axios
    .post(apiBase(`/private-api/favorites-delete`), data)
    .then((resp) => resp.data);
};

export interface Fragment {
  id: string;
  title: string;
  body: string;
  created: string;
  modified: string;
}

export const getFragments = (username: string): Promise<Fragment[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/fragments`), data)
    .then((resp) => resp.data);
};

export const addFragment = (
  username: string,
  title: string,
  body: string
): Promise<{ fragments: Fragment[] }> => {
  const data = { code: getAccessToken(username), title, body };
  return axios
    .post(apiBase(`/private-api/fragments-add`), data)
    .then((resp) => resp.data);
};

export const updateFragment = (
  username: string,
  fragmentId: string,
  title: string,
  body: string
): Promise<any> => {
  const data = { code: getAccessToken(username), id: fragmentId, title, body };
  return axios
    .post(apiBase(`/private-api/fragments-update`), data)
    .then((resp) => resp.data);
};

export const deleteFragment = (
  username: string,
  fragmentId: string
): Promise<any> => {
  const data = { code: getAccessToken(username), id: fragmentId };
  return axios
    .post(apiBase(`/private-api/fragments-delete`), data)
    .then((resp) => resp.data);
};

export const getPoints = (
  username: string
): Promise<{
  points: string;
  unclaimed_points: string;
}> => {
  if (window.usePrivate) {
    const data = { username };
    return axios.post(`/private-api/points`, data).then((resp) => resp.data);
  }

  return new Promise((resolve) => {
    resolve({
      points: "0.000",
      unclaimed_points: "0.000",
    });
  });
};

export const getPointTransactions = (
  username: string,
  type?: number
): Promise<PointTransaction[]> => {
  if (window.usePrivate) {
    const data = { username, type };
    return axios
      .post(apiBase(`/private-api/point-list`), data)
      .then((resp) => resp.data);
  }

  return new Promise((resolve) => {
    resolve([]);
  });
};

export const claimPoints = (username: string): Promise<any> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/points-claim`), data)
    .then((resp) => resp.data);
};

export const calcPoints = (
  username: string,
  amount: string
): Promise<{ usd: number; estm: number }> => {
  const data = { code: getAccessToken(username), amount };
  return axios
    .post(apiBase(`/private-api/points-calc`), data)
    .then((resp) => resp.data);
};

export interface PromotePrice {
  duration: number;
  price: number;
}

export const getPromotePrice = (username: string): Promise<PromotePrice[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/promote-price`), data)
    .then((resp) => resp.data);
};

export const getPromotedPost = (
  username: string,
  author: string,
  permlink: string
): Promise<{ author: string; permlink: string } | ""> => {
  const data = { code: getAccessToken(username), author, permlink };
  return axios
    .post(apiBase(`/private-api/promoted-post`), data)
    .then((resp) => resp.data);
};

export const getBoostOptions = (username: string): Promise<number[]> => {
  const data = { code: getAccessToken(username) };
  return axios
    .post(apiBase(`/private-api/boost-options`), data)
    .then((resp) => resp.data);
};

export const getBoostedPost = (
  username: string,
  author: string,
  permlink: string
): Promise<{ author: string; permlink: string } | ""> => {
  const data = { code: getAccessToken(username), author, permlink };
  return axios
    .post(apiBase(`/private-api/boosted-post`), data)
    .then((resp) => resp.data);
};

export interface CommentHistoryListItem {
  title: string;
  body: string;
  tags: string[];
  timestamp: string;
  v: number;
}

interface CommentHistory {
  meta: {
    count: number;
  };
  list: CommentHistoryListItem[];
}

export const commentHistory = (
  author: string,
  permlink: string,
  onlyMeta: boolean = false
): Promise<CommentHistory> => {
  const data = { author, permlink, onlyMeta: onlyMeta ? "1" : "" };
  return axios
    .post(apiBase(`/private-api/comment-history`), data)
    .then((resp) => resp.data);
};

export const getPromotedEntries = (): Promise<Entry[]> => {
  if (window.usePrivate) {
    return axios
      .get(apiBase(`/private-api/promoted-entries`))
      .then((resp) => resp.data);
  }

  return new Promise((resolve) => resolve([]));
};
