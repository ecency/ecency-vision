import {Component} from "react";

import mediumZoom, {Zoom} from 'medium-zoom';

export default class EntryBodyZoom extends Component {
    zoom: Zoom | null = null;

    componentDidMount() {
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
