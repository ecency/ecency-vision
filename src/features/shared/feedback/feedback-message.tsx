"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@ui/button";
import { ErrorTypes } from "@/enums";
import { alertCircleSvg, checkSvg, closeSvg, informationSvg } from "@ui/svg";
import i18next from "i18next";
import { ErrorFeedbackObject, FeedbackModal, FeedbackObject } from "@/features/shared";

interface Props {
  feedback: FeedbackObject;
  handleChild: (d: boolean) => void;
}

type FeedbackType = "error" | "success" | "info";

export function FeedbackMessage(props: Props) {
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
  }, [list, props.feedback]);

  useEffect(() => {
    if (progress === 0) {
      setDisplay(false);
      props.handleChild(false);
      stopTimer();
    }
  }, [progress, props]);

  const startTimer = () => {
    const setWidth = () => {
      setProgress((prevProgress) => prevProgress - 2.5);
    };

    intervalID.current = setInterval(setWidth, 125);
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
                          <div className="feedback-img flex p-1 success-img">{checkSvg}</div>
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
                    <div key={x.id} className="feedback-error items-start">
                      <div className="feedback-body">
                        <div className="feedback-close-btn" onClick={handleCloseBtn}>
                          {closeSvg}
                        </div>
                        <div className="error-content">
                          <div className="error-img flex p-1">{alertCircleSvg}</div>

                          <div className=" flex flex-col items-start">
                            {x.message}
                            <div className="flex">
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
                                  {i18next.t("feedback-modal.question")}
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
                                  {i18next.t("feedback-modal.report")}
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
                          <div className="feedback-img flex p-1">{informationSvg}</div>
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
}
