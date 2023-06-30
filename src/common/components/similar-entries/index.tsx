import React from "react";

import { History, Location } from "history";

import isEqual from "react-fast-compare";

import defaults from "../../constants/defaults.json";

import { catchPostImage, setProxyBase } from "@ecency/render-helper";

setProxyBase(defaults.imageServer);

import { Global } from "../../store/global/types";
import { Entry } from "../../store/entries/types";

import BaseComponent from "../base";
import EntryLink from "../entry-link";

import { search, SearchResult } from "../../api/search-api";

import { _t } from "../../i18n";

import { dateToFullRelative } from "../../helper/parse-date";
import isCommunity from "../../helper/is-community";
import "./_index.scss";

interface Props {
  history: History;
  location: Location;
  global: Global;
  entry: Entry;
  display: string;
}

interface State {
  loading: boolean;
  entries: SearchResult[];
  retry: number;
}

export class SimilarEntries extends BaseComponent<Props, State> {
  state: State = {
    loading: false,
    entries: [],
    retry: 3
  };

  componentDidMount() {
    this.fetch();
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>, snapshot?: any) {
    if (!isEqual(this.props.location, prevProps.location)) {
      this.fetch();
    }
  }

  buildQuery = (entry: Entry) => {
    const { json_metadata, permlink } = entry;
    const { retry } = this.state;

    let q = "*";
    q += ` -dporn type:post`;
    let tags;
    // 3 tags and decrease until there is enough relevant posts
    if (json_metadata && json_metadata.tags && Array.isArray(json_metadata.tags)) {
      tags = json_metadata.tags
        .filter((x: string) => x && x !== "")
        .filter((x: string) => !isCommunity(x))
        .filter((x: string, ind: number) => ind < retry)
        .join(",");
    }
    // check to make sure tags are not empty
    if (tags && tags.length > 0) {
      q += ` tag:${tags}`;
    } else {
      // no tags in post, try with permlink
      const fperm = permlink.split("-");
      tags = fperm
        .filter((x: string) => x !== "")
        .filter((x: string) => !/^-?\d+$/.test(x))
        .filter((x: string) => x.length > 2)
        .join(",");
      q += ` tag:${tags}`;
    }
    return q;
  };

  fetch = () => {
    const { entry } = this.props;
    const { permlink } = entry;
    const { retry } = this.state;
    const limit = 3;
    if (retry > 0 && this.state.entries.length < limit) {
      this.setState({ loading: true });
      const query = this.buildQuery(entry);
      search(query, "newest", "0", undefined, undefined)
        .then((r) => {
          const rawEntries: SearchResult[] = r.results.filter(
            (r) => r.permlink !== permlink && r.tags.indexOf("nsfw") === -1
          );

          let entries: SearchResult[] = [];

          rawEntries.forEach((x) => {
            if (entries.find((y) => y.author === x.author) === undefined) {
              entries.push(x);
            }
          });
          if (entries.length < limit) {
            this.setState({ retry: retry - 1 });
            this.fetch();
          } else {
            entries = entries.slice(0, limit);
          }

          this.setState({ entries });
        })
        .finally(() => {
          this.setState({
            loading: false
          });
        });
    }
  };

  render() {
    const { global, display } = this.props;
    const { entries } = this.state;
    const fallbackImage = global.isElectron
      ? "./img/fallback.png"
      : require("../../img/fallback.png");
    const noImage = global.isElectron ? "./img/noimage.svg" : require("../../img/noimage.svg");
    if (entries.length !== 3) {
      return null;
    }

    return (
      <>
        <div className={`similar-entries-list ${display}`}>
          <div className="similar-entries-list-header">
            <div className="list-header-text">{_t("similar-entries.title")}</div>
          </div>
          <div className="similar-entries-list-body">
            {entries.map((en, i) => {
              const img =
                catchPostImage(en.img_url, 600, 500, global.canUseWebp ? "webp" : "match") ||
                noImage;
              const imgSize = img == noImage ? "75px" : "auto";
              const dateRelative = dateToFullRelative(en.created_at);

              return (
                <div className="similar-entries-list-item" key={i}>
                  {EntryLink({
                    ...this.props,
                    entry: { category: "relevant", author: en.author, permlink: en.permlink },
                    children: (
                      <>
                        <div className="item-image">
                          <img
                            src={img}
                            alt={en.title}
                            loading="lazy"
                            onError={(e: React.SyntheticEvent) => {
                              const target = e.target as HTMLImageElement;
                              target.src = fallbackImage;
                            }}
                            style={{ width: imgSize }}
                          />
                        </div>
                        <div className="item-title">{en.title}</div>
                        <div className="item-footer">
                          <span className="item-footer-author">{en.author}</span>
                          <span className="item-footer-date">{dateRelative}</span>
                        </div>
                      </>
                    )
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    location: p.location,
    global: p.global,
    entry: p.entry,
    display: p.display
  };
  return <SimilarEntries {...props} />;
};
