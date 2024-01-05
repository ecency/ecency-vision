import React, { Fragment } from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { match } from "react-router";
import numeral from "numeral";
import _ from "lodash";

import defaults from "../constants/defaults.json";

import { catchPostImage, renderPostBody, setProxyBase } from "@ecency/render-helper";
import { Entry } from "../store/entries/types";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import Feedback from "../components/feedback";
import NavBar from "../components/navbar";
import LinearProgress from "../components/linear-progress";
import ProposalListItem from "../components/proposal-list-item";
import NotFound from "../components/404";
import SearchBox from "../components/search-box";

import { _t } from "../i18n";
import { Tsx } from "../i18n/helper";

import { getAccount, getPost, getProposals, Proposal } from "../api/hive";

import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";

import parseAsset from "../helper/parse-asset";
import parseDate from "../helper/parse-date";

import { closeSvg } from "../img/svg";
import "./proposals.scss";

setProxyBase(defaults.imageServer);

enum Filter {
  ALL = "all",
  ACTIVE = "active",
  INACTIVE = "inactive",
  TEAM = "team"
}

interface State {
  proposals_: Proposal[];
  proposals: Proposal[];
  allProposals: Proposal[];
  totalBudget: number;
  dailyBudget: number;
  dailyFunded: number;
  filter: Filter;
  loading: boolean;
  inProgress: boolean;
  search: string;
  minVotes: number;
  isReturnProposalId: any;
  thresholdProposalId: any;
}

class ProposalsPage extends BaseComponent<PageProps, State> {
  state: State = {
    proposals_: [],
    proposals: [],
    allProposals: [],
    totalBudget: 0,
    dailyBudget: 0,
    dailyFunded: 0,
    filter: Filter.ALL,
    loading: true,
    inProgress: false,
    search: "",
    minVotes: 0,
    isReturnProposalId: 0,
    thresholdProposalId: null
  };

  constructor(props: any) {
    super(props);
    this.handleInputChange = _.debounce(this.handleInputChange.bind(this), 200);
    this.handleChangeSearch = this.handleChangeSearch.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  load = async () => {
    this.stateSet({ loading: true });

    try {
      let proposals = await getProposals();
      // put expired proposals in the end of the list
      const expired = proposals.filter((x) => x.status === "expired");
      const others = proposals.filter((x) => x.status !== "expired");
      proposals = [...others, ...expired];

      // get return proposal's total votes
      const minVotes = Number(proposals.find((x) => x.id === 0)?.total_votes || 0);
      // // find eligible proposals and
      // const eligible = proposals.filter(x => this.eligibleFilter(x, minVotes));
      // //  add up total votes
      // const dailyFunded = eligible.reduce((a, b) => a + Number(b.daily_pay.amount), 0) / 1000;

      this.stateSet({ proposals, proposals_: proposals, allProposals: proposals, minVotes });

      const fund = await getAccount("hive.fund");
      const totalBudget = parseAsset(fund.hbd_balance).amount;
      const dailyBudget = totalBudget / 100;

      // find eligible proposals and
      // const eligible = proposals.filter(x => this.eligibleFilter(x, minVotes));
      const teligible = proposals.filter(
        (proposal) => proposal.status !== "expired" && proposal.status !== "inactive"
      );
      const eligible: Proposal[] = [];
      for (const eKey in teligible) {
        if (teligible[eKey].id != 0) {
          eligible[eKey] = teligible[eKey];
        } else {
          break;
        }
      }
      //  add up total votes
      let _thresholdProposalId: number | null = null;
      const dailyFunded = eligible.reduce((a, b) => {
        const _sum_amount = a + Number(b.daily_pay.amount) / Math.pow(10, b.daily_pay.precision);
        if (_sum_amount >= dailyBudget && !_thresholdProposalId) {
          _thresholdProposalId = b.id;
        }
        return _sum_amount <= dailyBudget ? _sum_amount : a;
      }, 0);
      this.stateSet({
        totalBudget,
        dailyBudget,
        dailyFunded,
        thresholdProposalId: _thresholdProposalId
      });
    } catch (e) {
      throw e;
    } finally {
      const params = new URLSearchParams(location.search);
      const filterParams = params.get("filter");
      if (!!filterParams) {
        this.stateSet({ filter: filterParams as Filter });
        this.applyFilter(filterParams as Filter);
      }
      this.stateSet({ loading: false });
    }
  };

  eligibleFilter = (proposal: Proposal, minVotes: number) => {
    return (
      proposal.id > 0 && Number(proposal.total_votes) >= minVotes && proposal.status !== "expired"
    );
  };

  applyFilter = (filter: Filter) => {
    const { proposals_ } = this.state;
    let proposals: Proposal[] = [];

    switch (filter) {
      case Filter.ALL:
        proposals = [...proposals_];
        break;
      case Filter.ACTIVE:
        proposals = proposals_.filter((x) => x.status == "active");
        break;
      case Filter.INACTIVE:
        proposals = proposals_.filter((x) => x.status == "inactive");
        break;
      case Filter.TEAM:
        proposals = [
          ...proposals_.filter(
            (x) =>
              ["ecency", "good-karma", "hivesearcher", "hivesigner", "hivexplorer"].includes(
                x.creator
              ) &&
              (x.status === "active" || new Date(x.start_date) > new Date())
          )
        ];
        break;
    }

    this.stateSet({ proposals, filter, inProgress: true });

    setTimeout(() => {
      this.stateSet({ inProgress: false });
    }, 500);
  };

  handleChangeSearch = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    this.setState({ search: value });
    this.handleInputChange(value);
  };

