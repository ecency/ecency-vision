import { useEffect, useState } from "react";
import React from "react";
import _ from "lodash";
import { proxifyImageSrc } from "@ecency/render-helper";
import { _t } from "../../../../i18n";

interface Props {
  author: string;
  permlink: string;
}

export const DeckThreadPostItem = ({ author, permlink }: Props) => {
  const [title, setTitle] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    requestData();
  }, []);

  const requestData = async () => {
    const response = await fetch(`@${author}/${permlink}`, {
      method: "GET"
    });
    const raw = await response.text();
    const pageDOM = document.createElement("body");
    pageDOM.innerHTML = raw;

    const title =
      pageDOM.querySelector(`meta[property="og:title"]`)?.getAttribute("content") ?? null;
    const image =
      pageDOM.querySelector(`meta[property="og:image"]`)?.getAttribute("content") ?? null;
    const description =
      pageDOM.querySelector(`meta[property="og:description"]`)?.getAttribute("content") ?? null;

    setTitle(title);
    setImage(image);
    setDescription(description);
    setIsLoading(false);
  };

  return (
    <div className="deck-thread-post-item">
      {isLoading ? (
        <div className="image mb-3" />
      ) : (
        <div className="image mb-3" style={{ backgroundImage: `url(${image})` }} />
      )}
      <div className={"title mb-1 " + (isLoading ? "loading" : "")}>
        {isLoading ? "" : title ?? _t("decks.columns.thread-post-invalid")}
      </div>
      <div className={"description " + (isLoading ? "loading" : "")}>{description ?? ""}</div>
    </div>
  );
};
