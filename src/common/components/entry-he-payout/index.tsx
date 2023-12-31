import React, { Component, Fragment } from "react";

import { Popover, OverlayTrigger } from "react-bootstrap";

import { Entry } from "../../store/entries/types";
import { Global } from "../../store/global/types";
import { DynamicProps } from "../../store/dynamic-props/types";
import { ScotRewardsInformation, getScotRewardsInformation } from "../../api/hive-engine";

import FormattedCurrency from "../formatted-currency/index";

import parseAsset from "../../helper/parse-asset";
import { dateToFullRelative } from "../../helper/parse-date";

import formattedNumber from "../../util/formatted-number";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import { hiveEngineSvg } from "../../img/svg";

interface Props {
  global: Global;
  dynamicProps: DynamicProps;
  entry: Entry;
}

interface State {
  loadingScotRewardsInformation: boolean;
  scotRewards: Array<string>;
  scotRewardsError: boolean;
}

interface DisplayProps {
  scotRewards: Array<string>;
}

export function HiveEngineLoadingData(props: {}) {
  return <span className="grey">{hiveEngineSvg}</span>;
}

export function EntryHEPayoutDisplay(props: DisplayProps) {
  const { scotRewards } = props;
  return (
    <div className={_c(`entry-payout notranslate`)}>
      <span>{scotRewards.join(", ")}</span>
    </div>
  );
}

export class EntryHEPayout extends Component<Props, State> {
  state: State = {
    loadingScotRewardsInformation: true,
    scotRewardsError: false,
    scotRewards: []
  };

  componentDidMount() {
    const { entry } = this.props;
    const { author, permlink } = entry;
    getScotRewardsInformation(author, permlink)
      .then((rawScotRewardsInformation) => {
        try {
          if (this === null) return;
          const rewardsHash: { [tokenName: string]: string } = {};
          for (const tokenName in rawScotRewardsInformation) {
            const ti = rawScotRewardsInformation[tokenName];
            const { total_payout_value, pending_token, precision } = ti;
            let score: number = (total_payout_value + pending_token) * Math.pow(10, -precision);
            let prefix = "";
            if (pending_token + total_payout_value == 0) {
              continue;
            } else if (score < 0.0000001) {
              score = (total_payout_value + pending_token) * Math.pow(10, 9 - precision);
              prefix = "n";
            } else if (score < 0.0001) {
              score = (total_payout_value + pending_token) * Math.pow(10, 6 - precision);
              // mu symbol
              prefix = "\u03bc";
            } else if (score < 0.1) {
              score = (total_payout_value + pending_token) * Math.pow(10, 3 - precision);
              prefix = "m";
            } else if (score > 10000) {
              score /= 1000;
              prefix = "k";
            } else if (score > 1000000) {
              score = (total_payout_value + pending_token) * Math.pow(10, -6 - precision);
              prefix = "M";
            }
            // @ts-ignore
            rewardsHash[prefix + tokenName] =
              (formattedNumber(score, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2,
                truncate: true,
                debug: false,
                suffix: prefix + tokenName
              }) as string) + "";
          }

          const rewardsArray = Object.keys(rewardsHash).map((tokenName) => rewardsHash[tokenName]);
          this.setState({
            loadingScotRewardsInformation: false,
            scotRewards: rewardsArray
          });
        } catch (e) {
          console.log(e);
          this.setState({ loadingScotRewardsInformation: false, scotRewardsError: true });
        }
      })
      .catch((e) => {
        console.log(e);
        this.setState({ loadingScotRewardsInformation: false, scotRewardsError: true });
      });
  }

  render() {
    const { loadingScotRewardsInformation, scotRewards, scotRewardsError } = this.state;
    return scotRewardsError ? (
      <OverlayTrigger
        trigger={["hover", "focus"]}
        overlay={<span>Hive Engine Server Error</span>}
        delay={1000}
      >
        <span style={{ color: "red" }}>{hiveEngineSvg}</span>
      </OverlayTrigger>
    ) : loadingScotRewardsInformation ? (
      <OverlayTrigger
        trigger={["hover", "focus"]}
        overlay={<span>Loading Hive Engine Rewards Data In Progress...</span>}
        delay={1000}
      >
        <HiveEngineLoadingData />
      </OverlayTrigger>
    ) : (
      <EntryHEPayoutDisplay scotRewards={scotRewards} />
    );
  }
}

export default (p: Props) => {
  const props = {
    global: p.global,
    dynamicProps: p.dynamicProps,
    entry: p.entry
  };

  return <EntryHEPayout {...props} />;
};
