"use client";
import React, { Fragment, useMemo, useState } from "react";
import numeral from "numeral";
import defaults from "@/defaults.json";
import { setProxyBase } from "@ecency/render-helper";
import "./_page.scss";
import { Feedback, LinearProgress, Navbar, ScrollToTop, SearchBox, Theme } from "@/features/shared";
import { Tsx } from "@/features/i18n/helper";
import i18next from "i18next";
import Head from "next/head";
import { ProposalListItem } from "@/app/proposals/_components";
import { getAccountFullQuery, getProposalsQuery } from "@/api/queries";
import { parseAsset } from "@/utils";
import { Proposal } from "@/entities";

setProxyBase(defaults.imageServer);

enum Filter {
  ALL = "all",
  ACTIVE = "active",
  INACTIVE = "inactive",
  TEAM = "team"
}

export default function ProposalsPage() {
  const { data: proposals, isLoading } = getProposalsQuery().useClientQuery();
  const { data: fund } = getAccountFullQuery("hive.fund").useClientQuery();

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState(Filter.ALL);

  const filteredProposals = useMemo(
    () =>
      proposals
        ?.filter((item) => {
          switch (filter) {
            case Filter.ALL:
              return true;
            case Filter.ACTIVE:
              return item.status == "active";
            case Filter.INACTIVE:
              return item.status == "inactive";
            case Filter.TEAM:
              return (
                ["ecency", "good-karma", "hivesearcher", "hivesigner", "hivexplorer"].includes(
                  item.creator
                ) &&
                (item.status === "active" || new Date(item.start_date) > new Date())
              );
            default:
              return true;
          }
        })
        ?.filter(
          (item) =>
            item.subject.toLowerCase().search(search.toLowerCase().trim()) > -1 ||
            item.creator.toLowerCase().search(search.toLowerCase().trim()) > -1
        ),
    [filter, proposals, search]
  );
  const totalBudget = useMemo(
    () => parseAsset(fund?.hbd_balance ?? "0").amount,
    [fund?.hbd_balance]
  );
  const dailyBudget = useMemo(() => totalBudget / 100, [totalBudget]);
  const { dailyFunded, thresholdProposalId } = useMemo(() => {
    const teligible = proposals?.filter(
      (proposal) => proposal.status !== "expired" && proposal.status !== "inactive"
    );
    const eligible: Proposal[] = [];
    for (const eKey in teligible) {
      if (teligible[eKey as any].id != 0) {
        eligible[eKey as any] = teligible[eKey as any];
      } else {
        break;
      }
    }
    //  add up total votes
    let thresholdProposalId: number | null = null;
    const dailyFunded = eligible.reduce((a, b) => {
      const dp = parseAsset(b.daily_pay);
      const _sum_amount = a + Number(dp.amount);
      if (_sum_amount >= dailyBudget && !thresholdProposalId) {
        thresholdProposalId = b.id;
      }
      return _sum_amount <= dailyBudget ? _sum_amount : a;
    }, 0);
    return {
      dailyFunded,
      thresholdProposalId
    };
  }, [dailyBudget, proposals]);
  const minVotes = useMemo(
    () => Number(proposals?.find((x) => x.id === 0)?.total_votes ?? 0),
    [proposals]
  );

  return (
    <>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />
      <Head>
        <title>{i18next.t("proposals.page-title")}</title>
        <meta name="description" content={i18next.t("proposals.page-description")} />
      </Head>

      <div className="app-content proposals-page">
        <div className="page-header mt-5">
          <h1 className="header-title">{i18next.t("proposals.page-title")}</h1>
          <Tsx k="proposals.page-description">
            <div className="header-description" />
          </Tsx>
          <div className="funding-numbers">
            <div className="funding-number">
              <div className="value">
                {numeral(dailyFunded).format("0.00,")} {"HBD"}
              </div>
              <div className="label">{i18next.t("daily-funded")}</div>
            </div>
            <div className="funding-number">
              <div className="value">
                {numeral(dailyBudget).format("0.00,")} {"HBD"}
              </div>
              <div className="label">{i18next.t("daily-budget")}</div>
            </div>

            <div className="funding-number">
              <div className="value">
                {numeral(totalBudget).format("0.00,")} {"HBD"}
              </div>
              <div className="label">{i18next.t("total-budget")}</div>
            </div>
          </div>

          <div className="search-proposals">
            <SearchBox
              placeholder={i18next.t("search.placeholder-proposals")}
              onChange={(e: any) => setSearch(e.target.value)}
              value={search}
            />
          </div>

          <div className="filter-menu">
            {Object.values(Filter).map((x) => {
              const cls = `menu-item ${filter === x ? "active-item" : ""}`;
              return (
                <a
                  key={x}
                  href="#"
                  className={cls}
                  onClick={(e) => {
                    e.preventDefault();
                    setFilter(x);
                  }}
                >
                  {i18next.t(`proposals.filter-${x}`)}
                </a>
              );
            })}
          </div>
        </div>
        {isLoading && <LinearProgress />}
        {(filteredProposals?.length ?? 0) > 0 && (
          <div className="proposal-list">
            {filteredProposals?.map((p) => (
              <ProposalListItem key={p.id} proposal={p} thresholdProposalId={thresholdProposalId} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
