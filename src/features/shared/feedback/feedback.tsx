"use client";

import { useEffect, useState } from "react";
import { FeedbackMessage, FeedbackObject } from "@/features/shared";

export function Feedback() {
  const [feedback, setFeedBack] = useState<FeedbackObject | null>();
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    window.addEventListener("feedback", onFeedback);

    return () => {
      window.removeEventListener("feedback", onFeedback);
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
        {showChild && feedback && <FeedbackMessage feedback={feedback} handleChild={handleChild} />}
      </div>
    </>
  );
}
