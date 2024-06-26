import React, { useMemo } from "react";
import moment from "moment";
import { RCAccount } from "@hiveio/dhive/lib/chain/rc";
import "./_index.scss";
import { Account, FullAccount } from "@/entities";
import { getDynamicPropsQuery, getRcAccountsQuery } from "@/api/queries";
import { downVotingPower, powerRechargeTime, rcPower, votingPower, votingValue } from "@/api/hive";
import { formattedNumber } from "@/utils";
import i18next from "i18next";
import { hiveSvg, informationVariantSvg } from "@ui/svg";
import { StyledTooltip } from "@ui/tooltip";

interface ContentProps {
  account: FullAccount;
  rcAccount: RCAccount;
}

function ProfileInfoContent({ account, rcAccount }: ContentProps) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  // Voting power
  const vPower = votingPower(account);
  const vPowerFixed = vPower.toFixed(2);
  const vPowerRecharge = powerRechargeTime(vPower);
  const vPowerRechargeDate = moment().add(vPowerRecharge, "seconds");

  // Voting value
  const vValue = votingValue(account, dynamicProps!, vPower * 100).toFixed(3);
  const vValueFull = votingValue(account, dynamicProps!, 10000).toFixed(3);

  // Join date
  const created = moment.utc(account.created).format("LL");

  // Last active
  const lastVoteDate = moment.utc(account.last_vote_time);
  const lastPostDate = moment.utc(account.last_post);
  const createdDate = moment.utc(account.created);
  const lastActive = moment.max(lastVoteDate, lastPostDate, createdDate);

  // Down vote power
  const dvPower = downVotingPower(account);

  // Resource credits
  const rcp = rcPower(rcAccount);
  const rcpFixed = rcp.toFixed(2);
  const rcpRecharge = powerRechargeTime(rcp);
  const rcpRechargeDate = moment().add(rcpRecharge, "seconds");

  return (
    <div className="profile-info-tooltip-content [&>p]:mb-0 text-sm">
      <p>{i18next.t("profile-info.joined", { n: created })}</p>
      <p>
        {i18next.t("profile-info.post-count", {
          n: formattedNumber(account.post_count!, { fractionDigits: 0 })
        })}
      </p>
      <p>{i18next.t("profile-info.last-active", { n: lastActive.fromNow() })}</p>
      <p>
        {i18next.t("profile-info.vote-value", { n: vValue })}
        {hiveSvg}
        {vValue !== vValueFull && (
          <small>{i18next.t("profile-info.vote-value-max", { n: vValueFull })}</small>
        )}
      </p>
      <p>
        {i18next.t("profile-info.vote-power", { n: vPowerFixed })}
        {vPowerFixed !== "100.00" && (
          <small>
            {i18next.t("profile-info.recharge-time", { n: vPowerRechargeDate.fromNow() })}
          </small>
        )}
      </p>
      <p>{i18next.t("profile-info.down-vote-power", { n: dvPower.toFixed(2) })}</p>
      <p>
        {i18next.t("profile-info.rc-power", { n: rcpFixed })}
        {rcpFixed !== "100.00" && (
          <small>{i18next.t("profile-info.recharge-time", { n: rcpRechargeDate.fromNow() })}</small>
        )}
      </p>
    </div>
  );
}

interface Props {
  account: Account;
}

export function ProfileInfo({ account }: Props) {
  const { data } = getRcAccountsQuery(account.name).useClientQuery();
  const rcAccount = useMemo(() => data?.[0], []);

  if (account?.__loaded && rcAccount) {
    return (
      <span className="profile-info">
        <StyledTooltip content={<ProfileInfoContent account={account} rcAccount={rcAccount} />}>
          {informationVariantSvg}
        </StyledTooltip>
      </span>
    );
  }

  return <></>;
}
