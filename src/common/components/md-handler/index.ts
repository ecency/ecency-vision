import { Component } from "react";
import { History } from "history";
import { get } from "lodash";

import { Global } from "../../store/global/types";

interface Props {
  history: History;
  global: Global;
}

export default class MdHandler extends Component<Props> {
  componentDidMount() {
    document.addEventListener("click", this.clicked);
    this.goToElementWhenActive();
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.clicked);
  }

  goToElementWhenActive = () => {
    // go to element when active page
    setTimeout(() => {
      const urlHash = get(this.props, "history.location.hash");
      !!urlHash && this.goToElement(urlHash);
    }, 300);
  };

  clicked = (e: MouseEvent): void => {
    const { global } = this.props;

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
      const { history } = this.props;
      history.push(href);
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
      !!href && this.goToElement(href);
    }
  };

  goToElement = (hashKey: string = "") => {
    if (!!hashKey) {
      const _data_id = hashKey.replace("#", ""); // remove # from internal href. EX: #test => test
      const get_element_by_data_id = document.querySelectorAll(`[data-id="${_data_id}"]`);
      get_element_by_data_id.length > 0 &&
        get_element_by_data_id[0].scrollIntoView({ behavior: "smooth" });
    }
  };

  render() {
    return null;
  }
}
