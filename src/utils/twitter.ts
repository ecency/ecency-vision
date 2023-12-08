import { AppWindow } from "@/types";

declare var window: AppWindow;

let timer: any = null;

export const injectTwitter = () => {
  clearTimeout(timer);
  timer = setTimeout(injectScript, 1000);
};

export const injectScript = () => {
  if (!document.getElementById("twttr-script")) {
    const script = document.createElement("script");
    script.setAttribute("id", "twttr-script");
    const js = document.createTextNode(`window.twttr = (function(d, s, id) {
            var js, fjs = d.getElementsByTagName(s)[0],
            t = window.twttr || {};
            if (d.getElementById(id)) return t;
            js = d.createElement(s);
            js.id = id;
            js.src = "https://platform.twitter.com/widgets.js";
            fjs.parentNode.insertBefore(js, fjs);

            t._e = [];
            t.ready = function(f) {
            t._e.push(f);
        };

            return t;
        }(document, "script", "twitter-wjs"));`);
    script.appendChild(js);
    document.body.appendChild(script);
  } else {
    window.twttr?.widgets?.load();
  }
};
