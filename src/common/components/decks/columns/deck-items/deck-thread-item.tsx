import { useMappedStore } from "../../../../store/use-mapped-store";
import { useResizeDetector } from "react-resize-detector";
import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import { UserAvatar } from "../../../user-avatar";
import { Link } from "react-router-dom";
import { dateToRelative } from "../../../../helper/parse-date";
import { renderPostBody } from "@ecency/render-helper";
import { DeckThreadLinkItem } from "./deck-thread-link-item";
import { renderToString } from "react-dom/server";
import { getCGMarketApi } from "../../../market-swap-form/api/coingecko-api";
import formattedNumber from "../../../../util/formatted-number";
import EntryVoteBtn from "../../../entry-vote-btn";
import { History } from "history";
import { Button } from "react-bootstrap";
import { _t } from "../../../../i18n";
import { IdentifiableEntry } from "../deck-threads-manager";
import { commentSvg, voteSvg } from "../../icons";
import EntryVotes from "../../../entry-votes";

export interface ThreadItemProps {
  entry: IdentifiableEntry;
  history: History;
  onMounted: () => void;
  onEntryView: () => void;
  onResize: () => void;
  pure?: boolean;
}

export const ThreadItem = ({
  entry,
  onMounted,
  onEntryView,
  onResize,
  history,
  pure
}: ThreadItemProps) => {
  const { global } = useMappedStore();
  const { height, ref } = useResizeDetector();

  const [renderInitiated, setRenderInitiated] = useState(false);
  const [hasParent, setHasParent] = useState(false);

  const renderAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onMounted();
  }, []);

  useEffect(() => {
    setHasParent(
      !!entry.parent_author && !!entry.parent_permlink && entry.parent_author !== entry.host
    );
  }, [entry]);

  useEffect(() => {
    onResize();
    if (!renderInitiated) {
      renderBody();
    }
  }, [height]);

  const renderBody = async () => {
    setRenderInitiated(true);

    if (renderAreaRef.current) {
      renderAreaRef.current.innerHTML = await modifyCurrencyTokens(
        renderAreaRef?.current?.innerHTML
      );
    }

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-tag-link")
      .forEach((element) => {
        element.href = `/trending/${element.dataset.tag}`;
        element.target = "_blank";
      });

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-author-link")
      .forEach((element) => {
        const { author } = element.dataset;
        if (author) {
          element.href = `/@${author}`;
          element.target = "_blank";
          ReactDOM.hydrate(
            <>
              <UserAvatar size="xsmall" global={global} username={author} />
              <span>{author}</span>
            </>,
            element
          );
        }
      });

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-post-link")
      .forEach((element) => {
        const { author, permlink } = element.dataset;

        if (author && permlink) {
          element.href = `/@${author}/${permlink}`;
          element.target = "_blank";
          ReactDOM.hydrate(<DeckThreadLinkItem link={`/@${author}/${permlink}`} />, element);
        }
      });

    renderAreaRef.current
      ?.querySelectorAll<HTMLLinkElement>(".markdown-external-link")
      .forEach((element) => {
        const { href } = element.dataset;

        if (href) {
          element.href = href;
          element.target = "_blank";
        }
      });
  };

  const modifyCurrencyTokens = async (raw: string): Promise<string> => {
    const tokens = [
      ...(raw.toLowerCase().includes("$btc") ? ["$btc"] : []),
      ...(raw.toLowerCase().includes("$leo") ? ["$leo"] : []),
      ...(raw.toLowerCase().includes("$hive") ? ["$hive"] : [])
    ];
    if (tokens.length > 0) {
      const coins = tokens
        .map((token) => token.replace("$", ""))
        .map((token) => {
          switch (token) {
            case "btc":
              return "binance-wrapped-btc";
            default:
              return token;
          }
        })
        .join(",");

      let values;
      try {
        values = await getCGMarketApi(coins, "usd");
      } catch (e) {
        values = tokens.reduce((acc, token) => ({ ...acc, [token]: { usd: "no-data" } }), {});
      }

      Object.entries(values)
        .map(([key, { usd }]) => {
          switch (key) {
            case "binance-wrapped-btc":
              return [
                ["BTC", usd],
                ["btc", usd]
              ];
            default:
              return [
                [key.toUpperCase(), usd],
                [key.toLowerCase(), usd]
              ];
          }
        })
        .forEach((tokens) =>
          tokens.forEach(([token, value]) => {
            raw = raw.replaceAll(
              `$${token}`,
              renderToString(
                <span className="markdown-currency">
                  <span>{token}</span>
                  <span className="value">
                    {value === "no-data"
                      ? _t("decks.columns.no-currency-data")
                      : formattedNumber(value)}
                  </span>
                </span>
              )
            );
          })
        );
    }
    return raw;
  };

  return (
    <div
      ref={ref}
      className={
        "thread-item border-bottom" +
        (hasParent && !pure ? " has-parent" : "") +
        (pure ? " pure" : "")
      }
      onClick={() => onEntryView()}
    >
      <div className="thread-item-header">
        <UserAvatar size="deck-item" global={global} username={entry.author} />
        <div className="username text-truncate">
          <Link to={`/@${entry.author}`}>{entry.author}</Link>
          {hasParent && !pure && (
            <>
              <span>replied to</span>
              <Link to={`/@${entry.parent_author}`}>{entry.parent_author}</Link>
            </>
          )}
        </div>
        <div className="host">
          <Link to={`/created/${entry.category}`}>#{entry.host}</Link>
        </div>

        <div className="date">{`${dateToRelative(entry.created)}`}</div>
      </div>
      <div className="thread-item-body">
        <div
          ref={renderAreaRef}
          className="thread-render"
          dangerouslySetInnerHTML={{ __html: renderPostBody(entry) }}
        />
      </div>
      <div className="thread-item-actions">
        <EntryVoteBtn entry={entry} isPostSlider={false} history={history} afterVote={() => {}} />
        <EntryVotes history={history!!} entry={entry} icon={voteSvg} />
        <Button variant="link">
          <div className="d-flex align-items-center comments">
            <div style={{ paddingRight: 4 }}>{commentSvg}</div>
            <div>{entry.children}</div>
          </div>
        </Button>
      </div>
      {hasParent && !pure && (
        <div className="thread-item-parent">
          <UserAvatar size="small" global={global} username={entry.parent_author!!} />
          <Button variant="link" className="host">
            {_t("decks.columns.see-full-thread")}
          </Button>
        </div>
      )}
    </div>
  );
};
