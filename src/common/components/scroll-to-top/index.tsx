import React, { Component } from "react";

import Tooltip from "../tooltip";

import { _t } from "../../i18n";

import { chevronUpSvg } from "../../img/svg";
import "./_index.scss";

export default class ScrollToTop extends Component {
  timer: any = null;
  button = React.createRef<HTMLDivElement>();

  componentDidMount() {
    this.detect();
    window.addEventListener("scroll", this.scrollChanged);
    window.addEventListener("resize", this.scrollChanged);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollChanged);
    window.removeEventListener("resize", this.scrollChanged);
  }

  shouldShow = () => {
    return window.scrollY > window.innerHeight;
  };

  scrollChanged = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(this.detect, 5);
  };

  detect = () => {
    if (!this.button.current) {
      return;
    }

    if (this.shouldShow()) {
      if (window.innerWidth <= 666) {
        this.button.current.classList.add("small-screen");
      } else {
        this.button.current.classList.remove("small-screen");
      }
      this.button.current.classList.add("visible");
      return;
    }

    this.button.current.classList.remove("visible");
  };

  clicked = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  };

  render() {
    return (
      <Tooltip content={_t("scroll-to-top.title")}>
        <div ref={this.button} className="scroll-to-top" onClick={this.clicked}>
          {chevronUpSvg}
        </div>
      </Tooltip>
    );
  }
}
