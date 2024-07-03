import "./index.scss";
import { Tooltip } from "@ui/tooltip";
import { chevronDownSvgForSlider, chevronUpSvg } from "@ui/svg";
import i18next from "i18next";

interface Props {
  bodyRef: React.RefObject<HTMLDivElement>;
  isScrollToTop: boolean;
  isScrollToBottom: boolean;
  marginRight: string;
}

export function ChatsScroller(props: Props) {
  const { bodyRef, isScrollToTop, isScrollToBottom, marginRight } = props;

  const scrollerClicked = () => {
    bodyRef?.current?.scroll({
      top: isScrollToBottom ? bodyRef.current?.scrollHeight : 0,
      behavior: "auto"
    });
  };

  return (
    <Tooltip
      content={
        isScrollToTop ? i18next.t("scroll-to-top.title") : i18next.t("chat.scroll-to-bottom")
      }
    >
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
