import React, { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { _t } from "../../i18n";
import { informationVariantSvg } from "../../img/svg";

export const ReadTime = (props: any) => {
  const { entry, global, isVisible, toolTip } = props;

  const [readTime, setReadTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    calculateExtras();
  }, [entry]);

  const calculateExtras = async () => {
    const wordsWithoutSpace: any = entry?.body.trim()?.split(/\s+/);
    const totalCount: number = wordsWithoutSpace?.length;
    const wordPerMinuite: number = 225;
    setWordCount(totalCount);
    setReadTime(Math.ceil(totalCount / wordPerMinuite));
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
        </div>
      )}
    </>
  );
};
export default ReadTime;
