import React from "react";
import Tooltip from "../../../components/tooltip";

import { _t } from "../../../i18n";
import { chevronDownSvgForSlider, chevronUpSvg } from "../../../img/svg";

import "./index.scss";

interface Props {
  bodyRef: React.RefObject<HTMLDivElement>;
  isScrollToTop: boolean;
  isScrollToBottom: boolean;
  marginRight: string;
}
export default function ChatsScroller(props: Props) {
  const { bodyRef, isScrollToTop, isScrollToBottom, marginRight } = props;

  const scrollerClicked = () => {
    bodyRef?.current?.scroll({
      top: isScrollToBottom ? bodyRef.current?.scrollHeight : 0,
      behavior: "auto"
    });
  };

  return (
    <Tooltip content={isScrollToTop ? _t("scroll-to-top.title") : _t("chat.scroll-to-bottom")}>
      <div
        className="scroller"
        style={{ bottom: isScrollToBottom ? "20px" : "55px", marginRight: marginRight }}
        onClick={scrollerClicked}
      >
        {isScrollToTop ? chevronUpSvg : chevronDownSvgForSlider}
      </div>
    </Tooltip>
  );
}
