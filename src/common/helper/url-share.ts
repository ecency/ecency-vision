import defaults from "../constants/defaults.json";

export const makeEsteemUrl = (cat: string, author: string, permlink: string): string =>
  `${defaults.base}/${cat}/@${author}/${permlink}`;

export const makeCopyAddress = (
  title: string,
  cat: string,
  author: string,
  permlink: string
): string => `[${title}](/${cat}/@${author}/${permlink})`;

export const makeShareUrlReddit = (
  cat: string,
  author: string,
  permlink: string,
  title: string
): string => {
  const u = makeEsteemUrl(cat, author, permlink);
  return `https://reddit.com/submit?url=${encodeURIComponent(u)}&title=${encodeURIComponent(
    title
  )}`;
};

export const makeShareUrlTwitter = (
  cat: string,
  author: string,
  permlink: string,
  title: string
): string => {
  const u = makeEsteemUrl(cat, author, permlink);
  return `https://twitter.com/intent/tweet?url=${encodeURIComponent(u)}&text=${encodeURIComponent(
    title
  )}`;
};

export const makeShareUrlFacebook = (cat: string, author: string, permlink: string): string => {
  const u = makeEsteemUrl(cat, author, permlink);
  return `https://www.facebook.com/sharer.php?u=${encodeURIComponent(u)}`;
};
