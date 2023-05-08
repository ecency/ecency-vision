import ReactDOM from "react-dom";
import { UserAvatar } from "../../../user-avatar";
import { DeckThreadLinkItem } from "./deck-thread-link-item";
import { getCGMarketApi } from "../../../market-swap-form/api/coingecko-api";
import { renderToString } from "react-dom/server";
import { _t } from "../../../../i18n";
import formattedNumber from "../../../../util/formatted-number";
import React, { useEffect, useRef } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { renderPostBody } from "@ecency/render-helper";
import { IdentifiableEntry } from "../deck-threads-manager";

interface Props {
  entry: IdentifiableEntry;
  renderInitiated: boolean;
  setRenderInitiated: (v: boolean) => void;
  onResize: () => void;
  height: number | undefined;
}

export const DeckThreadItemBody = ({
  renderInitiated,
  setRenderInitiated,
  entry,
  onResize,
  height
}: Props) => {
  const { global } = useMappedStore();
  const renderAreaRef = useRef<HTMLDivElement | null>(null);

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
    <div className="thread-item-body">
      <div
        ref={renderAreaRef}
        className="thread-render"
        dangerouslySetInnerHTML={{ __html: renderPostBody(entry) }}
      />
    </div>
  );
};
