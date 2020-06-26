import React, { Component } from "react";

import { Alert } from "react-bootstrap";

import random from "../../util/rnd";

import { checkSvg, alertCircleSvg } from "../../img/svg";

export const error = (message: string) => {
  const detail: FeedbackObject = {
    id: random(),
    type: "error",
    message,
  };
  const ev = new CustomEvent("feedback", { detail });
  window.dispatchEvent(ev);
};

export const success = (message: string) => {
  const detail: FeedbackObject = {
    id: random(),
    type: "success",
    message,
  };
  const ev = new CustomEvent("feedback", { detail });
  window.dispatchEvent(ev);
};

type FeedbackType = "error" | "success";

export interface FeedbackObject {
  id: string;
  type: FeedbackType;
  message: string;
}

interface Props {}

interface State {
  list: FeedbackObject[];
}

export default class Feedback extends Component<Props, State> {
  state: State = {
    list: [],
  };

  componentDidMount() {
    window.addEventListener("feedback", this.onFeedback);
  }

  componentWillUnmount() {
    window.removeEventListener("feedback", this.onFeedback);
  }

  onFeedback = (e: Event) => {
    const detail: FeedbackObject = (e as CustomEvent).detail;

    const { list } = this.state;
    if (list.find((x) => x.message === detail.message) !== undefined) {
      return;
    }

    const newList = [...list, detail];
    this.setState({ list: newList });

    setTimeout(() => {
      const { list } = this.state;
      const newList = list.filter((x) => x.id !== detail.id);
      this.setState({ list: newList });
    }, 5000);
  };

  render() {
    const { list } = this.state;

    if (list.length === 0) {
      return null;
    }
    return (
      <div className="feedback-container">
        {list.map((x) => {
          switch (x.type) {
            case "success":
              return (
                <Alert key={x.id} variant="success">
                  <div className="alert-inner">
                    {checkSvg} {x.message}
                  </div>
                </Alert>
              );
            case "error":
              return (
                <Alert key={x.id} variant="danger">
                  <div className="alert-inner">
                    {alertCircleSvg} {x.message}
                  </div>
                </Alert>
              );
            default:
              return null;
          }
        })}
      </div>
    );
  }
}
