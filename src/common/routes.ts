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
  ONBOARD: `/onboard-friend/:type/:hash?`,
  WHITE_PAPER: `/whitepaper`,
  MARKET: `/market`,
  PRIVACY: `/privacy-policy`,
  TOS: `/terms-of-service`,
  CONTRIBUTORS: `/contributors`,
  AUTH: `/auth`,
  FILTER: `/:filter(${entryFilters.join("|")})`,
  FILTER_TAG: `/:filter(${entryFilters.join("|")})/:tag`,
  ENTRY: `/:category/:username(@[\\w\\.\\d-]+)/:permlink`,
  USER: `/:username(@[\\w\\.\\d-]+)`,
  USER_FEED: `/:username(@[\\w\\.\\d-]+)/:section(feed)`,
  USER_SECTION: `/:username(@[\\w\\.\\d-]+)/:section(${profileFilters.join(
    "|"
  )}|wallet|points|engine|communities|settings|permissions|referrals|followers|following|spk)`,
  COMMUNITIES: `/communities`,
  COMMUNITIES_CREATE: `/communities/create`,
  COMMUNITIES_CREATE_HS: `/communities/create-hs`,
  COMMUNITY: `/:filter(${entryFilters.join("|")}|subscribers|activities|roles)/:name(hive-[\\d]+)`,
  SUBMIT: `/submit`,
  EDIT: `/:username(@[\\w\\.\\d-]+)/:permlink/edit`,
  EDIT_DRAFT: `/draft/:draftId`,
  DISCOVER: `/discover`,
  SEARCH: `/search/`,
  SEARCH_MORE: `/search-more/`,
  WITNESSES: `/witnesses`,
  PROPOSALS: `/proposals`,
  PROPOSAL_DETAIL: `/proposals/:id(\\d+)`,
  PURCHASE: "/purchase"
};
