import React from "react";

import { connect } from "react-redux";

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

import routes from "../../common/routes";

import { getAccount, getAccounts, getWitnessesByVote, Witness } from "../api/hive";

import { _t } from "../i18n";
import { Tsx } from "../i18n/helper";

import { linkSvg, openInNewSvg } from "../img/svg";

import { pageMapDispatchToProps, pageMapStateToProps, PageProps } from "./common";
import { FullAccount } from "../store/accounts/types";
import { WitnessCard } from "../components/witness-card";
import { dateToRelative } from "../helper/parse-date";

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

const transform = (list: Witness[]): WitnessTransformed[] => {
  return list.map((x, i) => {
    const rank = i + 1;

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
}

class WitnessesPage extends BaseComponent<PageProps, State> {
  state: State = {
    witnesses: [],
    witnessVotes: [],
    proxyVotes: [],
    proxy: "",
    loading: true
  };

  componentDidMount() {
    this.load();
  }

  componentDidUpdate(prevProps: Readonly<PageProps>, prevState: Readonly<State>, snapshot?: any) {
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
  }

  load = async () => {
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
    const witnesses = await getWitnessesByVote();
    await this.getWitness(transform(witnesses));
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
      const byWitnessState: WitnessTransformed[] = witnessArray.map(
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
      this.stateSet({ witnesses: byWitnessState, loading: false });
    } catch (error) {
      console.log("Something went wrong: ", error);
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
    const { witnesses, loading, witnessVotes, proxy } = this.state;
    const extraWitnesses = witnessVotes.filter((w) => !witnesses.find((y) => y.name === w));

    const table = (
      <>
        <table className="table d-none d-sm-block">
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
            {witnesses.map((row, i) => {
              return (
                <tr
                  key={row.rank}
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
                          {UserAvatar({
                            ...this.props,
                            username: row.name,
                            size: "medium"
                          })}
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
              <WitnessCard
                voted={witnessVotes.includes(row.name)}
                witness={row.name}
                row={row}
                key={i}
                onSuccess={(approve: any) => {
                  if (approve) {
                    this.addWitness(row.name);
                  } else {
                    this.deleteWitness(row.name);
                  }
                }}
                {...this.props}
              />
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
    let containerClasses = global.isElectron ? " mt-0 pt-6" : "";

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme global={this.props.global} />
        <Feedback activeUser={this.props.activeUser} />
        {global.isElectron
          ? NavBarElectron({
              ...this.props,
              reloadFn: this.load,
              reloading: loading
            })
          : NavBar({ ...this.props })}
        <div className={"app-content witnesses-page" + containerClasses}>
          {(() => {
            if (loading) {
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

                <div className="table-responsive witnesses-table">{table}</div>
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
