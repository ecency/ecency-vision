import React, { useEffect, useRef, useState } from "react";
import { ErrorTypes } from "../../enums";
import { alertCircleSvg, checkSvg, closeSvg, informationSvg } from "../../img/svg";
import { FeedbackModal } from "../feedback-modal";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { Button } from "@ui/button";

interface Props {
  feedback: FeedbackObject;
  handleChild: (d: boolean) => void;
  activeUser: ActiveUser | null;
}

type FeedbackType = "error" | "success" | "info";

export interface FeedbackObject {
  id: string;
  type: FeedbackType;
  message: string;
}
export interface ErrorFeedbackObject extends FeedbackObject {
  errorType: ErrorTypes;
}

export default function FeedbackMessage(props: Props) {
  const [progress, setProgress] = useState(100);
  const [display, setDisplay] = useState(true);
  const [list, setList] = useState<FeedbackObject[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [detailedObject, setDetailedObject] = useState<FeedbackObject | null>(null);

  const intervalID = useRef<any>(null);

  useEffect(() => {
    const itemExists = list.find((x) => x.message === props.feedback.message);
    if (itemExists) {
      return;
    }
    setList([...list, props.feedback]);
    startTimer();
  }, []);

  useEffect(() => {
    if (progress === 0) {
      setDisplay(false);
      props.handleChild(false);
      stopTimer();
    }
  }, [progress]);

  const startTimer = () => {
    const setWidth = () => {
      setProgress((prevProgress) => prevProgress - 2.5);
    };

    const interval = setInterval(setWidth, 125);
    intervalID.current = interval;
  };

  const stopTimer = () => {
    clearInterval(intervalID.current);
  };

  const handleCloseBtn = () => {
    setDisplay(false);
    props.handleChild(false);
    setProgress(100);
  };

  const handleMouseEnter = () => {
    stopTimer();
  };

  const handleMouseleave = () => {
    startTimer();
  };

  const errorType = (x: any) => (x as ErrorFeedbackObject).errorType;
  return (
    <>
      {display && (
        <div
          className="feeback-message"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseleave}
        >
          {display &&
            list.map((x) => {
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
                case "error":
                  return (
                    <div key={x.id} className="feedback-error align-items-start">
                      <div className="feedback-body">
                        <div className="feedback-close-btn" onClick={handleCloseBtn}>
                          {closeSvg}
                        </div>
                        <div className="error-content">
                          <div className="error-img">{alertCircleSvg}</div>

                          <div className=" d-flex flex-column align-items-start">
                            {x.message}
                            <div className="d-flex">
                              {errorType(x) !== ErrorTypes.COMMON &&
                              errorType(x) !== ErrorTypes.INFO ? (
                                <Button
                                  className="mt-2 details-button mr-3"
                                  noPadding={true}
                                  appearance="link"
                                  onClick={() => {
                                    setShowDialog(true);
                                    setDetailedObject(x);
                                  }}
                                >
                                  {_t("feedback-modal.question")}
                                </Button>
                              ) : (
                                <></>
                              )}
                              {!ErrorTypes.INFO && (
                                <Button
                                  className="mt-2 details-button"
                                  noPadding={true}
                                  appearance="link"
                                  onClick={() =>
                                    window.open(
                                      "mailto:bug@ecency.com?Subject=Reporting issue&Body=Hello team, \n I would like to report issue: \n",
                                      "_blank"
                                    )
                                  }
                                >
                                  {_t("feedback-modal.report")}
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="toast-progress-bar">
                        <div className="filler error" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  );
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
            })}

          {detailedObject ? (
            <FeedbackModal
              activeUser={props.activeUser}
              instance={detailedObject as ErrorFeedbackObject}
              show={showDialog}
              setShow={(v) => {
                setShowDialog(v);
                setDetailedObject(null);
              }}
            />
          ) : (
            <></>
          )}
        </div>
      )}
    </>
  );

  // <>{display && <div className="feedback-message"></div>}</>;
}
