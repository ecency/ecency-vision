import React, { useState, useEffect, useRef } from "react";
import random from "../../util/rnd";
import { alertCircleSvg, checkSvg, closeSvg, informationSvg } from "../../img/svg";
import { Button } from "react-bootstrap";
import { FeedbackModal } from "../feedback-modal";
import { ErrorTypes } from "../../enums";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";

interface Props {
  notification: any;
}
export default function FeedbackMessage(props: Props) {
  const [progress, setProgress] = useState(1000);

  useEffect(() => {
    // console.log(props);
  }, []);

  const handleCloseBtn = () => {
    // setDisplay(false);
    setProgress(1000);
  };

  const displayNotification = () => {
    const x = props.notification;
    // console.log("NOTIFICATION", x)
    switch (x.type) {
      case "success":
        return (
          <div key={x.id} className="feedback-success">
            <div className="feedback-body">
              <div className="feedback-close-btn" onClick={handleCloseBtn}>
                {closeSvg}
              </div>
              <div className="feedback-content">
                <div className="feedback-img success-img">{checkSvg}</div>
                {x.message}
              </div>
            </div>

            <div className="toast-progress-bar">
              <div className="filler success" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      // case "error":
      //   return (
      //     <div key={x.id} className="feedback-error align-items-start">
      //       <div className="feedback-body">
      //         <div className="feedback-close-btn" onClick={handleCloseBtn}>
      //           {closeSvg}
      //         </div>
      //         <div className="error-content">
      //           <div className="error-img">{alertCircleSvg}</div>

      //           <div className=" d-flex flex-column align-items-start">
      //             {x.message}
      //             <div className="d-flex">
      //               {errorType(x) !== ErrorTypes.COMMON &&
      //               errorType(x) !== ErrorTypes.INFO ? (
      //                 <Button
      //                   className="mt-2 details-button px-0 mr-3"
      //                   variant="link"
      //                   onClick={() => {
      //                     setShowDialog(true);
      //                     setDetailedObject(x);
      //                   }}
      //                 >
      //                   {_t("feedback-modal.question")}
      //                 </Button>
      //               ) : (
      //                 <></>
      //               )}
      //               {!ErrorTypes.INFO && (
      //                 <Button
      //                   className="mt-2 details-button px-0"
      //                   variant="link"
      //                   onClick={() =>
      //                     window.open(
      //                       "mailto:bug@ecency.com?Subject=Reporting issue&Body=Hello team, \n I would like to report issue: \n",
      //                       "_blank"
      //                     )
      //                   }
      //                 >
      //                   {_t("feedback-modal.report")}
      //                 </Button>
      //               )}
      //             </div>
      //           </div>
      //         </div>
      //       </div>

      //       <div className="toast-progress-bar">
      //         <div className="filler error" style={{ width: `${progress}%` }} />
      //       </div>
      //     </div>
      //   );
      case "info":
        return (
          <div key={x.id} className="feedback-info">
            <div className="feedback-body">
              <div className="feedback-close-btn" onClick={handleCloseBtn}>
                {closeSvg}
              </div>
              <div className="feedback-content">
                <div className="feedback-img">{informationSvg}</div>
                {x.message}
              </div>
            </div>
            <div className="toast-progress-bar">
              <div className="filler info" style={{ width: `${progress}%` }} />
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return <>{displayNotification()}</>;
}
