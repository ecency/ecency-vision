import React, { useState, useEffect } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

import { _t } from "../../i18n";
import { informationVariantSvg } from "../../img/svg";

export const ReadTime = (props: any) => {
  const { entry, global, isVisible, toolTip } = props;

  const [readTime, setReadTime] = useState(0);
  const [wordCount, setWordCount] = useState(0);

  useEffect(() => {
    // countWords(entry.body)
    // console.log(entry.body)
    calculateExtras();
  }, [entry]);

  const calculateExtras = async () => {
    // const wordsWithoutSpace: any = entry?.body.trim()?.split(/\s+/);
    const entryCount = countWords(entry.body)
    // const totalCount: number = wordsWithoutSpace?.length;
    const wordPerMinuite: number = 225;
    setWordCount(entryCount);
    setReadTime(Math.ceil(entryCount / wordPerMinuite));
  };

  const countWords = (entry: string) =>{
    const entryCategory1 = new RegExp('[\u3000-\u4DFF]','g');
    const entryCategory2 = new RegExp('[\u4E00-\u9FFF]','g');
    const entryCategory3 = new RegExp('[\u0E00-\u0E7F]','g');
    entry = entry.replace(entryCategory1,' {PNK} ');
    entry = entry.replace(entryCategory2,' {CJK} ');
    entry = entry.replace(entryCategory3,' {THI} ');
    entry = entry.replace(/(\(|\)|\*|\||\+|\”|\’|_|;|:|,|\.|\?)/ig," ") ;
    entry = entry.replace(/\s+/ig," ");
    let splitEntry = entry.trim()?.split(/\s+/);
    let count: any = 0;
    let counter1 = 0;
    // let counter2 = 0;
    let counter3 = 0;
    for (let i=0;i<splitEntry.length;i++){
        if (splitEntry[i]=='{PNK}'){
              counter1++;
        }else if(splitEntry[i]=='{THI}'){
              counter3++;
        }else if (splitEntry[i].length>0){
              count++;
        }
    }
    count += Math.ceil(counter1/3) + Math.ceil(counter3/4);
    console.log(count)
    return count;
}

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
