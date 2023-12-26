import React from "react";
import Pagination from "@ui/pagination";
import "./page.scss";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Table, Td, Th, Tr } from "@ui/table";
import { FullAccount, WitnessTransformed } from "@/entities";
import { getAccount, getAccounts, getWitnessesByVote } from "@/api/hive";
import i18next from "i18next";
import {
  LinearProgress,
  Navbar,
  ProfileLink,
  ScrollToTop,
  Theme,
  UserAvatar
} from "@/features/shared";
import { linkSvg, openInNewSvg } from "@ui/svg";
import { dateToRelative } from "@/utils";
import { Tsx } from "@/features/i18n/helper";
import { transform } from "@/app/witnesses/_utils";

type SortOption = "rank" | "name" | "fee";

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

  sortChanged = (e: React.ChangeEvent<HTMLSelectElement>) => {
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
    return Array.from(new Map(array.map((item) => [item["name"], item])).values());
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
      title: i18next.t("witnesses.page-title"),
      description: i18next.t("witnesses.page-description")
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
        <Table full={true}>
          <thead>
            <Tr>
              <Th className="border p-2 col-rank">{i18next.t("witnesses.list-rank")}</Th>
              <Th className="border p-2 ">{i18next.t("witnesses.list-witness")}</Th>
              <Th className="border p-2 col-miss">{i18next.t("witnesses.list-miss")}</Th>
              <Th className="border p-2 col-url">{i18next.t("witnesses.list-url")}</Th>
              <Th className="border p-2 col-fee">{i18next.t("witnesses.list-fee")}</Th>
              <Th className="border p-2 col-feed">{i18next.t("witnesses.list-feed")}</Th>
              <Th className="border p-2 col-version">{i18next.t("witnesses.list-version")}</Th>
            </Tr>
          </thead>
          <tbody>
            {sliced.map((row, i) => {
              return (
                <Tr
                  key={`${row.name}-${row.rank}${i}`}
                  className={`${this.state.proxyVotes.includes(row.name) ? "voted-by-voter" : ""}`}
                >
                  <Td className="border p-2">
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
                  </Td>
                  <Td className="border p-2">
                    <ProfileLink username={row.name}>
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
                    </ProfileLink>
                  </Td>
                  <Td className="border p-2">
                    <span className="witness-miss">{row.miss}</span>
                  </Td>
                  <Td className="border p-2">
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
                  </Td>
                  <Td className="border p-2">
                    <span className="witness-fee">{row.fee}</span>
                  </Td>
                  <Td className="border p-2">
                    <div className="witness-feed">
                      <span className="inner">
                        ${row.feed.replace(" HBD", "")} | {dateToRelative(row.priceAge)}
                      </span>
                    </div>
                  </Td>
                  <Td className="border p-2">
                    <div className="witness-version">
                      <span className="inner">{row.version}</span>
                    </div>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        <div className="md:hidden">
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
      <div className="mb-3 w-full">
        <FormControl
          type="text"
          placeholder={i18next.t("witnesses.search-placeholder")}
          value={searchText}
          onChange={(e) => {
            this.setState({ searchText: e.target.value });
          }}
        />
      </div>
    );

    return (
      <>
        <Meta {...metaProps} />
        <ScrollToTop />
        <Theme />
        <Feedback activeUser={this.props.activeUser} />
        <Navbar />

        <div className="app-content witnesses-page">
          {(() => {
            if (loading && !originalWitnesses.length) {
              return (
                <>
                  {header}
                  <LinearProgress />
                </>
              );
            }

            return (
              <>
                {header}
                <div>
                  {proxy || params ? (
                    <WitnessesActiveProxy
                      {...this.props}
                      isProxy={!params}
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
                    {spinner && <Spinner className="fixed bottom-[10%] left-[50%] w-3.5 h-3.5" />}
                  </div>
                ) : (
                  <div className="witnesses-table">
                    <div className="user-info">
                      {i18next.t(loading ? "witnesses.searching" : "witnesses.no-results")}
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
                    <span className="label">{i18next.t("witnesses.sort")}</span>
                    <FormControl type="select" onChange={this.sortChanged} value={sort}>
                      <option value="rank">{i18next.t("witnesses.sort-rank")}</option>
                      <option value="name">{i18next.t("witnesses.sort-name")}</option>
                      <option value="fee">{i18next.t("witnesses.sort-fee")}</option>
                    </FormControl>
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
                </div>
              </>
            );
          })()}
        </div>
      </>
    );
  }
}
