import React, { Component } from "react";

import mediumZoom, { Zoom } from "medium-zoom";

import { Entry } from "../../store/entries/types";
import { Global, Theme } from "../../store/global/types";

import { injectTwitter } from "../../util/twitter";

interface Props {
  entry: Entry;
  global: Global;
}

class EntryBodyExtra extends Component<Props> {
  zoom: Zoom | null = null;

  setBackground = () => {
    if (this.props.global.theme === Theme.day) {
      this.zoom?.update({ background: "#ffffff" });
    } else {
      this.zoom?.update({ background: "#131111" });
    }
  };

  componentDidMount() {
    const { entry } = this.props;

    // Tweet renderer
    if (/(?:https?:\/\/(?:(?:twitter\.com\/(.*?)\/status\/(\d+)$)))/gim.test(entry.body)) {
      injectTwitter();
    }

    // Medium style image zoom
    const elements: HTMLElement[] = [
      ...document.querySelectorAll<HTMLElement>(".entry-body img")
    ].filter((x) => x.parentNode?.nodeName !== "A");
    this.zoom = mediumZoom(elements);
    this.setBackground();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.global.theme !== this.props.global.theme) {
      this.setBackground();
    }
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
    entry: p.entry,
    global: p.global
  };

  return <EntryBodyExtra {...props} />;
};
