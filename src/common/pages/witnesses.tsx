import React from "react";

import { connect } from "react-redux";
import { Form, FormControl, Spinner } from "react-bootstrap";

import { pathToRegexp } from "path-to-regexp";

import BaseComponent from "../components/base";
import Meta from "../components/meta";
import Feedback from "../components/feedback";
import ScrollToTop from "../components/scroll-to-top";
import Theme from "../components/theme";
import NavBar from "../components/navbar";
import NavBarElectron from "../../desktop/app/components/navbar";
import LinearProgress from "../components/linear-progress";
import ProfileLink from "../components/profile-link";
import UserAvatar from "../components/user-avatar";
import EntryLink, { PartialEntry } from "../components/entry-link";
import WitnessVoteBtn from "../components/witness-vote-btn";
import WitnessesExtra from "../components/witnesses-extra";
import WitnessesProxy from "../components/witnesses-proxy";
import WitnessesActiveProxy from "../components/witnesses-active-proxy";
import Pagination from "../components/pagination";

import routes from "../../common/routes";

import { getAccount, getAccounts, getWitnessesByVote, Witness } from "../api/hive";

import { _t } from "../i18n";
import { Tsx } from "../i18n/helper";

import { linkSvg, openInNewSvg } from "../img/svg";

import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { FullAccount } from "../store/accounts/types";
import { WitnessCard } from "../components/witness-card";
import { dateToRelative } from "../helper/parse-date";
import "./witnesses.scss";

interface WitnessTransformed {
  rank: number;
  name: string;
  miss: number;
  fee: string;
  feed: string;
  blockSize: number;
  acAvail: number;
  acBudget: number;
  version: string;
  url: string;
  parsedUrl?: PartialEntry;
  signingKey?: string;
  priceAge: string;
  witnessBy?: string;
}

type SortOption = "rank" | "name" | "fee";

const transform = (list: Witness[], rankState: number): WitnessTransformed[] => {
  return list.map((x, i) => {
    const rank = i + rankState;

    const { props } = x;

    const { total_missed: miss, url } = x;
    const fee = props.account_creation_fee;
    const feed = x.hbd_exchange_rate.base;
    const { maximum_block_size: blockSize } = props;
    const { available_witness_account_subsidies: acAvail } = x;
    const { account_subsidy_budget: acBudget } = props;
    const { running_version: version } = x;
    const { signing_key: signingKey } = x;
    const { last_hbd_exchange_update: priceAge } = x;

    let parsedUrl;
    const oUrl = new URL(url, "https://ecency.com");
    const ex = pathToRegexp(routes.ENTRY).exec(oUrl.pathname);

    if (ex) {
      parsedUrl = {
        category: ex[1],
        author: ex[2].replace("@", ""),
        permlink: ex[3]
      };
    }

    return {
      rank,
      name: x.owner,
      miss,
      fee,
      feed,
      blockSize,
      acAvail: Math.round(acAvail / 10000),
      acBudget,
      version,
      url,
      parsedUrl,
      signingKey,
      priceAge
    };
  });
};

interface State {
  witnesses: WitnessTransformed[];
  witnessVotes: string[];
  proxyVotes: string[];
  proxy: string;
  loading: boolean;
  page: number;
  lastDataLength: number;
  limit: number;
  noOfPages: number;
  startName: string;
  sort: SortOption;
  searchText: string;
  originalWitnesses: WitnessTransformed[];
  rank: number;
  spinner: boolean;
}

class WitnessesPage extends BaseComponent<PageProps, State> {
  state: State = {
    witnesses: [],
    witnessVotes: [],
    proxyVotes: [],
    proxy: "",
    loading: true,
    page: 1,
    lastDataLength: 0,
    limit: 35,
    noOfPages: 0,
    startName: "",
    sort: "rank",
    searchText: "",
    originalWitnesses: [],
    rank: 1,
    spinner: false
  };

  componentDidMount() {
    window.addEventListener("scroll", this.handleScroll);
    this.load();
  }

  componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>, snapshot?: any) {
    window.addEventListener("scroll", this.handleScroll);
    const { witnesses } = this.state;
    // active user changed
    if (this.props.activeUser?.username !== prevProps.activeUser?.username) {
      this.stateSet({ loading: true }, () => {
        this.load();
      });
    }
    if (this.state.proxy !== prevState.proxy) {
      this.stateSet({ loading: true }, () => {
        this.load();
      });
    }
    if (prevState.searchText !== this.state.searchText) {
      this.search();
    }
    if (prevState.witnesses !== witnesses) {
      this.stateSet({
        noOfPages: Math.ceil(witnesses.length / 30)
      });
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener("scroll", this.handleScroll);
  }

  handleScroll = () => {
    const { innerWidth } = window;
    const { lastDataLength, limit } = this.state;
    if (innerWidth <= 767) {
      let b = document.body;
      let scrollHeight = (b.scrollHeight / 100) * 90;
      if (window.scrollY >= scrollHeight && lastDataLength === limit) {
        this.stateSet({ spinner: true });
        this.load();
      }
    }
  };

  search = () => {
    const { searchText, originalWitnesses } = this.state;
    this.stateSet({ rank: originalWitnesses[originalWitnesses.length - 1].rank });
    if (searchText) {
      this.setState(
        {
          witnesses: this.state.originalWitnesses.filter((item) =>
            item.name.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
          ),
          page: 1
        },
        this.searchCallback
      );
    } else {
      this.setState({ witnesses: originalWitnesses, loading: false });
    }
  };

  searchCallback = () => {
    const { witnesses, lastDataLength, limit } = this.state;
    if (!witnesses.length && lastDataLength === limit) {
      this.load();
    }
  };

  sortChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.stateSet({ sort: e.target.value as SortOption });
  };

  load = async () => {
    const { startName, limit, rank } = this.state;
    this.stateSet({ loading: true });

    const { activeUser, location } = this.props;
    let params = location.search.split("=")[1];
    if (activeUser) {
      const resp = await getAccount(activeUser.username);
      const { witness_votes: witnessVotes, proxy } = resp;
      let data = await getAccount(params || proxy);

      if (params && data.proxy) {
        params = data.proxy;
        data = await getAccount(data.proxy);
      }

      this.stateSet({
        witnessVotes: witnessVotes || [],
        proxyVotes: data ? data.witness_votes : [],
        proxy: proxy || ""
      });
    } else {
      this.stateSet({ witnessVotes: [], proxy: "" });
    }
    const witnesses = await getWitnessesByVote(startName, limit);
    await this.getWitness(transform(witnesses, rank));
    this.stateSet({
      lastDataLength: witnesses.length,
      startName: witnesses[witnesses.length - 1].owner
    });
  };

  addWitness = (name: string) => {
    const { witnessVotes } = this.state;
    const newVotes = [...witnessVotes, name];
    this.stateSet({ witnessVotes: newVotes });
  };

  deleteWitness = (name: string) => {
    const { witnessVotes } = this.state;
    const newVotes = witnessVotes.filter((x) => x !== name);
    this.stateSet({ witnessVotes: newVotes });
  };

  getWitness = async (witnessArray: WitnessTransformed[]) => {
    const witnessUserNamesArray: string[] = witnessArray.map((item: WitnessTransformed) => {
      return item.name;
    });
    try {
      const accounts: FullAccount[] = await getAccounts(witnessUserNamesArray);
      let byWitnessState: WitnessTransformed[] = witnessArray.map(
        (item: WitnessTransformed, index: number) => {
          try {
            const parsedArray = JSON.parse(
              accounts[index].posting_json_metadata ? accounts[index].posting_json_metadata : ""
            );
            return {
              ...item,
              witnessBy: parsedArray.profile.witness_owner
                ? parsedArray.profile.witness_owner
                : undefined
            };
          } catch (e) {
            return item;
          }
        }
      );
      const { witnesses, originalWitnesses, startName } = this.state;
      let newOriginalWitnesses = originalWitnesses.concat(byWitnessState);
      let uniqueOriginalWitnesses = this.makeUniqueArray(newOriginalWitnesses);
      if (startName) {
        let prevWitnesses = witnesses.concat(byWitnessState);
        byWitnessState = this.makeUniqueArray(prevWitnesses);
      }
      this.stateSet(
        {
          witnesses: byWitnessState,
          loading: false,
          originalWitnesses: uniqueOriginalWitnesses,
          spinner: false
        },
        this.search
      );
    } catch (error) {
      this.stateSet({ loading: false, spinner: false });
    }
  };

  makeUniqueArray = (array: WitnessTransformed[]) => {
    return [...new Map(array.map((item) => [item["name"], item])).values()];
  };

  handlePageChange = () => {
    const { noOfPages, page, lastDataLength, limit } = this.state;
    if (page === noOfPages && lastDataLength === limit) {
      this.load();
    }
  };

  render() {
    //  Meta config
    const metaProps = {
      title: _t("witnesses.page-title"),
      description: _t("witnesses.page-description")
    };

    const { global, activeUser, location } = this.props;
    let params = location.search.split("=")[1];
    const {
      witnesses,
      loading,
      witnessVotes,
      proxy,
      page,
      sort,
      searchText,
      originalWitnesses,
      spinner
    } = this.state;
    const extraWitnesses = witnessVotes.filter((w) => !witnesses.find((y) => y.name === w));
    const pageSize = 30;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const sliced = witnesses
      .sort((a, b) => {
        const keyA = a[sort]!;
        const keyB = b[sort]!;

        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      })
      .slice(start, end);

    const table = (
      <>
        <table className="table">
          <thead>
            <tr>
              <th className="col-rank">{_t("witnesses.list-rank")}</th>
              <th>{_t("witnesses.list-witness")}</th>
              <th className="col-miss">{_t("witnesses.list-miss")}</th>
              <th className="col-url">{_t("witnesses.list-url")}</th>
              <th className="col-fee">{_t("witnesses.list-fee")}</th>
              <th className="col-feed">{_t("witnesses.list-feed")}</th>
              <th className="col-version">{_t("witnesses.list-version")}</th>
            </tr>
          </thead>
          <tbody>
            {sliced.map((row, i) => {
              return (
                <tr
                  key={`${row.name}-${row.rank}${i}`}
                  className={`${this.state.proxyVotes.includes(row.name) ? "voted-by-voter" : ""}`}
                >
                  <td>
                    <div className="witness-rank">
                      <span className="rank-number">{row.rank}</span>
                      {WitnessVoteBtn({
                        ...this.props,
                        voted: witnessVotes.includes(row.name),
                        witness: row.name,
                        onSuccess: (approve) => {
                          if (approve) {
                            this.addWitness(row.name);
                          } else {
                            this.deleteWitness(row.name);
                          }
                        }
                      })}
                    </div>
                  </td>
                  <td>
                    {ProfileLink({
                      ...this.props,
                      username: row.name,
                      children: (
                        <span className="witness-card notranslate">
                          {" "}
                          <UserAvatar username={row.name} size="medium" />
                          <div className={"witness-ctn"}>
                            {row.signingKey === "STM1111111111111111111111111111111114T1Anm" ? (
                              <s>{row.name}</s>
                            ) : (
                              row.name
                            )}
                            {row.witnessBy && (
                              <div className={"notranslate"}>
                                <small>by {row.witnessBy}</small>
                              </div>
                            )}
                          </div>
                        </span>
                      )
                    })}
                  </td>
                  <td>
                    <span className="witness-miss">{row.miss}</span>
                  </td>
                  <td>
                    {(() => {
                      const { parsedUrl } = row;
                      if (parsedUrl) {
                        return (
                          <EntryLink {...this.props} entry={parsedUrl}>
                            <span className="witness-link">{linkSvg}</span>
                          </EntryLink>
                        );
                      }
                      return (
                        <a target="_external" href={row.url} className="witness-link">
                          {openInNewSvg}
                        </a>
                      );
                    })()}
                  </td>
                  <td>
                    <span className="witness-fee">{row.fee}</span>
                  </td>
                  <td>
                    <div className="witness-feed">
                      <span className="inner">
                        ${row.feed.replace(" HBD", "")} | {dateToRelative(row.priceAge)}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="witness-version">
                      <span className="inner">{row.version}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="d-md-none">
          {witnesses.map((row, i) => {
            return (
              <span key={`${row.name}${i}`}>
                <div
                  className={`${this.state.proxyVotes.includes(row.name) ? "voted-by-voter" : ""}`}
                >
                  <WitnessCard
                    voted={witnessVotes.includes(row.name)}
                    witness={row.name}
                    row={row}
                    key={`${row.name}-${i}`}
                    onSuccess={(approve: any) => {
                      if (approve) {
                        this.addWitness(row.name);
                      } else {
                        this.deleteWitness(row.name);
                      }
                    }}
                    {...this.props}
                  />
                </div>
              </span>
            );
          })}
        </div>
      </>
    );

    const header = (
      <div className="page-header mt-5">
        <div className="header-title">{_t("witnesses.page-title")}</div>
        <Tsx k="witnesses.page-description-long">
          <div className="header-description" />
        </Tsx>
        {activeUser && (
          <Tsx k="witnesses.remaining" args={{ n: 30 - witnessVotes.length, max: 30 }}>
            <div className="remaining" />
          </Tsx>
        )}
      </div>
    );

    const search = (
      <Form.Group className="mb-3 w-100">
        <Form.Control
          type="text"
          placeholder={_t("witnesses.search-placeholder")}
          value={searchText}
          onChange={(e) => {
            this.setState({ searchText: e.target.value });
          }}
        />
      </Form.Group>
    );
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        {global.isElectron ? (
          NavBarElectron({
            ...this.props,
            reloadFn: this.load,
            reloading: loading
          })
        ) : (
          <NavBar history={this.props.history} />
        )}
        <div className={"app-content witnesses-page" + containerClasses}>
          {(() => {
            if (loading && !originalWitnesses.length) {
              return (
                <>
                  {header}
                  <LinearProgress />
                </>
              );
            }

            // if (proxy) {
            //     return <>
            //         {header}
            //         <WitnessesActiveProxy
            //             {...this.props}
            //             username={proxy}
            //             onDone={() => {
            //                 this.stateSet({proxy: null});
            //             }}
            //         />
            //     </>
            // }

            return (
              <>
                {header}
                <div>
                  {proxy || params ? (
                    <WitnessesActiveProxy
                      {...this.props}
                      isProxy={!params ? true : false}
                      username={params || proxy}
                      onDone={() => {
                        this.stateSet({ proxy: "" });
                      }}
                    />
                  ) : null}
                </div>
                <div className="search-bar">{search}</div>

                {loading && <LinearProgress />}
                {sliced && sliced.length > 0 ? (
                  <div className="witnesses-table">
                    {table}
                    {spinner && (
                      <Spinner
                        animation="grow"
                        variant="primary"
                        style={{ position: "fixed", bottom: "10%", left: "50%" }}
                      />
                    )}
                  </div>
                ) : (
                  <div className="witnesses-table">
                    <div className="user-info">
                      {loading ? _t("witnesses.searching") : _t("witnesses.no-results")}
                    </div>
                  </div>
                )}

                <div className="table-tools">
                  {witnesses.length > pageSize && (
                    <Pagination
                      dataLength={witnesses.length}
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

                  <div className="sorter">
                    <span className="label">{_t("witnesses.sort")}</span>
                    <Form.Control as="select" onChange={this.sortChanged} value={sort}>
                      <option value="rank">{_t("witnesses.sort-rank")}</option>
                      <option value="name">{_t("witnesses.sort-name")}</option>
                      <option value="fee">{_t("witnesses.sort-fee")}</option>
                    </Form.Control>
                  </div>
                </div>
                <div className="witnesses-controls">
                  {!proxy
                    ? WitnessesExtra({
                        ...this.props,
                        list: extraWitnesses,
                        onAdd: (name) => {
                          this.addWitness(name);
                        },
                        onDelete: (name) => {
                          this.deleteWitness(name);
                        }
                      })
                    : null}
                  <div className="flex-spacer" />

                  {!proxy
                    ? WitnessesProxy({
                        ...this.props,
                        onDone: (username) => {
                          this.stateSet({ proxy: username, witnesses: [] });
                        }
                      })
                    : null}

                  {/* {!proxy ? WitnessesProxy({
                                    ...this.props,
                                    onDone: (username) => {
                                        this.stateSet({proxy: username, witnesses: []});
                                    }
                                }) : (
                                    <WitnessesActiveProxy
                                    {...this.props}
                                    username={proxy}
                                    onDone={() => {
                                        this.stateSet({proxy: ''});
                                    }}
                                />
                                )} */}
                </div>
              </>
            );
          })()}
        </div>
      </>
    );
  }
}

export default connect(pageMapStateToProps, pageMapDispatchToProps)(WitnessesPage);
