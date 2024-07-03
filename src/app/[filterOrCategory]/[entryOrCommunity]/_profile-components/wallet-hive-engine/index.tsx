"use client";
import React, { useState } from "react";
import { proxifyImageSrc } from "@ecency/render-helper";
import "./_index.scss";

import {
  claimRewards,
  getHiveEngineTokenBalances,
  getMetrics,
  getUnclaimedRewards
} from "@/api/hive-engine";

import {
  delegateOutlineSvg,
  informationVariantSvg,
  lockOutlineSvg,
  plusCircle,
  priceDownSvg,
  priceUpSvg,
  transferOutlineSvg,
  undelegateOutlineSvg,
  unlockOutlineSvg
} from "@/assets/img/svg";
import { Popover, PopoverContent } from "@ui/popover";
import {
  error,
  LinearProgress,
  success,
  Transfer,
  TransferAsset,
  TransferMode
} from "@/features/shared";
import { WalletMenu } from "../wallet-menu";
import { Tooltip } from "@/features/ui";
import i18next from "i18next";
import { formattedNumber, HiveEngineToken } from "@/utils";
import { HiveEngineChart } from "./hive-engine-chart";
import { SortEngineTokens } from "./sort-hive-engine-tokens";
import { EngineTokensEstimated } from "./engine-tokens-estimated";
import { Account, TokenStatus } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { getDynamicPropsQuery } from "@/api/queries";
import { formatError } from "@/api/operations";
import useMount from "react-use/lib/useMount";
import Image from "next/image";

interface Props {
  account: Account;
}

