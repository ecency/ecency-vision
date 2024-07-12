"use client";

import React, { useCallback, useState } from "react";

import defaults from "@/defaults.json";
import { catchPostImage, setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import { Entry, SearchResult } from "@/entities";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import { dateToFullRelative, isCommunity } from "@/utils";
import { EntryLink } from "@/features/shared";
import Image from "next/image";
import { search } from "@/api/search-api";
import useMount from "react-use/lib/useMount";

setProxyBase(defaults.imageServer);

interface Props {
  entry: Entry;
  display: string;
}

export function SimilarEntries({ entry, display }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const [entries, setEntries] = useState<SearchResult[]>([]);
  const [retry, setRetry] = useState(3);
  const [loading, setLoading] = useState(false);

  const buildQuery = useCallback(
    (entry: Entry) => {
      const { json_metadata, permlink } = entry;

      let q = "*";
      q += ` -dporn type:post`;
      let tags;
      // 3 tags and decrease until there is enough relevant posts
      if (json_metadata && json_metadata.tags && Array.isArray(json_metadata.tags)) {
        tags = json_metadata.tags
          .filter((x) => x && x !== "")
          .filter((x) => !isCommunity(x))
          .filter((x, ind) => ind < +retry)
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
    },
    [retry]
  );

  const fetch = useCallback(() => {
    const { permlink } = entry;
    const limit = 3;
    if (retry > 0 && entries.length < limit) {
      setLoading(true);
      const query = buildQuery(entry);
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
            setRetry(retry - 1);
            // this.fetch();
          } else {
            entries = entries.slice(0, limit);
          }

          setEntries(entries);
        })
        .finally(() => setLoading(false));
    }
  }, [buildQuery, entries.length, entry, retry]);

  useMount(() => fetch());

  return entries.length !== 3 ? (
    <div className={`similar-entries-list ${display}`}>
      <div className="similar-entries-list-header">
        <div className="list-header-text">{i18next.t("similar-entries.title")}</div>
      </div>
      <div className="similar-entries-list-body">
        {entries.map((en, i) => {
          const img =
            catchPostImage(en.img_url, 600, 500, canUseWebp ? "webp" : "match") ||
            "/assets/noimage.svg";
          const imgSize = img == "/assets/noimage.svg" ? "75px" : "auto";
          const dateRelative = dateToFullRelative(en.created_at);

          return (
            <div className="similar-entries-list-item" key={i}>
              <EntryLink entry={{ category: "relevant", author: en.author, permlink: en.permlink }}>
                <>
                  <div className="item-image">
                    <Image
                      src={img ?? "/assets/fallback.png"}
                      alt={en.title}
                      width={1000}
                      height={1000}
                    />
                  </div>
                  <div className="item-title">{en.title}</div>
                  <div className="item-footer">
                    <span className="item-footer-author">{en.author}</span>
                    <span className="item-footer-date">{dateRelative}</span>
                  </div>
                </>
              </EntryLink>
            </div>
          );
        })}
      </div>
    </div>
  ) : (
    <></>
  );
}
