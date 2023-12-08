import { ErrorTypes } from "@/enums";
import { random } from "@/utils";

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
