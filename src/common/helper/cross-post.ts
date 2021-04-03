import {postBodySummary} from "@ecency/render-helper";

export const crossPostMessage = (body: string) => {
    const crossPostRegex = /^This is a cross post of \[@(.*?)\/(.*?)\]\(\/.*?@.*?\/.*?\) by @.*?\.<br>/;

    if (body.match(crossPostRegex)) {
        const message = body.replace(crossPostRegex, "");
        return postBodySummary(message);
    }

    return null;
}
