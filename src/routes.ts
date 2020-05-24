import filters from './constants/filters.json';

export default {
    HOME: `/`,
    ABOUT: `/about`,
    GUESTS: `/guest-posts`,
    CONTRIBUTE: `/contribute`,
    SIGN_UP: `/signup`,
    WHITE_PAPER: `/whitepaper`,
    PRIVACY: `/privacy-policy`,
    TOS: `/terms-of-service`,
    FILTER: `/:filter(${filters.join('|')})`,
    FILTER_TAG: `/:filter(${filters.join('|')})/:tag`,
    ENTRY: `/:category/:username(@[\\w\\.\\d-]+)/:permlink`,
    USER: `/:username(@[\\w\\.\\d-]+)`,
    USER_FEED: `/:username(@[\\w\\.\\d-]+)/:section(feed)`,
    USER_SECTION: `/:username(@[\\w\\.\\d-]+)/:section(blog|comments|replies|wallet)`,
};
