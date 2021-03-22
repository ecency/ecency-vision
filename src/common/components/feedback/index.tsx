import React from "react";

import BaseComponent from "../base";

import random from "../../util/rnd";

import {checkSvg, alertCircleSvg, informationSvg} from "../../img/svg";

export const error = (message: string) => {
    const detail: FeedbackObject = {
        id: random(),
        type: "error",
        message,
    };
    const ev = new CustomEvent("feedback", {detail});
    window.dispatchEvent(ev);
};

export const success = (message: string) => {
    const detail: FeedbackObject = {
        id: random(),
        type: "success",
        message,
    };
    const ev = new CustomEvent("feedback", {detail});
    window.dispatchEvent(ev);
};

export const info = (message: string) => {
    const detail: FeedbackObject = {
        id: random(),
        type: "info",
        message,
    };
    const ev = new CustomEvent("feedback", {detail});
    window.dispatchEvent(ev);
};

type FeedbackType = "error" | "success" | "info";

export interface FeedbackObject {
    id: string;
    type: FeedbackType;
    message: string;
}

interface Props {
}

interface State {
    list: FeedbackObject[];
}

export default class Feedback extends BaseComponent<Props, State> {
    state: State = {
        list: [],
    };

    componentDidMount() {
        window.addEventListener("feedback", this.onFeedback);
    }

    componentWillUnmount() {
        super.componentWillUnmount();

        window.removeEventListener("feedback", this.onFeedback);
    }

    onFeedback = (e: Event) => {
        const detail: FeedbackObject = (e as CustomEvent).detail;

        const {list} = this.state;
        if (list.find((x) => x.message === detail.message) !== undefined) {
            return;
        }

        const newList = [...list, detail];
        this.stateSet({list: newList});

        setTimeout(() => {
            const {list} = this.state;
            const newList = list.filter((x) => x.id !== detail.id);
            this.stateSet({list: newList});
        }, 5000);
    };

    render() {
        const {list} = this.state;

        if (list.length === 0) {
            return null;
        }
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
                                <div key={x.id} className="feedback-error">
                                    {alertCircleSvg} {x.message}
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
            </div>
        );
    }
}
