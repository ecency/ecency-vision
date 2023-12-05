import { postBodySummary } from "@ecency/render-helper";
import { Entry } from "@/entities";

export const crossPostMessage = (body: string) => {
  const crossPostRegex =
    /^This is a cross post of \[@(.*?)\/(.*?)\]\(\/.*?@.*?\/.*?\) by @.*?\.<br>/;

  if (body.match(crossPostRegex)) {
    const message = body.replace(crossPostRegex, "");
    return postBodySummary(message);
  }

  return null;
};

export const makeCrossPostMessage = (entry: Entry, poster: string, message: string) => {
  return `This is a cross post of [@${entry.author}/${entry.permlink}](/${entry.category}/@${entry.author}/${entry.permlink}) by @${poster}.<br><br>${message}`;
};
