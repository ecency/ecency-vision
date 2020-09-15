import { EntryFilter, ProfileFilter } from "./store/global/types";

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

export default {
  HOME: `/`,
  ABOUT: `/about`,
  GUESTS: `/guest-posts`,
  CONTRIBUTE: `/contribute`,
  FAQ: `/faq`,
  SIGN_UP: `/signup`,
  WHITE_PAPER: `/whitepaper`,
  PRIVACY: `/privacy-policy`,
  TOS: `/terms-of-service`,
  AUTH: `/auth`,
  FILTER: `/:filter(${entryFilters.join("|")})`,
  FILTER_TAG: `/:filter(${entryFilters.join("|")})/:tag`,
  ENTRY: `/:category/:username(@[\\w\\.\\d-]+)/:permlink`,
  USER: `/:username(@[\\w\\.\\d-]+)`,
  USER_FEED: `/:username(@[\\w\\.\\d-]+)/:section(feed)`,
  USER_SECTION: `/:username(@[\\w\\.\\d-]+)/:section(${profileFilters.join("|")}|wallet|points)`,
  COMMUNITIES: `/communities`,
  COMMUNITY: `/:filter(${entryFilters.join("|")})/:name(hive-[\\d]+)`,
  COMMUNITY_SECTION: `/:filter(${entryFilters.join("|")})/:name(hive-[\\d]+)/:section(subscribers|activities)`,
  SUBMIT: `/submit`,
  EDIT: `/:username(@[\\w\\.\\d-]+)/:permlink/edit`,
  EDIT_DRAFT: `/draft/:draftId`,
  DISCOVER: `/discover`,
};
