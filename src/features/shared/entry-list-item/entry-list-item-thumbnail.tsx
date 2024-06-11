import React from "react";
import { Entry } from "@/entities";
import { useGlobalStore } from "@/core/global-store";
import { useImageDownloader } from "@/api/queries";
import { EntryLink } from "@/features/shared";
import Image from "next/image";

interface Props {
  entry: Entry;
  noImage: string;
  isCrossPost: boolean;
  entryProp: Entry;
}

export function EntryListItemThumbnail({ entry, noImage, isCrossPost, entryProp }: Props) {
  const listStyle = useGlobalStore((state) => state.listStyle);

  const { data: imgGrid, isLoading: isGridLoading } = useImageDownloader(
    entry,
    noImage,
    600,
    500,
    listStyle === "grid"
  );
  const { data: imgRow, isLoading: isRowLoading } = useImageDownloader(
    entry,
    noImage,
    260,
    200,
    listStyle !== "grid"
  );

  return (
    <div className={"item-image " + (imgRow === noImage ? "noImage" : "")}>
      <EntryLink entry={isCrossPost ? entryProp : entry}>
        <div>
          {listStyle === "grid" ? (
            <Image
              className="w-full mx-auto"
              src={imgGrid ?? noImage}
              alt={isGridLoading ? "" : entry.title}
              style={{ width: imgGrid === noImage ? "172px" : "100%" }}
            />
          ) : (
            <picture>
              <source srcSet={imgRow} media="(min-width: 576px)" />
              <img className="w-full" srcSet={imgRow} alt={isRowLoading ? "" : entry.title} />
            </picture>
          )}
        </div>
      </EntryLink>
    </div>
  );
}
