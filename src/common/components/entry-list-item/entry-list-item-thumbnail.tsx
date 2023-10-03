import React from "react";
import { useMappedStore } from "../../store/use-mapped-store";
import { Entry } from "../../store/entries/types";
import { EntryLink } from "../entry-link";
import { History } from "history";
import { useImageDownloader } from "../../api/queries";

interface Props {
  entry: Entry;
  noImage: string;
  isCrossPost: boolean;
  entryProp: Entry;
  history: History;
}

export function EntryListItemThumbnail({ entry, noImage, isCrossPost, entryProp, history }: Props) {
  const { global } = useMappedStore();

  const { data: imgGrid } = useImageDownloader(
    entry,
    noImage,
    600,
    500,
    global.listStyle === "grid"
  );
  const { data: imgRow } = useImageDownloader(
    entry,
    noImage,
    260,
    200,
    global.listStyle !== "grid"
  );

  return (
    <div className={"item-image " + (imgRow === noImage ? "noImage" : "")}>
      <EntryLink entry={isCrossPost ? entryProp : entry} history={history}>
        <div>
          {global.listStyle === "grid" ? (
            <img
              src={imgGrid}
              alt={entry.title}
              style={{ width: imgGrid === noImage ? "172px" : "auto" }}
              onError={(e: React.SyntheticEvent) => {
                const target = e.target as HTMLImageElement;
                target.src = global.isElectron
                  ? "./img/fallback.png"
                  : require("../../img/fallback.png");
              }}
            />
          ) : (
            <picture>
              <source srcSet={imgRow} media="(min-width: 576px)" />
              <img
                srcSet={imgGrid}
                alt={entry.title}
                onError={(e: React.SyntheticEvent) => {
                  const target = e.target as HTMLImageElement;
                  target.src = global.isElectron
                    ? "./img/fallback.png"
                    : require("../../img/fallback.png");
                }}
              />
            </picture>
          )}
        </div>
      </EntryLink>
    </div>
  );
}
