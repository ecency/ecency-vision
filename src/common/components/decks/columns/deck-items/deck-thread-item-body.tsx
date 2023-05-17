import { createPortal } from "react-dom";
import { getCGMarketApi } from "../../../market-swap-form/api/coingecko-api";
import { renderToString } from "react-dom/server";
import { _t } from "../../../../i18n";
import formattedNumber from "../../../../util/formatted-number";
import React, { useEffect, useRef, useState } from "react";
import { useMappedStore } from "../../../../store/use-mapped-store";
import { renderPostBody } from "@ecency/render-helper";
import { IdentifiableEntry } from "../deck-threads-manager";
import { classNameObject } from "../../../../helper/class-name-object";
import {
  renderAuthors,
  renderExternalLinks,
  renderImages,
  renderPostLinks,
  renderTags,
  renderVideos
} from "./deck-thread-item-body-render-helper";

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

  const [currentViewingImage, setCurrentViewingImage] = useState<string | null>(null);
  const [currentViewingImageRect, setCurrentViewingImageRect] = useState<DOMRect | null>(null);
  const [isCurrentViewingImageShowed, setIsCurrentViewingImageShowed] = useState(false);

  useEffect(() => {
    if (currentViewingImage) {
      setTimeout(() => {
        setIsCurrentViewingImageShowed(true);
      }, 1);
    }
  }, [currentViewingImage]);

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

    renderTags(renderAreaRef);
    renderAuthors(renderAreaRef, global);
    renderPostLinks(renderAreaRef);
    renderExternalLinks(renderAreaRef);
    renderImages(renderAreaRef, {
      setCurrentViewingImageRect,
      setCurrentViewingImage
    });
    renderVideos(renderAreaRef);
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
        dangerouslySetInnerHTML={{ __html: renderPostBody(entry, true, global.canUseWebp) }}
      />
      {currentViewingImage &&
        createPortal(
          <div
            className={classNameObject({
              "deck-full-image-view": true,
              show: isCurrentViewingImageShowed
            })}
            onClick={(e) => {
              e.stopPropagation();

              setIsCurrentViewingImageShowed(false);
              setTimeout(() => {
                setCurrentViewingImageRect(null);
                setCurrentViewingImage(null);
              }, 400);
            }}
          >
            <img
              src={currentViewingImage}
              alt=""
              style={{
                transform: `translate(${currentViewingImageRect?.left}px, ${currentViewingImageRect?.top}px)`,
                width: currentViewingImageRect?.width,
                height: currentViewingImageRect?.height
              }}
            />
          </div>,
          document.querySelector("#deck-media-view-container")!!
        )}
    </div>
  );
};
