"use client";

import { useRouter } from "next/navigation";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

export function MdHandler() {
  const router = useRouter();

  const goToElementWhenActive = () => {
    // go to element when active page
    setTimeout(() => {
      const urlHash = location.hash;
      !!urlHash && goToElement(urlHash);
    }, 300);
  };

  const clicked = (e: MouseEvent): void => {
    let el = e.target as HTMLElement;

    // A element can be wrapped with inline element. Look parent elements.
    while (el.tagName !== "A") {
      if (!el.parentNode) {
        break;
      }
      el = el.parentNode as HTMLElement;
    }

    if (!el || el.tagName !== "A") {
      return;
    }

    if (
      el.classList.contains("markdown-author-link") ||
      el.classList.contains("markdown-post-link") ||
      el.classList.contains("markdown-community-link") ||
      el.classList.contains("markdown-tag-link")
    ) {
      e.preventDefault();
      const href = el.getAttribute("href");
      if (!href) {
        return;
      }
      router.push(href);
    }

    if (el.classList.contains("markdown-video-link")) {
      const embedSrc = el.getAttribute("data-embed-src");
      if (embedSrc) {
        el.innerHTML = `<iframe frameborder='0' allowfullscreen src='${embedSrc}'></iframe>`;
        return;
      }
      const videoHref = el.getAttribute("data-video-href");
      if (videoHref) {
        window.open(videoHref);
        e.preventDefault();
        return;
      }
    }

    if (el.classList.contains("markdown-internal-link")) {
      // click go to element by data-id
      let href = el.getAttribute("href");
      !!href && goToElement(href);
    }
  };

  const goToElement = (hashKey: string = "") => {
    if (!!hashKey) {
      const _data_id = hashKey.replace("#", ""); // remove # from internal href. EX: #test => test
      const get_element_by_data_id = document.querySelectorAll(`[data-id="${_data_id}"]`);
      get_element_by_data_id.length > 0 &&
        get_element_by_data_id[0].scrollIntoView({ behavior: "smooth" });
    }
  };

  useMount(() => {
    document.addEventListener("click", clicked);
    goToElementWhenActive();
  });

  useUnmount(() => document.removeEventListener("click", clicked));

  return <></>;
}
