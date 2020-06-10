import { EntryFilter, ProfileFilter } from "./store/global/types";

const entryFilters = Object.values(EntryFilter);
const profileFilters = Object.values(ProfileFilter);

export default {
  HOME: `/`,
  ABOUT: `/about`,
  GUESTS: `/guest-posts`,
  CONTRIBUTE: `/contribute`,
  SIGN_UP: `/signup`,
  WHITE_PAPER: `/whitepaper`,
  PRIVACY: `/privacy-policy`,
  TOS: `/terms-of-service`,
  FILTER: `/:filter(${entryFilters.join("|")})`,
  FILTER_TAG: `/:filter(${entryFilters.join("|")})/:tag`,
  ENTRY: `/:category/:username(@[\\w\\.\\d-]+)/:permlink`,
  USER: `/:username(@[\\w\\.\\d-]+)`,
  USER_FEED: `/:username(@[\\w\\.\\d-]+)/:section(feed)`,
  USER_SECTION: `/:username(@[\\w\\.\\d-]+)/:section(${profileFilters.join("|")}|wallet)`,
};
