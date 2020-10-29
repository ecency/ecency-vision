import React, {Component} from "react";

export default class InjectJS extends Component {
    shouldComponentUpdate(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean {
        return false;
    }

    render() {
        const tracker = `var _paq = window._paq = window._paq || [];
                  /* tracker methods like "setCustomDimension" should be called before "trackPageView" */
                  _paq.push(["setDocumentTitle", document.domain + "/" + document.title]);
                  _paq.push(["setCookieDomain", "*.ecency.com"]);
                  _paq.push(["setDomains", ["*.ecency.com"]]);
                  _paq.push(['trackPageView']);
                  _paq.push(['enableLinkTracking']);
                  (function() {
                  var u="//analytics.ecency.com/";
                  _paq.push(['setTrackerUrl', u+'matomo.php']);
                  _paq.push(['setSiteId', '1']);
                  var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
                  g.type='text/javascript'; g.async=true; g.src=u+'matomo.js'; s.parentNode.insertBefore(g,s);
                })();`;

        const twitter = `window.twttr = (function(d, s, id) {
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
        }(document, "script", "twitter-wjs"));`;

        return <>
            <script type="text/javascript" dangerouslySetInnerHTML={{__html: tracker}}/>
            <script type="text/javascript" dangerouslySetInnerHTML={{__html: twitter}}/>
            <noscript>
                <p><img src="//analytics.ecency.com/matomo.php?idsite=1&amp;rec=1" style={{border: "0"}} alt=""/></p>
            </noscript>
        </>
    }
}
