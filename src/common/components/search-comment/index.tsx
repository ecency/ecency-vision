import React, { Fragment } from "react";
import { Col, FormCheck, Row } from "react-bootstrap";
import { History, Location } from "history";
import numeral from "numeral";
import moment, { Moment } from "moment";
import queryString from "query-string";
import * as ls from "../../util/local-storage";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import BaseComponent from "../base";
import SearchListItem from "../search-list-item";
import LinearProgress from "../linear-progress";
import DetectBottom from "../detect-bottom";
import SearchQuery, { SearchType } from "../../helper/search-query";
import { search, SearchResult } from "../../api/search-api";
import { _t } from "../../i18n";
import "./_index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";

enum SearchSort {
  POPULARITY = "popularity",
  NEWEST = "newest",
  RELEVANCE = "relevance"
}

enum DateOpt {
  W = "week",
  M = "month",
  Y = "year",
  A = "all"
}

interface Props {
  history: History;
  location: Location;
  global: Global;
  addAccount: (data: Account) => void;
  limit?: number;
  disableResults?: boolean;
}

interface State {
  search: string;
  author: string;
  type: SearchType;
  category: string;
  tags: string;
  date: DateOpt;
  sort: SearchSort;
  hideLow: boolean;
  advanced: boolean;
  inProgress: boolean;
  hits: number;
  results: SearchResult[];
  scrollId: string;
}

const pureState = (props: Props): State => {
  const { location } = props;
  const qs = queryString.parse(location.search);

  const q = qs.q as string;
  const sort = (qs.sort as SearchSort) || SearchSort.POPULARITY;
  const date = (qs.date as DateOpt) || ls.get("recent_date", "month");
  const hideLow = !(qs.hd && qs.hd === "0");
  const advanced = !!(qs.adv && qs.adv === "1");
  const sq = new SearchQuery(q);

  return {
    search: sq.search,
    author: sq.author,
    type: sq.type || SearchType.ALL,
    category: sq.category,
    tags: sq.tags.join(","),
    date,
    sort,
    hideLow,
    advanced,
    inProgress: false,
    hits: 0,
    results: [],
    scrollId: ""
  };
};

export class SearchComment extends BaseComponent<Props, State> {
  state = pureState(this.props);

  componentDidMount() {
    this.doSearch();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>) {
    if (this.props.location !== prevProps.location) {
      this.setState(pureState(this.props), this.doSearch);
    }
  }

  toggleAdvanced = () => {
    const { advanced } = this.state;
    this.stateSet({ advanced: !advanced });
  };

  searchChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.stateSet({ search: e.target.value });
  };

  authorChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.stateSet({ author: e.target.value.trim() });
  };

  typeChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.stateSet({ type: e.target.value as SearchType });
  };

  categoryChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.stateSet({ category: e.target.value.trim() });
  };

  tagsChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.stateSet({ tags: e.target.value.trim() });
  };

  dateChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    ls.set("recent_date", e.target.value);
    this.stateSet({ date: e.target.value as DateOpt });
  };

  sortChanged = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    this.stateSet({ sort: e.target.value as SearchSort });
  };

  hideLowChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    this.stateSet({ hideLow: e.target.checked });
  };

  textInputDown = (e: React.KeyboardEvent) => {
    if (e.keyCode === 13) {
      this.apply();
    }
  };

  buildQuery = () => {
    const { search, author, type, category, tags } = this.state;

    let q = search;

    if (author) {
      q += ` author:${author}`;
    }

    if (type) {
      q += ` type:${type}`;
    }

    if (category) {
      q += ` category:${category}`;
    }

    if (tags) {
      q += ` tag:${tags}`;
    }

    return q;
  };

  apply = () => {
    const { history } = this.props;
    const { date, sort, hideLow } = this.state;

    const q = this.buildQuery();

    const uqObj: { q: string; date: string; sort: string; adv: string; hd?: string } = {
      q,
      date,
      sort,
      adv: "1"
    };

    if (!hideLow) uqObj.hd = "0";

    const uq = queryString.stringify(uqObj);

    history.push(`?${uq}`);
  };

  doSearch = () => {
    const { limit } = this.props;
    const { date, sort, hideLow, results, scrollId } = this.state;

    let sinceDate: undefined | Moment;

    switch (date) {
      case DateOpt.W:
        sinceDate = moment().subtract("1", "week");
        break;
      case DateOpt.M:
        sinceDate = moment().subtract("1", "month");
        break;
      case DateOpt.Y:
        sinceDate = moment().subtract("1", "year");
        break;
      default:
        sinceDate = undefined;
    }

    const since = sinceDate ? sinceDate.format("YYYY-MM-DDTHH:mm:ss") : undefined;

    const q = this.buildQuery();

    const hideLow_ = hideLow ? "1" : "0";
    const scrollId_ = results.length > 0 && scrollId ? scrollId : undefined;

    this.stateSet({ inProgress: true });
    search(q, sort, hideLow_, since, scrollId_)
      .then((r) => {
        let newResults: SearchResult[];

        if (limit) {
          newResults = r.results.slice(0, limit);
        } else {
          newResults = [...results, ...r.results];
        }

        this.stateSet({
          hits: r.hits,
          results: newResults,
          scrollId: r.scroll_id || ""
        });
      })
      .finally(() => {
        this.stateSet({
          inProgress: false
        });
      });
  };

  showMore = () => {
    const { location, history } = this.props;
    const { search } = location;

    history.push(`/search-more/${search}`);
  };

  bottomReached = () => {
    const { inProgress, scrollId } = this.state;
    if (inProgress || !scrollId) {
      return;
    }

    this.doSearch();
  };

  render() {
    const { limit, disableResults } = this.props;
    const {
      search,
      author,
      type,
      category,
      tags,
      date,
      sort,
      hideLow,
      advanced,
      inProgress,
      hits,
      results
    } = this.state;
    const showMore = !!(limit && hits > limit);

    const advancedForm =
      advanced || disableResults ? (
        <Col className="advanced-section">
          <Row>
            <Col className="mb-4" sm={4}>
              <label>{_t("search-comment.search")}</label>
              <FormControl
                type="text"
                placeholder={_t("search-comment.search-placeholder")}
                value={search}
                onChange={this.searchChanged}
                onKeyDown={this.textInputDown}
              />
            </Col>
            <Col className="mb-4" sm={4}>
              <label>{_t("search-comment.author")}</label>
              <FormControl
                type="text"
                placeholder={_t("search-comment.author-placeholder")}
                value={author}
                onChange={this.authorChanged}
                onKeyDown={this.textInputDown}
              />
            </Col>
            <Col className="mb-4" sm={2}>
              <label>{_t("search-comment.type")}</label>
              <FormControl type="select" value={type} onChange={this.typeChanged}>
                {Object.values(SearchType).map((x) => (
                  <option value={x} key={x}>
                    {_t(`search-comment.type-${x}`)}
                  </option>
                ))}
              </FormControl>
            </Col>
            <Col className="mb-4" sm={2}>
              <label>{_t("search-comment.category")}</label>
              <FormControl
                type="text"
                placeholder={_t("search-comment.category-placeholder")}
                value={category}
                onChange={this.categoryChanged}
                onKeyDown={this.textInputDown}
              />
            </Col>
          </Row>
          <Row>
            <Col className="mb-4" sm={8}>
              <label>{_t("search-comment.tags")}</label>
              <FormControl
                type="text"
                placeholder={_t("search-comment.tags-placeholder")}
                value={tags}
                onChange={this.tagsChanged}
                onKeyDown={this.textInputDown}
              />
            </Col>
            <Col className="mb-4" sm={2}>
              <label>{_t("search-comment.date")}</label>
              <FormControl
                type="select"
                value={ls.get("recent_date", "month")}
                onChange={this.dateChanged}
              >
                {Object.values(DateOpt).map((x) => (
                  <option value={x} key={x}>
                    {_t(`search-comment.date-${x}`)}
                  </option>
                ))}
              </FormControl>
            </Col>
            <Col className="mb-4" sm={2}>
              <label>{_t("search-comment.sort")}</label>
              <FormControl type="select" value={sort} onChange={this.sortChanged}>
                {Object.values(SearchSort).map((x) => (
                  <option value={x} key={x}>
                    {_t(`search-comment.sort-${x}`)}
                  </option>
                ))}
              </FormControl>
            </Col>
          </Row>
          <div className="flex justify-between items-center">
            <FormCheck
              id="hide-low"
              type="checkbox"
              label={_t("search-comment.hide-low")}
              checked={hideLow}
              onChange={this.hideLowChanged}
            />

            <Button onClick={this.apply}>{_t("g.apply")}</Button>
          </div>
        </Col>
      ) : null;

    return (
      <div className="border bg-white rounded search-comment">
        <div className="bg-gray-100 border-b p-3 flex justify-between items-center">
          <div>
            <strong>{_t("search-comment.title")}</strong>
            {(() => {
              if (hits === 1) {
                return <span className="matches">{_t("search-comment.matches-singular")}</span>;
              }

              if (hits > 1) {
                const strHits = numeral(hits).format("0,0");
                return (
                  <span className="matches">{_t("search-comment.matches", { n: strHits })}</span>
                );
              }

              return null;
            })()}
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              this.toggleAdvanced();
            }}
          >
            {advanced ? _t("g.close") : _t("search-comment.advanced")}
          </a>
        </div>
        <div className="card-body">
          {advancedForm}
          {(() => {
            if (results.length > 0 && !disableResults) {
              return (
                <div className="search-list">
                  {results.map((res) => (
                    <Fragment key={`${res.author}-${res.permlink}`}>
                      {SearchListItem({ ...this.props, res: res })}
                    </Fragment>
                  ))}

                  {showMore && (
                    <div className="show-more">
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          this.showMore();
                        }}
                      >
                        {_t("search-comment.show-more")}
                      </a>
                    </div>
                  )}
                </div>
              );
            }

            if (!inProgress) {
              return <span>{_t("g.no-matches")}</span>;
            }

            return null;
          })()}

          {!disableResults && inProgress && <LinearProgress />}
        </div>
        {!limit && <DetectBottom onBottom={this.bottomReached} />}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    location: p.location,
    global: p.global,
    addAccount: p.addAccount,
    limit: p.limit,
    disableResults: p.disableResults
  };

  return <SearchComment {...props} />;
};
