import React from "react";
import { commentSvg } from "../../img/svg";
import { _t } from "../../i18n";
import "./_index.scss";
import { Button } from "@ui/button";

function CommentEngagement() {
  const scrollToCommentInput = () => {
    // const inputSection:  Element | null = document.querySelector('.entry-footer');
    // inputSection?.scrollIntoView({behavior: "smooth"});
    const inputS: HTMLElement | null = document.querySelector(".the-editor");
    inputS?.focus();
  };
  return (
    <div className="comment-engagement">
      <div className="icon">{commentSvg}</div>
      <div className="label">{_t("discussion.no-conversation")}</div>
      <Button id="scroll-to-input" onClick={scrollToCommentInput}>
        {_t("discussion.start-conversation")}
      </Button>
    </div>
  );
}

export default CommentEngagement;
