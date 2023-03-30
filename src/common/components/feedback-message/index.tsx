import React, { useEffect, useState } from "react";
import { List } from "react-virtualized";
import { checkSvg, closeSvg } from "../../img/svg";

interface Props {
  messageType: string;
  list: any[];
}
export default function FeedbackMessage(props: Props) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    console.log(props);
  }, []);

  const handleCloseBtn = () => {
    // setDisplay(false);
    setProgress(100);
  };

  return (
    <>
      {/* {
          List.
        } */}
      <li>
        <div className="feedback-success">
          <div className="feedback-body">
            <div className="feedback-close-btn" onClick={handleCloseBtn}>
              {closeSvg}
            </div>
            <div className="feedback-content">
              <div className="feedback-img success-img">{checkSvg}</div>
              {"HYYYYYYYYYYYYYYY"}
            </div>
          </div>

          <div className="toast-progress-bar">
            <div className="filler success" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </li>
    </>
  );
}
