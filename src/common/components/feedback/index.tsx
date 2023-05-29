import React, { useState, useEffect, useRef } from "react";
import random from "../../util/rnd";
import FeedbackMessage from "../feedback-message";
import { ErrorTypes } from "../../enums";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import "./_index.scss";

export const error = (message: string, errorType = ErrorTypes.COMMON) => {
  const detail: ErrorFeedbackObject = {
    id: random(),
    type: "error",
    message,
    errorType
  };
  const ev = new CustomEvent("feedback", { detail });
  window.dispatchEvent(ev);
};

export const success = (message: string) => {
  const detail: FeedbackObject = {
    id: random(),
    type: "success",
    message
  };
  const ev = new CustomEvent("feedback", { detail });
  window.dispatchEvent(ev);
};

export const info = (message: string) => {
  const detail: FeedbackObject = {
    id: random(),
    type: "info",
    message
  };
  const ev = new CustomEvent("feedback", { detail });
  window.dispatchEvent(ev);
};

type FeedbackType = "error" | "success" | "info";

export interface FeedbackObject {
  id: string;
  type: FeedbackType;
  message: string;
}

export interface ErrorFeedbackObject extends FeedbackObject {
  errorType: ErrorTypes;
}

interface Props {
  activeUser: ActiveUser | null;
}

export default function Feedback(props: Props) {
  const intervalID = useRef<any>(null);

  const [feedback, setFeedBack] = useState<FeedbackObject | null>();
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    window.addEventListener("feedback", onFeedback);

    return () => {
      window.removeEventListener("feedback", onFeedback);
      clearInterval(intervalID.current);
    };
  }, []);

  const handleChild = (d: boolean) => {
    setShowChild(d);
    setFeedBack(null);
  };

  const isEmpty = (value: FeedbackObject | null | undefined) => {
    return value == null || (typeof value === "object" && Object.keys(value).length === 0);
  };

  const onFeedback = (e: Event) => {
    const detail = (e as CustomEvent).detail as FeedbackObject;
    setFeedBack(detail);
    setShowChild(true);
  };

  return (
    <>
      <div className={"feedback-container" + (!isEmpty(feedback) ? " " + "visible" : "")}>
        {showChild && feedback && (
          <FeedbackMessage
            activeUser={props.activeUser}
            feedback={feedback}
            handleChild={handleChild}
          />
        )}
      </div>
    </>
  );
}