  handleInputChange = (value: any) => {
    if (value.trim() === "") {
      this.setState({ proposals: this.state.allProposals });
    } else {
      let results: Proposal[] = [];
      this.state.allProposals.forEach((item: Proposal) => {
        if (
          item.subject.toLowerCase().search(value.toLowerCase().trim()) > -1 ||
          item.creator.toLowerCase().search(value.toLowerCase().trim()) > -1
        ) {
          results.push(item);
        }
      });
      this.setState({ proposals: results });
    }
  };

  render() {
    //  Meta config
    const metaProps = {
      title: _t("proposals.page-title"),
      description: _t("proposals.page-description")
    };

    const { global } = this.props;
    const {
      loading,
      proposals,
      totalBudget,
      dailyBudget,
      dailyFunded,
      filter,
      inProgress,
      minVotes,
      isReturnProposalId,
      thresholdProposalId
    } = this.state;

    if (loading) {
      return (
        <>
          <NavBar history={this.props.history} />
          <LinearProgress />
        </>
      );
    }

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        <NavBar history={this.props.history} />

        <div className="app-content proposals-page">
          <div className="page-header mt-5">
            <h1 className="header-title">{_t("proposals.page-title")}</h1>
            <Tsx k="proposals.page-description">
              <div className="header-description" />
            </Tsx>
            <div className="funding-numbers">
              <div className="funding-number">
                <div className="value">
                  {numeral(dailyFunded).format("0.00,")} {"HBD"}
                </div>
                <div className="label">{_t("daily-funded")}</div>
              </div>
              <div className="funding-number">
                <div className="value">
                  {numeral(dailyBudget).format("0.00,")} {"HBD"}
                </div>
                <div className="label">{_t("daily-budget")}</div>
              </div>

              <div className="funding-number">
                <div className="value">
                  {numeral(totalBudget).format("0.00,")} {"HBD"}
                </div>
                <div className="label">{_t("total-budget")}</div>
              </div>
            </div>

            <div className="search-proposals">
              <SearchBox
                placeholder={_t("search.placeholder-proposals")}
                onChange={this.handleChangeSearch}
                value={this.state.search}
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
                      this.applyFilter(x);
                    }}
                  >
                    {_t(`proposals.filter-${x}`)}
                  </a>
                );
              })}
            </div>
          </div>

          {(() => {
            if (inProgress) {
              return <LinearProgress />;
            }

            return (
              <>
                <div className="proposal-list">
                  {proposals.map((p) => (
                    <Fragment key={p.id}>
                      {ProposalListItem({
                        ...this.props,
                        proposal: p,
                        isReturnProposalId,
                        thresholdProposalId
                      })}
                    </Fragment>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      </>
    );
  }
}

export const ProposalsIndexContainer = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(ProposalsPage);

interface MatchParams {
  id: string;
}

interface DetailProps extends PageProps {
  match: match<MatchParams>;
}

interface DetailState {
  loading: boolean;
  proposal: Proposal | null;
  entry: Entry | null;
}

class ProposalDetailPage extends BaseComponent<DetailProps, DetailState> {
  state: DetailState = {
    loading: true,
    proposal: null,
    entry: null
  };

  componentDidMount() {
    this.load();
  }

  load = () => {
    const { match } = this.props;
    const proposalId = Number(match.params.id);

    this.stateSet({ loading: true });
    getProposals()
      .then((proposals) => {
        const proposal = proposals.find((x) => x.id === proposalId);
        if (proposal) {
          this.stateSet({ proposal });
          return getPost(proposal.creator, proposal.permlink);
        }

        return null;
      })
      .then((entry) => {
        if (entry) {
          this.stateSet({ entry });
        }
      })
      .finally(() => {
        this.stateSet({ loading: false });
      });
  };

  render() {
    const { global } = this.props;
    const { loading, proposal, entry } = this.state;

    if (loading) {
      return (
        <>
          <NavBar history={this.props.history} />
          <LinearProgress />
        </>
      );
    }

    if (!proposal || !entry) {
      return NotFound({ ...this.props });
    }

    const renderedBody = { __html: renderPostBody(entry.body, false, global.canUseWebp) };

    //  Meta config
    const metaProps = {
      title: `${_t("proposals.page-title")} | ${proposal.subject}`,
      description: `${proposal.subject} by @${proposal.creator}`,
      url: `/proposals/${proposal.id}`,
      canonical: `/proposals/${proposal.id}`,
      published: parseDate(entry.created).toISOString(),
      modified: parseDate(entry.updated).toISOString(),
      image: catchPostImage(entry.body, 600, 500, global.canUseWebp ? "webp" : "match")
    };

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        <NavBar history={this.props.history} />
        <div className="app-content proposals-page proposals-detail-page">
          <div className="page-header mt-5">
            <h1 className="header-title">{_t("proposals.page-title")}</h1>
            <p className="see-all">
              <Link to="/proposals">{_t("proposals.see-all")}</Link>
            </p>
          </div>
          <div className="proposal-list">
            <Link to="/proposals" className="btn-dismiss">
              {closeSvg}
            </Link>
            {ProposalListItem({
              ...this.props,
              proposal
            })}
          </div>
          <div className="the-entry">
            <div
              className="entry-body markdown-view user-selectable"
              dangerouslySetInnerHTML={renderedBody}
            />
          </div>
        </div>
      </>
    );
  }
}

export const ProposalDetailContainer = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(ProposalDetailPage);
