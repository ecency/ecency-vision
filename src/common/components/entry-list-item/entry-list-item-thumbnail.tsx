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

  const { data: imgGrid, isLoading: isGridLoading } = useImageDownloader(
    entry,
    noImage,
    600,
    500,
    global.listStyle === "grid"
  );
  const { data: imgRow, isLoading: isRowLoading } = useImageDownloader(
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
              alt={isGridLoading ? "" : entry.title}
              style={{ width: imgGrid === noImage ? "172px" : "auto" }}
            />
          ) : (
            <picture>
              <source srcSet={imgRow} media="(min-width: 576px)" />
              <img srcSet={imgRow} alt={isRowLoading ? "" : entry.title} />
            </picture>
          )}
        </div>
      </EntryLink>
    </div>
  );
}
