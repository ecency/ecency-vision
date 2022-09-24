import React, {Component} from "react";

import mediumZoom, {Zoom} from 'medium-zoom';

import {Entry} from "../../store/entries/types";

import {injectTwitter} from "../../util/twitter";

interface Props {
    entry: Entry
}

class EntryBodyExtra extends Component<Props> {
    zoom: Zoom | null = null;

    componentDidMount() {
        const {entry} = this.props;

        // Tweet renderer
        if (/(?:https?:\/\/(?:(?:twitter\.com\/(.*?)\/status\/(\d+)$)))/gim.test(entry.body)) {
            injectTwitter();
        }

        // Medium style image zoom
        const elements: HTMLElement[] = [...document.querySelectorAll<HTMLElement>(".entry-body img")]
            .filter(x => x.parentNode?.nodeName !== "A");
        this.zoom = mediumZoom(elements);
    }

    componentWillUnmount() {
        if (this.zoom) {
            this.zoom.detach();
        }
    }

    render() {
        return null;
    }
}

export default (p: Props) => {
    const props = {
        entry: p.entry
    }

    return <EntryBodyExtra {...props} />
}
