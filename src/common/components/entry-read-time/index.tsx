import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { getActiveVotes } from "../../api/hive";

import { prepareVotes } from "../entry-votes";

import { _t } from "../../i18n";
import { informationVariantSvg } from "../../img/svg";
import UserAvatar from "../user-avatar";
import Mytooltip from "../tooltip";

export interface ActiveVotes {
  rshares: number;
  voter: string;
}

export const ReadTime = (props: any) => {
  const { entry, global, isVisible, toolTip } = props;

  const [readTime, setReadTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const [topCurator, setTopCurator] = useState("");

  useEffect(() => {
    calculateExtras();
    getTopCurator();
  }, [entry]);

  const getTopCurator = async () => {
    const curator = props.entry.active_votes.reduce((prev: ActiveVotes, curr: ActiveVotes) => {
      return prev.rshares! > curr.rshares! ? prev : curr;
    });
    setTopCurator(curator.voter);
  };

  const calculateExtras = async () => {
    const entryCount = countWords(entry.body);
    const wordPerMinuite: number = 225;
    setWordCount(entryCount);
    setReadTime(Math.ceil(entryCount / wordPerMinuite));
  };

  const countWords = (entry: string) => {
    const cjkEntry = new RegExp("[\u4E00-\u9FFF]", "g");
    entry = entry.replace(cjkEntry, " {CJK} ");
    const splitEntry: any = entry.trim().split(/\s+/);
    const cjkCount = splitEntry.filter((e: string) => e === "{CJK}");
    const count: any = splitEntry.includes("{CJK}") ? cjkCount.length : splitEntry.length;
    return count;
  };

  return toolTip ? (
    <div className="post-info">
      <OverlayTrigger
        delay={{ show: 0, hide: 300 }}
        key={"bottom"}
        placement={"bottom"}
        overlay={
          <Tooltip id={`tooltip-word-count`}>
            <div className="tooltip-inner">
              <div className="profile-info-tooltip-content">
                <p>
                  {_t("entry.post-word-count")} {wordCount}
                </p>
                <p>
                  {_t("entry.post-read-time")} {readTime} {_t("entry.post-read-minuites")}
                </p>
              </div>
            </div>
          </Tooltip>
        }
      >
        <div className="d-flex align-items-center">
          <span className="info-icon mr-0 mr-md-2">{informationVariantSvg}</span>
        </div>
      </OverlayTrigger>
    </div>
  ) : (
    <>
      {!global.isMobile && isVisible && (
        <div id="word-count" className="visible hide-xl">
          <p>
            {_t("entry.post-word-count")} {wordCount}
          </p>
          <p>
            {_t("entry.post-read-time")} {readTime} {_t("entry.post-read-minuites")}
          </p>
          {topCurator && (
            <p className="top-curator">
              {_t("entry.post-top-curator")}
              <Mytooltip content={topCurator}>
                <Link to={`/@${topCurator}`}>
                  <div className="curator">
                    <UserAvatar username={topCurator} size="small" />
                  </div>
                </Link>
              </Mytooltip>
            </p>
          )}
        </div>
      )}
    </>
  );
};
export default ReadTime;
