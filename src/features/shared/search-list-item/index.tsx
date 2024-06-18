import React, { useMemo } from "react";
import { catchPostImage, postBodySummary, setProxyBase } from "@ecency/render-helper";
import "./_index.scss";
import defaults from "@/defaults.json";
import { SearchResult } from "@/entities";
import { EntryLink, FormattedCurrency, ProfileLink, UserAvatar } from "@/features/shared";
import { TagLink } from "../tag";
import { commentSvg, peopleSvg } from "@ui/svg";
import {
  accountReputation,
  dateToFormatted,
  dateToRelative,
  transformMarkedContent
} from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import Image from "next/image";

setProxyBase(defaults.imageServer);

interface Props {
  res: SearchResult;
}

export function SearchListItem({ res }: Props) {
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

  const entry = useMemo(
    () => ({
      category: res.category,
      author: res.author,
      permlink: res.permlink
    }),
    [res]
  );
  const dateRelative = useMemo(() => dateToRelative(res.created_at), [res]);
  const dateFormatted = useMemo(() => dateToFormatted(res.created_at), [res]);
  const reputation = useMemo(() => accountReputation(res.author_rep), [res]);
  const img = useMemo(
    () =>
      (canUseWebp
        ? catchPostImage(res.body, 600, 500, "webp")
        : catchPostImage(res.body, 600, 500)) || "/assets/img/noimage.svg",
    [canUseWebp, res.body]
  );

  const title = useMemo(
    () => (res.title_marked ? transformMarkedContent(res.title_marked) : res.title),
    [res]
  );
  const summary = useMemo(
    () =>
      res.body_marked ? transformMarkedContent(res.body_marked) : postBodySummary(res.body, 200),
    [res]
  );

  return (
    <div className="search-list-item">
      <div className="item-header">
        <div className="item-header-main">
          <div className="author-part">
            <ProfileLink username={res.author}>
              <UserAvatar username={res.author} size="small" />
            </ProfileLink>
            <ProfileLink username={res.author}>
              <div className="author">
                {res.author}
                <span className="author-reputation">{reputation}</span>
              </div>
            </ProfileLink>
          </div>
          <TagLink tag={res.category} type="link">
            <a className="category">{res.category}</a>
          </TagLink>
          <span className="date" title={dateFormatted}>
            {dateRelative}
          </span>
        </div>
      </div>
      <div className="item-body">
        <div className="item-image">
          <EntryLink entry={entry}>
            <div>
              <Image
                width={500}
                height={500}
                src={img ?? "/assets/img/fallback.png"}
                alt={res.title}
                className={img === "/assets/img/noimage.svg" ? "no-img" : ""}
              />
            </div>
          </EntryLink>
        </div>
        <div className="item-summary">
          <EntryLink entry={entry}>
            <div className="item-title">{title}</div>
          </EntryLink>
          <EntryLink entry={entry}>
            <div className="item-title">{summary}</div>
          </EntryLink>
        </div>
        <div className="item-controls">
          <EntryLink entry={entry}>
            <a className="result-payout">
              <FormattedCurrency value={res.payout} />
            </a>
          </EntryLink>
          <EntryLink entry={entry}>
            <a className="result-votes">
              {" "}
              {peopleSvg} {res.total_votes}
            </a>
          </EntryLink>
          <EntryLink entry={entry}>
            <a className="result-replies">
              {commentSvg} {res.children}
            </a>
          </EntryLink>
        </div>
      </div>
    </div>
  );
}
