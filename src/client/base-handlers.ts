// Base event handlers for browser window

import {history} from "../common/store";

import routes from "../common/routes";

import {pathToRegexp} from "path-to-regexp";

// Global drag&drop
const handleDragOver = (e: DragEvent) => {
    if (!(e.target && e.dataTransfer)) {
        return;
    }

    e.preventDefault();
    e.dataTransfer.effectAllowed = 'none';
    e.dataTransfer.dropEffect = 'none';
}

// Global click handler
const handleClick = (e: Event) => {
    const el = e.target as HTMLElement;

    // Anchor link handler
    if (el.tagName === "A" || (el.parentElement && el.parentElement.tagName === "A")) {

        const href = el.getAttribute("href") || (el.parentElement ? el.parentElement.getAttribute("href") : null);

        if (href && href.startsWith("/") && href.indexOf("#") !== -1) {
            const [route, anchor] = href.split("#");

            // make sure link matches with one of app routes
            if (Object.values(routes).find(p => pathToRegexp(p).test(route))) {
                e.preventDefault();

                let delay = 75;

                if (history!.location.pathname !== route) {
                    history!.push(href);
                }

                // scroll to anchor element
                const el = document.getElementById(anchor);
                if (el) {
                    setTimeout(() => {
                        el.scrollIntoView();
                    }, delay);
                }
            }
        }
    }

    // Handle links in static pages. (faq etc...)
    if (el.tagName === "A") {
        if (el.classList.contains("push-link")) {
            e.preventDefault();
            const href = el.getAttribute("href");
            if (href && href.startsWith("/")) {

                // make sure link matches with one of app routes
                if (Object.values(routes).find(p => pathToRegexp(p).test(href))) {
                    e.preventDefault();
                    history!.push(href);
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener('dragover', handleDragOver);
    document.body.addEventListener('click', handleClick);
});
