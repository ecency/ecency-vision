import React from "react";
import BaseComponent from "../base";
import random from "../../util/rnd";
import { alertCircleSvg, checkSvg, informationSvg } from "../../img/svg";
import { Button } from "react-bootstrap";
import { FeedbackModal } from "../feedback-modal";
import { ErrorTypes } from "../../enums";
import { ActiveUser } from "../../store/active-user/types";
import { _t } from "../../i18n";
import { mountCheck } from "../../components/announcement";
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
}

export default class Feedback extends BaseComponent<Props, State> {
  state: State = {
    list: [],
    showDialog: false,
    detailedObject: null
  };

  componentDidMount() {
    window.addEventListener("feedback", this.onFeedback);
  }

  componentWillUnmount() {
    super.componentWillUnmount();

    window.removeEventListener("feedback", this.onFeedback);
  }

  onFeedback = (e: Event) => {
    mountCheck(true);
    const detail: FeedbackObject = (e as CustomEvent).detail;

    const { list } = this.state;
    if (list.find((x) => x.message === detail.message) !== undefined) {
      return;
    }

    const newList = [...list, detail];
    this.stateSet({ list: newList });

    setTimeout(() => {
      const { list } = this.state;
      const newList = list.filter((x) => x.id !== detail.id);
      this.stateSet({ list: newList });
    }, 5000);
  };

  render() {
    const { list } = this.state;
    const errorType = (x: FeedbackObject) => (x as ErrorFeedbackObject).errorType;
    return (
      <div className="feedback-container">
        {list.map((x) => {
          switch (x.type) {
            case "success":
              return (
                <div key={x.id} className="feedback-success">
                  {checkSvg} {x.message}
                </div>
              );
            case "error":
              return (
                <div key={x.id} className="feedback-error d-flex align-items-start">
                  {alertCircleSvg}
                  <div className=" d-flex flex-column align-items-start">
                    {x.message}
                    <div className="d-flex">
                      {errorType(x) !== ErrorTypes.COMMON ? (
                        <Button
                          className="mt-2 details-button px-0 mr-3"
                          variant="link"
                          onClick={() => this.setState({ showDialog: true, detailedObject: x })}
                        >
                          {_t("feedback-modal.question")}
                        </Button>
                      ) : (
                        <></>
                      )}
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
                    </div>
                  </div>
                </div>
              );
            case "info":
              return (
                <div key={x.id} className="feedback-info">
                  {informationSvg} {x.message}
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
