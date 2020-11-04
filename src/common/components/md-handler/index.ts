import {Component} from "react";
import {History} from "history";

import {Global} from "../../store/global/types";

interface Props {
    history: History;
    global: Global;
}

export default class MdHandler extends Component<Props> {
    componentDidMount() {
        document.addEventListener("click", this.clicked);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.clicked);
    }

    clicked = (e: MouseEvent): void => {
        const {global} = this.props;

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
            const {history} = this.props;
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
        // TODO: check if moving markdown-img-link from <a> into <img> didn't break this
        if (global.isElectron && el.classList.contains("markdown-img-link")) {
            e.preventDefault();
            const href = el.getAttribute("href");
            if (!href) {
                return;
            }

            window.open(href);
        }
    };

    render() {
        return null;
    }
}
