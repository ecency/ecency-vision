import React, { useEffect, useState } from "react";
import { History } from "history";

import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";

import { CurationDuration, CurationItem, getCuration } from "../../api/private-api";

import { informationVariantSvg } from "../../img/svg";
import DropDown from "../dropdown";
import LinearProgress from "../linear-progress";

import { _t } from "../../i18n";

import _c from "../../util/fix-class-names";
import { vestsToHp } from "../../helper/vesting";
import formattedNumber from "../../util/formatted-number";
import { getAccounts } from "../../api/hive";
import "./_index.scss";
import Tooltip from "../tooltip";

interface Props {
  global: Global;
  history: History;
  dynamicProps: DynamicProps;
  addAccount: (data: Account) => void;
}

export const Curation = (props: Props) => {
  const [data, setData] = useState([] as CurationItem[]);
  const [period, setPeriod] = useState("day" as CurationDuration);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(period);
  }, []);

  const compare = (a: CurationItem, b: CurationItem) => {
    return b.efficiency - a.efficiency;
  };

  const fetch = async (f: CurationDuration) => {
    setLoading(true);
    setData([] as CurationItem[]);
    const dataa = await getCuration(f);
    const accounts = dataa.map((item) => item.account);
    const ress = await getAccounts(accounts);

    for (let index = 0; index < ress.length; index++) {
      const element = ress[index];
      const curator = dataa[index];
      const effectiveVest: number =
        parseFloat(element.vesting_shares) +
        parseFloat(element.received_vesting_shares) -
        parseFloat(element.delegated_vesting_shares) -
        parseFloat(element.vesting_withdraw_rate);
      curator.efficiency = curator.vests / effectiveVest;
    }
    dataa.sort(compare);
    setData(dataa as CurationItem[]);
    setLoading(false);
  };

  const { dynamicProps } = props;
  const { hivePerMVests } = dynamicProps;

  const menuItems = [
    ...["day", "week", "month"].map((f) => {
      return {
        label: _t(`leaderboard.period-${f}`),
        onClick: () => {
          setPeriod(f as CurationDuration);
          fetch(f as CurationDuration);
        }
      };
    })
  ];

  const dropDownConfig = {
    history: props.history,
    label: "",
    items: menuItems
  };

  return (
    <div className={_c(`leaderboard-list ${loading ? "loading" : ""}`)}>
      <div className="list-header">
        <div className="list-filter">
          {_t("leaderboard.title-curators")}{" "}
          {loading ? "" : <DropDown {...dropDownConfig} float="left" />}
        </div>
        <div className="list-title">{_t(`leaderboard.title-${period}`)}</div>
      </div>
      {loading && <LinearProgress />}
      {data.length > 0 && (
        <div className="list-body">
          <div className="list-body-header">
            <span />
            <Tooltip content={_t("leaderboard.header-votes-tip")}>
              <div className="d-flex align-items-center">
                <span className="info-icon mr-1">{informationVariantSvg}</span>
                <span className="score">{_t("leaderboard.header-votes")}</span>
              </div>
            </Tooltip>
            <span className="points">{_t("leaderboard.header-reward")}</span>
          </div>

          {data.map((r, i) => {
            return (
              <div className="list-item" key={i}>
                <div className="index">{i + 1}</div>
                <div className="avatar">
                  <ProfileLink {...props} username={r.account}>
                    <span>
                      <UserAvatar username={r.account} size="medium" />
                    </span>
                  </ProfileLink>
                </div>
                <div className="username">
                  <ProfileLink {...props} username={r.account}>
                    <span>{r.account}</span>
                  </ProfileLink>
                </div>
                <div className="score">{r.votes}</div>
                <div className="points">
                  {formattedNumber(vestsToHp(r.vests, hivePerMVests), { suffix: "HP" })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default (p: Props) => {
  const props: Props = {
    global: p.global,
    history: p.history,
    dynamicProps: p.dynamicProps,
    addAccount: p.addAccount
  };

  return <Curation {...props} />;
};
