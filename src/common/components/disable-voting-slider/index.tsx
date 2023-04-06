import React, { useEffect, useState } from "react";

import { Entry } from "../../store/entries/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ActiveUser } from "../../store/active-user/types";

import { estimate } from "../../helper/estimate";

import { chevronDownSvgForSlider, chevronUpSvgForSlider } from "../../img/svg";

import * as ls from "../../util/local-storage";

import "./index.scss";

interface Props {
  entry: Entry;
  activeUser: ActiveUser;
  dynamicProps: DynamicProps;
}

export default function DisabledVotingSlider(props: Props) {
  const [sliderValue, setSliderValue] = useState(0);
  useEffect(() => {
    const sliderValue = ls.get("post_upSlider_value");
    if (sliderValue !== null) {
      setSliderValue(sliderValue);
    } else {
      setSliderValue(50);
    }
  });

  return (
    <div className="voting-controls-disabled">
      <div className="btn-vote btn-up-vote vote-btn-lg primary-btn-vote">
        <span className="btn-inner no-rotate">{chevronUpSvgForSlider}</span>
      </div>
      <div className="estimated">
        {estimate(props.entry, props.activeUser, props.dynamicProps, sliderValue).toFixed(3)}
      </div>
      <div className="slider slider-down">
        <div style={{ height: "40px", paddingRight: "13px" }}>
          <div className="slide">
            <div className="slide-background-line">
              <div
                className="slider-line"
                style={{
                  width: sliderValue + "%",
                  background: "#357ce6",
                  zIndex: 100
                }}
              />
              <span
                className="slider-dot pointer-dot"
                style={{
                  left: sliderValue + "%",
                  background: "#357ce6"
                }}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="percentage">{sliderValue + "%"}</div>
      <div className="btn-vote btn-down-vote vote-btn-lg secondary-btn-vote">
        <span className="btn-inner">{chevronDownSvgForSlider}</span>
      </div>
    </div>
  );
}