export function WalletHiveEngine({ account }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);
  const isMobile = useGlobalStore((s) => s.isMobile);

  const [tokens, setTokens] = useState<HiveEngineToken[]>([]);
  const [utokens, setUtokens] = useState<HiveEngineToken[]>([]);
  const [rewards, setRewards] = useState<TokenStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [transfer, setTransfer] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>();
  const [transferAsset, setTransferAsset] = useState<TransferAsset>();
  const [assetBalance, setAssetBalance] = useState(0);
  const [allTokens, setAllTokens] = useState<any>();

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  useMount(() => {
    fetch();
    fetchUnclaimedRewards();
    priceChangePercent();
  });

  const sortByDelegationIn = () => {
    const byDelegationsIn = tokens.sort((a: any, b: any) => {
      if (b.delegationsIn < a.delegationsIn) return -1;
      if (b.delegationsIn > a.delegationsIn) return 1;
      return 0;
    });

    setTokens(byDelegationsIn);
  };
  const sortTokensInAscending: any = () => {
    const inAscending = tokens.sort((a: any, b: any) => {
      if (a.symbol > b.symbol) return 1;
      if (a.symbol < b.symbol) return -1;
      return 0;
    });

    setTokens(inAscending);
  };
  const sortTokensInDescending: any = () => {
    const inDescending = tokens.sort((a: any, b: any) => {
      if (b.symbol < a.symbol) return -1;
      if (b.symbol > a.symbol) return 1;
      return 0;
    });

    setTokens(inDescending);
  };
  const sortTokensbyValue = async () => {
    const allUserTokens = await tokenUsdValue();
    const tokensInWallet = allUserTokens.filter(
      (a: any) => a.balance !== 0 || a.stakedBalance !== 0
    );
    const byValue = tokensInWallet.sort((a: any, b: any) => {
      if (b.usd_value < a.usd_value) return -1;
      if (b.usd_value > a.usd_value) return 1;
      return 0;
    });
    setTokens(byValue);
  };
  const sortTokensbyBalance = () => {
    const byBalance = tokens.sort((a: any, b: any) => {
      if (b.balance < a.balance) return -1;
      if (b.balance > a.balance) return 1;
      return 0;
    });

    setTokens(byBalance);
  };
  const sortTokensbyStake = () => {
    const byStake = tokens.sort((a: any, b: any) => {
      if (b.stake < a.stake) return -1;
      if (b.stake > a.stake) return 1;
      return 0;
    });

    setTokens(byStake);
  };
  const sortByDelegationOut = () => {
    const byDelegationsOut = tokens.sort((a: any, b: any) => {
      if (b.delegationsOut < a.delegationsOut) return -1;
      if (b.delegationsOut > a.delegationsOut) return 1;
      return 0;
    });

    setTokens(byDelegationsOut);
  };
  const tokenUsdValue = async () => {
    const userTokens: any = await getHiveEngineTokenBalances(account.name);
    const pricePerHive = dynamicProps!.base / dynamicProps!.quote;

    let balanceMetrics: any = userTokens.map((item: any) => {
      let eachMetric = allTokens.find((m: any) => m.symbol === item.symbol);
      return {
        ...item,
        ...eachMetric
      };
    });
    return balanceMetrics.map((w: any) => {
      const usd_value =
        w.symbol === "SWAP.HIVE"
          ? Number(pricePerHive * w.balance)
          : w.lastPrice === 0
            ? 0
            : Number(w.lastPrice * pricePerHive * w.balance).toFixed(10);
      return {
        ...w,
        usd_value
      };
    });
  };
  const priceChangePercent = async () => {
    const allMarketTokens = await getMetrics();
    setAllTokens(allMarketTokens);
  };
  const openTransferDialog = (mode: TransferMode, asset: string, balance: number) => {
    setTransfer(true);
    setTransferMode(mode);
    setTransferAsset(asset as TransferAsset);
    setAssetBalance(balance);
  };
  const closeTransferDialog = () => {
    setTransfer(false);
    setTransferMode(undefined);
    setTransferAsset(undefined);
  };
  const claimRewardsAct = (tokens: TokenStatus[]) => {
    if (claiming || !activeUser) {
      return;
    }

    setClaiming(true);

    return claimRewards(
      activeUser.username,
      tokens.map((t) => t.symbol)
    )
      .then((account) => {
        success(i18next.t("wallet.claim-reward-balance-ok"));
      })
      .then(() => setRewards([]))
      .catch((err) => error(...formatError(err)))
      .finally(() => setClaiming(false));
  };
  const fetch = async () => {
    setLoading(true);
    let items;
    try {
      items = await getHiveEngineTokenBalances(account.name);
      setUtokens(items);
      items = items.filter((token) => token.balance !== 0 || token.stakedBalance !== 0);
      items = sort(items);
      setTokens(items);
    } catch (e) {
      console.log("engine tokens", e);
    } finally {
      setLoading(false);
    }
  };
  const fetchUnclaimedRewards = async () => {
    try {
      const rewards = await getUnclaimedRewards(account.name);
      setRewards(rewards);
    } catch (e) {
      console.log("fetchUnclaimedRewards", e);
    }
  };
  const sort = (items: HiveEngineToken[]) =>
    items.sort((a: HiveEngineToken, b: HiveEngineToken) => {
      if (a.balance !== b.balance) {
        return a.balance < b.balance ? 1 : -1;
      }

      if (a.stake !== b.stake) {
        return a.stake < b.stake ? 1 : -1;
      }

      return a.symbol > b.symbol ? 1 : -1;
    });

  const hasUnclaimedRewards = rewards.length > 0;
  const hasMultipleUnclaimedRewards = rewards.length > 1;
  const isMyPage = activeUser && activeUser.username === account.name;
  let rewardsToShowInTooltip = [...rewards];
  rewardsToShowInTooltip = rewardsToShowInTooltip.splice(0, 10);

  return (
    <div className="wallet-hive-engine">
      <div className="wallet-main">
        <div className="wallet-info">
          {hasUnclaimedRewards && (
            <div className="unclaimed-rewards">
              <div className="title">{i18next.t("wallet.unclaimed-rewards")}</div>

              {hasMultipleUnclaimedRewards ? (
                <div className="rewards">
                  <span className="reward-type">
                    <Popover>
                      <PopoverContent>
                        <div className="tooltip-inner rewards-container">
                          {rewardsToShowInTooltip.map((reward, ind) => (
                            <div
                              className="flex py-1 border-b border-[--border-color]"
                              key={reward.pending_token + ind}
                            >
                              <div className="mr-1 lowercase">{reward.symbol}:</div>
                              <div>{reward.pending_token / Math.pow(10, reward.precision)}</div>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    <div className="flex items-center">{`${rewards.length} tokens`}</div>
                  </span>
                  {isMyPage && (
                    <a
                      className={`claim-btn ${claiming ? "in-progress" : ""}`}
                      onClick={() => claimRewardsAct(rewards)}
                    >
                      {plusCircle}
                    </a>
                  )}
                </div>
              ) : (
                rewards.map((r, i) => {
                  const reward = r.pending_token / Math.pow(10, r.precision);

                  return (
                    <div className="rewards" key={i}>
                      <span className="reward-type">
                        {reward < 0.0001
                          ? `${reward} ${r.symbol}`
                          : formattedNumber(reward, {
                              fractionDigits: r.precision,
                              suffix: r.symbol
                            })}
                      </span>
                      {isMyPage && (
                        <a
                          className={`claim-btn ${claiming ? "in-progress" : ""}`}
                          onClick={() => claimRewardsAct([r])}
                        >
                          {plusCircle}
                        </a>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          <div className="balance-row alternative">
            <div className="balance-info">
              <div className="title">{i18next.t("wallet-engine.title")}</div>
              <div className="description">{i18next.t("wallet-engine.description")}</div>
            </div>
          </div>

          <EngineTokensEstimated tokens={utokens} />

          {tokens.length >= 3 && (
            <div className="wallet-info">
              <SortEngineTokens
                sortTokensInAscending={sortTokensInAscending}
                sortTokensInDescending={sortTokensInDescending}
                sortTokensbyValue={sortTokensbyValue}
                sortTokensbyStake={sortTokensbyStake}
                sortTokensbyBalance={sortTokensbyBalance}
                sortByDelegationIn={sortByDelegationIn}
                sortByDelegationOut={sortByDelegationOut}
              />
            </div>
          )}

          <div className="entry-list">
            {loading ? (
              <div className="dialog-placeholder">
                <LinearProgress />
              </div>
            ) : tokens.length === 0 ? (
              <div className="no-results">{i18next.t("wallet-engine.no-results")}</div>
            ) : (
              <div className="entry-list-body">
                {tokens.map((b, i) => {
                  const imageSrc = proxifyImageSrc(b.icon, 0, 0, canUseWebp ? "webp" : "match");
                  return (
                    <div className="entry-list-item" key={i}>
                      <div className="entry-header">
                        <Image
                          width={1000}
                          height={1000}
                          alt={b.symbol}
                          src={imageSrc ?? "/public/assets/noimage.svg"}
                          className="item-image"
                        />
                        {b.symbol}
                      </div>

                      {!isMobile && (
                        <div className="flex">
                          <HiveEngineChart items={b} />
                        </div>
                      )}

                      <div className="ml-auto flex flex-col justify-between">
                        <div className="flex mb-1 align-self-end">
                          <div className="entry-body mr-md-2">
                            <span className="item-balance">{b.balanced()}</span>
                          </div>

                          <div className="ml-1">
                            <Popover anchorParent={true}>
                              <div className="tooltip-inner">
                                <div className="profile-info-tooltip-content">
                                  <p>
                                    {i18next.t("wallet-engine.token")}: {b.name}
                                  </p>
                                  <p>
                                    {i18next.t("wallet-engine.balance")}: {b.balanced()}
                                  </p>
                                  <p>
                                    {i18next.t("wallet-engine.staked")}: {b.staked()}
                                  </p>
                                  {b.delegationEnabled && (
                                    <>
                                      <p>In: {b.delegationsIn}</p>
                                      <p>Out: {b.delegationsOut}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Popover>
                            <div className="flex items-center">
                              <span className="info-icon mr-0 mr-md-2">
                                {informationVariantSvg}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="mr-3">
                          {allTokens?.map((x: any, i: any) => {
                            const changeValue = parseFloat(x?.priceChangePercent);
                            return (
                              <span
                                key={i}
                                className={`flex justify-end ${
                                  changeValue < 0 ? "text-red" : "text-green"
                                }`}
                              >
                                {x?.symbol === b.symbol && (
                                  <span className="mr-1">
                                    {changeValue < 0 ? priceDownSvg : priceUpSvg}
                                  </span>
                                )}
                                {x?.symbol === b.symbol ? x?.priceChangePercent : null}
                              </span>
                            );
                          })}
                        </div>

                        {isMyPage && (
                          <div className="flex justify-between ml-auto">
                            <div className="mr-1">
                              <Tooltip content="Transfer">
                                <div className="flex items-center flex-justify-center">
                                  <span
                                    onClick={() =>
                                      openTransferDialog("transfer", b.symbol, b.balance)
                                    }
                                    className="he-icon mr-0 mr-md-2"
                                  >
                                    {transferOutlineSvg}
                                  </span>
                                </div>
                              </Tooltip>
                            </div>

                            {b.delegationEnabled && b.delegationsOut !== b.balance && (
                              <div className="mr-1">
                                <Tooltip content="Delegate">
                                  <div className="flex items-center flex-justify-center">
                                    <span
                                      onClick={() =>
                                        openTransferDialog(
                                          "delegate",
                                          b.symbol,
                                          b.balance - b.delegationsOut
                                        )
                                      }
                                      className="he-icon mr-0 mr-md-2"
                                    >
                                      {delegateOutlineSvg}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                            )}
                            {b.delegationEnabled && b.delegationsOut > 0 && (
                              <div className="mr-1">
                                <Tooltip content="Undelegate">
                                  <div className="flex items-center flex-justify-center">
                                    <span
                                      onClick={() =>
                                        openTransferDialog("undelegate", b.symbol, b.delegationsOut)
                                      }
                                      className="he-icon mr-0 mr-md-2"
                                    >
                                      {undelegateOutlineSvg}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                            )}

                            {b.stakingEnabled && (
                              <div className="mr-1">
                                <Tooltip content="Stake">
                                  <div className="flex items-center flex-justify-center items-center">
                                    <span
                                      onClick={() =>
                                        openTransferDialog("stake", b.symbol, b.balance)
                                      }
                                      className="he-icon mr-0 mr-md-2"
                                    >
                                      {lockOutlineSvg}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                            )}
                            {b.stake > 0 && (
                              <div className="mr-1">
                                <Tooltip content="Unstake">
                                  <div className="flex items-center flex-justify-center items-center">
                                    <span
                                      onClick={() =>
                                        openTransferDialog("unstake", b.symbol, b.stakedBalance)
                                      }
                                      className="he-icon mr-0 mr-md-2"
                                    >
                                      {unlockOutlineSvg}
                                    </span>
                                  </div>
                                </Tooltip>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        <WalletMenu username={account.name} active="engine" />
      </div>
      {transfer && (
        <Transfer
          to={isMyPage ? undefined : account.name}
          mode={transferMode!}
          asset={transferAsset!}
          onHide={closeTransferDialog}
        />
      )}
    </div>
  );
}
