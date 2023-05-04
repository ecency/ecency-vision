import { Entry } from "../../../../store/entries/types";
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

export interface ThreadItemProps {
  entry: Entry;
  onMounted: () => void;
  onEntryView: () => void;
  onResize: () => void;
}
export const ThreadItem = ({ entry, onMounted, onEntryView, onResize }: ThreadItemProps) => {
  const { global } = useMappedStore();
  const { height, ref } = useResizeDetector();

  const [renderInitiated, setRenderInitiated] = useState(false);

  const renderAreaRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    onMounted();
  }, []);

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
      ...(raw.includes("$BTC") ? ["$BTC"] : []),
      ...(raw.includes("$HIVE") ? ["$HIVE"] : [])
    ];
    if (tokens.length > 0) {
      const coins = tokens
        .map((token) => token.toLowerCase().replace("$", ""))
        .map((token) => {
          switch (token) {
            case "btc":
              return "binance-wrapped-btc";
            default:
              return token;
          }
        })
        .join(",");
      const values = await getCGMarketApi(coins, "usd");
      Object.entries(values)
        .map(([key, { usd }]) => {
          switch (key) {
            case "binance-wrapped-btc":
              return ["BTC", usd];
            default:
              return [key.toUpperCase(), usd];
          }
        })
        .forEach(([token, value]) => {
          raw = raw.replaceAll(
            `$${token}`,
            renderToString(
              <span className="markdown-currency">
                <span>{token}</span>
                <span className="value">{formattedNumber(value)}</span>
              </span>
            )
          );
        });
    }
    return raw;
  };

  return (
    <div ref={ref} className="thread-item d-flex flex-column border-bottom p-3">
      <div className="thread-item-header">
        <UserAvatar size="deck-item" global={global} username={entry.author} />
        <Link className="username" to={`/@${entry.author}`}>
          {entry.author}
        </Link>
        <div className="host">
          <Link to={`/created/${entry.category}`}>#{entry.parent_author}</Link>
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
    </div>
  );
};
