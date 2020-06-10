import { Component } from "react";
import { History, Location } from "history";

interface Props {
  history: History;
}

export default class MdHandler extends Component<Props> {
  componentDidMount() {
    document.addEventListener("click", this.clicked);
  }

  componentWillUnmount() {
    document.removeEventListener("click", this.clicked);
  }

  clicked = (e: MouseEvent): void => {
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
      el.classList.contains("markdown-tag-link")
    ) {
      e.preventDefault();
      const href = el.getAttribute("href");
      if (!href) {
        return;
      }
      const { history } = this.props;
      history.push(href);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
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
  };

  render() {
    return null;
  }
}
