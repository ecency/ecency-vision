// Base event handlers for browser window

import {history} from "../common/store";

import routes from "../common/routes";

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
    if (el.tagName === "A") {
        const href = el.getAttribute("href");
        if (href && href.startsWith("/") && href.indexOf("#") !== -1) {
            e.preventDefault();
            const [route, anchor] = href.split("#");

            // make sure route in app routes
            if (Object.values(routes).filter(x => x === route)) {
                history!.push(route);

                // scroll to anchor element
                const el = document.getElementById(anchor);
                if (el) {
                    setTimeout(() => {
                        el.scrollIntoView();
                    }, 300);
                }
            }
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    document.body.addEventListener('dragover', handleDragOver);
    document.body.addEventListener('click', handleClick);
});
