import getSlug from "speakingurl";

import { MetaData, CommentOptions, RewardType } from "../api/operations";

const permlinkRnd = () => (Math.random() + 1).toString(16).substring(2);

export const createPermlink = (title: string, random: boolean = false): string => {
  const slug = getSlug(title);
  let perm = slug.toString();

  if (random) {
    const rnd = permlinkRnd();
    perm = `${slug.toString()}-${rnd}est`;
  }

  // STEEMIT_MAX_PERMLINK_LENGTH
  if (perm.length > 255) {
    perm = perm.substring(perm.length - 255, perm.length);
  }

  // only letters numbers and dashes
  perm = perm.toLowerCase().replace(/[^a-z0-9-]+/g, "");

  if (perm.length === 0) {
    return permlinkRnd();
  }

  return perm;
};

export const extractMetaData = (body: string): MetaData => {
  const urlReg = /(\b(https?|ftp):\/\/[A-Z0-9+&@#/%?=~_|!:,.;-]*[-A-Z0-9+&@#/%=~_|])/gim;
  const userReg = /(^|\s)(@[a-z][-.a-z\d]+[a-z\d])/gim;
  const imgReg = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif))/gim;

  const out: MetaData = {};

  const mUrls = body.match(urlReg);
  const mUsers = body.match(userReg);

  const matchedImages = [];
  const matchedLinks = [];
  const matchedUsers = [];

  if (mUrls) {
    for (let i = 0; i < mUrls.length; i++) {
      const ind = mUrls[i].match(imgReg);
      if (ind) {
        matchedImages.push(mUrls[i]);
      } else {
        matchedLinks.push(mUrls[i]);
      }
    }
  }

  if (matchedLinks.length) {
    out.links = matchedLinks;
  }
  if (matchedImages.length) {
    out.images = matchedImages;
  }

  if (mUsers) {
    for (let i = 0; i < mUsers.length; i++) {
      matchedUsers.push(mUsers[i].trim().substring(1));
    }
  }

  if (matchedUsers.length) {
    out.users = matchedUsers;
  }

  return out;
};

export const makeJsonMetaData = (meta: MetaData, tags: string[], appVer: string): MetaData =>
  Object.assign({}, meta, {
    tags,
    app: `ecency/${appVer}-vision`,
    format: "markdown+html",
    community: "ecency.app",
  });

export const makeCommentOptions = (author: string, permlink: string, rewardType: RewardType): CommentOptions => {
  const opt: CommentOptions = {
    allow_curation_rewards: true,
    allow_votes: true,
    author,
    permlink,
    max_accepted_payout: "1000000.000 HBD",
    percent_hbd: 10000,
    extensions: [[0, { beneficiaries: [{ account: "ecency", weight: 300 }] }]],
  };

  switch (rewardType) {
    case "sp":
      opt.max_accepted_payout = "1000000.000 HBD";
      opt.percent_hbd = 0;
      break;
    case "dp":
      opt.max_accepted_payout = "0.000 HBD";
      opt.percent_hbd = 10000;
      break;
    case "default":
      opt.max_accepted_payout = "1000000.000 HBD";
      opt.percent_hbd = 10000;
      break;
  }

  return opt;
};
