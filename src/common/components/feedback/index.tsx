import React from "react";
import BaseComponent from "../base";
import random from "../../util/rnd";
import { alertCircleSvg, checkSvg, closeSvg, informationSvg } from "../../img/svg";
import { Button } from "react-bootstrap";
import { FeedbackModal } from "../feedback-modal";
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

interface State {
  list: FeedbackObject[];
  showDialog: boolean;
  detailedObject: FeedbackObject | null;
  display: boolean;
  progress: number;
  intervalState: boolean;
}

export default class Feedback extends BaseComponent<Props, State> {
  intervalID: any;
  constructor(props: Props) {
    super(props);
    this.intervalID = null;
  }
  state: State = {
    list: [],
    showDialog: false,
    detailedObject: null,
    display: true,
    progress: 100,
    intervalState: true
  };

  componentDidMount() {
    window.addEventListener("feedback", this.onFeedback);
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    if (prevState.progress !== this.state.progress) {
      if (this.state.progress === -2.5) {
        this.stateSet({ display: false, progress: 100, list: [], intervalState: true });
        this.stopTimer();
      }
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    window.removeEventListener("feedback", this.onFeedback);
    clearInterval(this.intervalID);
  }

  startTimer = () => {
    const setWidth = () => {
      if (this.state.intervalState) {
        this.setState({ intervalState: false });
        return;
      }
      const { progress } = this.state;
      this.stateSet({ progress: progress - 2.5 });
    };

    const interval = setInterval(
      (function hello() {
        setWidth();
        return hello;
      })(),
      125
    );
    this.intervalID = interval;
  };

  stopTimer = () => {
    clearInterval(this.intervalID);
  };

  handleMouseEnter = () => {
    this.stopTimer();
  };

  handleMouseleave = () => {
    this.startTimer();
  };

  onFeedback = (e: Event) => {
    this.setState({ display: true });
    this.startTimer();
    const detail: FeedbackObject = (e as CustomEvent).detail;

    const { list } = this.state;
    if (list.find((x) => x.message === detail.message) !== undefined) {
      return;
    }

    const newList = [...list, detail];
    this.stateSet({ list: newList });
  };

  render() {
    const { list, display, progress } = this.state;
    if (progress === -2.5) {
      return null;
    }
    const style = {
      width: `${progress}%`
    };
    const errorType = (x: FeedbackObject) => (x as ErrorFeedbackObject).errorType;
    return (
      <div
        className={"feedback-container" + (list.length > 0 ? " " + "visible" : "")}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseleave}
      >
        {display &&
          list.map((x) => {
            switch (x.type) {
              case "success":
                return (
                  <div key={x.id} className="feedback-success">
                    <div className="feedback-body">
                      <div
                        className="feedback-close-btn"
                        onClick={() =>
                          this.setState({ display: false, progress: 100, intervalState: true })
                        }
                      >
                        {closeSvg}
                      </div>
                      <div className="feedback-content">
                        <div className="feedback-img success-img">{checkSvg}</div>
                        {x.message}
                      </div>
                    </div>

                    <div className="toast-progress-bar">
                      <div className="filler success" style={style} />
                    </div>
                  </div>
                );
              case "error":
                return (
                  <div key={x.id} className="feedback-error align-items-start">
                    <div className="feedback-body">
                      <div
                        className="feedback-close-btn"
                        onClick={() =>
                          this.setState({ display: false, progress: 100, intervalState: true })
                        }
                      >
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
                                className="mt-2 details-button px-0 mr-3"
                                variant="link"
                                onClick={() =>
                                  this.setState({ showDialog: true, detailedObject: x })
                                }
                              >
                                {_t("feedback-modal.question")}
                              </Button>
                            ) : (
                              <></>
                            )}
                            {!ErrorTypes.INFO && (
                              <Button
                                className="mt-2 details-button px-0"
                                variant="link"
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
                      <div className="filler error" style={style} />
                    </div>
                  </div>
                );
              case "info":
                return (
                  <div key={x.id} className="feedback-info">
                    <div className="feedback-body">
                      <div
                        className="feedback-close-btn"
                        onClick={() =>
                          this.setState({ display: false, progress: 100, intervalState: true })
                        }
                      >
                        {closeSvg}
                      </div>
                      <div className="feedback-content">
                        <div className="feedback-img">{informationSvg}</div>
                        {x.message}
                      </div>
                    </div>
                    <div className="toast-progress-bar">
                      <div className="filler info" style={style} />
                    </div>
                  </div>
                );
              default:
                return null;
            }
          })}

        {this.state.detailedObject ? (
          <FeedbackModal
            activeUser={this.props.activeUser}
            instance={this.state.detailedObject as ErrorFeedbackObject}
            show={this.state.showDialog}
            setShow={(v) => this.setState({ showDialog: v, detailedObject: null })}
          />
        ) : (
          <></>
        )}
      </div>
    );
  }
}
