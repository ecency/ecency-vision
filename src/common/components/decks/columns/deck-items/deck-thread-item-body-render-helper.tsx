import React, { MutableRefObject } from "react";
import ReactDOM from "react-dom";
import { UserAvatar } from "../../../user-avatar";
import { Global } from "../../../../store/global/types";
import { DeckThreadLinkItem } from "./deck-thread-link-item";

export function renderTags(renderAreaRef: MutableRefObject<HTMLElement | null>) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLLinkElement>(".markdown-tag-link")
    .forEach((element) => {
      element.href = `/trending/${element.dataset.tag}`;
      element.target = "_blank";
    });
}

export function renderAuthors(renderAreaRef: MutableRefObject<HTMLElement | null>, global: Global) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLLinkElement>(".markdown-author-link")
    .forEach((element) => {
      const { author } = element.dataset;
      if (author) {
        element.href = `/@${author}`;
        element.target = "_blank";
        ReactDOM.hydrate(
          <>
            <UserAvatar size="xsmall" global={global} username={author} />
            <span>{author}</span>
          </>,
          element
        );
      }
    });
}

export function renderPostLinks(renderAreaRef: MutableRefObject<HTMLElement | null>) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLLinkElement>(".markdown-post-link")
    .forEach((element) => {
      const { author, permlink } = element.dataset;

      if (author && permlink) {
        element.href = `/@${author}/${permlink}`;
        element.target = "_blank";
        ReactDOM.hydrate(<DeckThreadLinkItem link={`/@${author}/${permlink}`} />, element);
      }
    });
}

export function renderExternalLinks(renderAreaRef: MutableRefObject<HTMLElement | null>) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLLinkElement>(".markdown-external-link")
    .forEach((element) => {
      let href = element.dataset.href ?? null;
      if (!href) {
        href = element.getAttribute("href");
      }

      if (href) {
        element.href = href;
        element.target = "_blank";
      }

      // Process YouTube links dropped from render-helper
      if (href?.startsWith("https://youtube.com") || href?.startsWith("https://www.youtube.com")) {
        const link = new URL(href);
        const code = link.pathname.replaceAll("/shorts/", "");

        ReactDOM.hydrate(
          <iframe
            className="youtube-shorts-iframe"
            width="100%"
            height="600"
            src={`https://www.youtube.com/embed/${code}`}
            title="YouTube video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={true}
          />,
          element
        );
      }
    });
}

export function renderImages(
  renderAreaRef: MutableRefObject<HTMLElement | null>,
  opt: Record<string, any>
) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLImageElement>("img, .markdown-img-link")
    .forEach((element) => {
      const src = element.getAttribute("src");

      if (src) {
        element.addEventListener("click", () => {
          opt.setCurrentViewingImageRect(element.getBoundingClientRect());
          opt.setCurrentViewingImage(src);
        });
      }
    });
}

export function renderVideos(renderAreaRef: MutableRefObject<HTMLElement | null>) {
  return renderAreaRef.current
    ?.querySelectorAll<HTMLImageElement>(".markdown-video-link")
    .forEach((element) => {
      let embedSrc = element.dataset.embedSrc;
      embedSrc = embedSrc?.replaceAll("autoplay=1", "");

      if (embedSrc) {
        ReactDOM.hydrate(
          <iframe
            className="youtube-shorts-iframe"
            width="100%"
            height="200"
            src={`${embedSrc}`}
            title="Video player"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen={true}
          />,
          element
        );
      }
    });
}
