import React, { Component } from "react";

import { Modal, Form, FormControl } from "react-bootstrap";

import numeral from "numeral";

import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { DynamicProps } from "../../store/dynamic-props/types";

import BaseComponent from "../base";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import LinearProgress from "../linear-progress";
import Pagination from "../pagination";

import { Proposal, getProposalVotes, getAccounts } from "../../api/hive";

import parseAsset from "../../helper/parse-asset";
import accountReputation from "../../helper/account-reputation";

import { _t } from "../../i18n";
import "./_index.scss";

interface Voter {
  name: string;
  reputation: string | number;
  hp: number;
  proxyHp: number;
  totalHp: number;
}

type SortOption = "reputation" | "hp";

interface Props {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  proposal: Proposal;
  searchText: string;
  addAccount: (data: Account) => void;
  onHide: () => void;
  getVotesCount: (votes: number) => void;
  checkIsMoreData: (check: boolean) => void;
}

interface State {
  page: number;
  loading: boolean;
  voters: Voter[];
  originalVoters: Voter[];
  sort: SortOption;
  pageCount: number;
  voter: string;
  lastDataLength: number;
  limit: number;
}

export class ProposalVotesDetail extends BaseComponent<Props, State> {
  state: State = {
    page: 1,
    loading: false,
    voters: [],
    originalVoters: [],
    sort: "hp",
    pageCount: 0,
    voter: "",
    lastDataLength: 0,
    limit: 1000
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    const { voters } = this.state;
    if (prevProps.searchText !== this.props.searchText) {
      this.search();
    }
    if (prevState.voters !== voters) {
      this.setState({ pageCount: Math.ceil(voters.length / 12) });
    }
  }

  search = () => {
    const { originalVoters } = this.state;
    const { getVotesCount } = this.props;
    getVotesCount(originalVoters.length);
    if (this.props.searchText) {
      this.setState(
        {
          voters: this.state.originalVoters.filter((item) =>
            item.name.toLocaleLowerCase().includes(this.props.searchText.toLocaleLowerCase())
          ),
          page: 1
        },
        this.searchCallback
      );
    } else {
      this.setState({ voters: originalVoters, loading: false });
    }
  };

  searchCallback = () => {
    const { voters, lastDataLength, limit } = this.state;
    if (!voters.length && lastDataLength === limit) {
      this.load();
    }
  };

  sortChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.stateSet({ sort: e.target.value as SortOption });
  };

  load = () => {
    this.setState({ loading: true });
    const { proposal, dynamicProps, checkIsMoreData } = this.props;
    const { hivePerMVests } = dynamicProps;
    const { voter, limit } = this.state;
    getProposalVotes(proposal.id, voter, limit)
      .then((votes) => {
        this.setState({ voter: votes[votes.length - 1].voter, lastDataLength: votes.length });
        const usernames = [...new Set(votes.map((x) => x.voter))]; // duplicate records come in some way.

        return getAccounts(usernames);
      })
      .then((resp) => {
        if (resp.length < limit) {
          checkIsMoreData(false);
        }
        let voters: Voter[] = resp
          .map((account) => {
            const hp = (parseAsset(account.vesting_shares).amount * hivePerMVests) / 1e6;

            let vsfVotes = 0;
            account.proxied_vsf_votes.forEach((x: string | number) => (vsfVotes += Number(x)));

            const proxyHp = (vsfVotes * hivePerMVests) / 1e12;
            const totalHp = hp + proxyHp;

            return {
              name: account.name,
              reputation: account.reputation!,
              hp,
              proxyHp,
              totalHp
            };
          })
          .sort((a, b) => (b.totalHp > a.totalHp ? 1 : -1));
        let newOriginalVoter: Voter[] = this.state.originalVoters.concat(voters);
        const uniqueOriginalVoters = [
          ...new Map(newOriginalVoter.map((item) => [item["name"], item])).values()
        ];
        if (voter) {
          let preVoters: Voter[] = this.state.voters;
          voters = preVoters.concat(voters);
        }
        this.stateSet(
          {
            voters,
            originalVoters: uniqueOriginalVoters,
            loading: false
          },
          this.search
        );
      });
  };

  handlePageChange = () => {
    const { pageCount, page, lastDataLength, limit } = this.state;
    if (page === pageCount && lastDataLength === limit) {
      this.load();
    }
  };
  render() {
    const { loading, voters, page, sort, originalVoters } = this.state;
    if (loading && !voters.length && !originalVoters.length) {
      return <LinearProgress />;
    }
    const pageSize = 12;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = voters
      .sort((a, b) => {
        const keyA = a[sort]!;
        const keyB = b[sort]!;
        if (keyA > keyB) return -1;
        else if (keyA < keyB) return 1;
        else return 0;
      })
      .slice(start, end);

    return (
      <>
        {loading && <LinearProgress />}

        <div className="voters-list">
          <div className="list-body">
            {sliced && sliced.length > 0 ? (
              sliced.map((x) => {
                const strHp = numeral(x.hp).format("0.00,");
                const strProxyHp = numeral(x.proxyHp).format("0.00,");

                return (
                  <div className="list-item" key={x.name}>
                    <div className="item-main">
                      {ProfileLink({
                        ...this.props,
                        username: x.name,
                        children: <UserAvatar username={x.name} size="small" />
                      })}

                      <div className="item-info">
                        {ProfileLink({
                          ...this.props,
                          username: x.name,
                          children: <span className="item-name notranslate">{x.name}</span>
                        })}
                        <span className="item-reputation">{accountReputation(x.reputation)}</span>
                      </div>
                    </div>
                    <div className="item-extra">
                      <span>{`${strHp} HP`}</span>
                      {x.proxyHp > 0 && (
                        <>
                          {" + "}
                          <span>
                            {`${strProxyHp} HP`}
                            {" (proxy) "}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="user-info">
                {loading ? _t("proposals.searching") : _t("proposals.no-results")}
              </div>
            )}
          </div>
        </div>

        <div className="list-tools">
          <div className="pages">
            {voters.length > pageSize && (
              <Pagination
                dataLength={voters.length}
                pageSize={pageSize}
                maxItems={4}
                page={page}
                onPageChange={(page) => {
                  this.setState({ page }, () => {
                    this.handlePageChange();
                  });
                }}
              />
            )}
          </div>
          <div className="sorter">
            <span className="label">{_t("proposals.sort")}</span>
            <Form.Control as="select" onChange={this.sortChanged} value={sort}>
              <option value="reputation">{_t("proposals.sort-reputation")}</option>
              <option value="hp">{_t("proposals.sort-hp")}</option>
            </Form.Control>
          </div>
        </div>
      </>
    );
  }
}

interface ProposalVotesProps {
  history: History;
  global: Global;
  dynamicProps: DynamicProps;
  proposal: Proposal;
  addAccount: (data: Account) => void;
  onHide: () => void;
}

interface ProposalVotesState {
  searchText: string;
  voteCount: string;
  isMoreData: boolean;
}
export class ProposalVotes extends Component<ProposalVotesProps, ProposalVotesState> {
  state: ProposalVotesState = {
    searchText: "",
    voteCount: "",
    isMoreData: true
  };

  getVotesCount = (num: number) => {
    const voteCount = num.toString();
    this.setState({ voteCount: voteCount });
  };

  checkIsMoreData = (check: boolean) => {
    this.setState({ isMoreData: check });
  };
  render() {
    const { proposal, onHide } = this.props;
    const { searchText, voteCount, isMoreData } = this.state;
    const modalTitle = isMoreData && voteCount ? voteCount + "+" + " " : voteCount + " ";
    return (
      <Modal
        onHide={onHide}
        show={true}
        centered={true}
        size="lg"
        animation={false}
        className="proposal-votes-dialog"
      >
        <Modal.Header closeButton={true} className="align-items-center px-0">
          <Modal.Title>
            {modalTitle + _t("proposals.votes-dialog-title", { n: proposal.id })}
          </Modal.Title>
        </Modal.Header>
        <Form.Group className="w-100 mb-3">
          <Form.Control
            type="text"
            placeholder={_t("proposals.search-placeholder")}
            value={searchText}
            onChange={(e) => {
              this.setState({ searchText: e.target.value });
            }}
          />
        </Form.Group>
        <Modal.Body>
          <ProposalVotesDetail
            {...this.props}
            searchText={searchText}
            getVotesCount={this.getVotesCount}
            checkIsMoreData={this.checkIsMoreData}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default (p: ProposalVotesProps) => {
  const props = {
    history: p.history,
    global: p.global,
    dynamicProps: p.dynamicProps,
    proposal: p.proposal,
    addAccount: p.addAccount,
    onHide: p.onHide
  };

  return <ProposalVotes {...props} />;
};
