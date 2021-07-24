import React, {Component} from "react";

export default class Tracker extends Component {
    state = {
        mounted: false
    }

    shouldComponentUpdate(nextProps: Readonly<{}>, nextState: Readonly<{}>, nextContext: any): boolean {
        return false;
    }

    componentDidMount(){
        this.setState({mounted:true})
    }


    render() {
        const { mounted } = this.state;
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

        return mounted ? <>
            <script type="text/javascript" dangerouslySetInnerHTML={{__html: tracker}}/>
            <noscript>
                <p><img src="//analytics.ecency.com/matomo.php?idsite=1&amp;rec=1" style={{border: "0"}} alt="Ecency analytics"/></p>
            </noscript>
        </> : null
    }
}
