import { useEffect, useState } from "react";
import React from "react";
import { _t } from "../../../../i18n";
import { useDeckThreadLinkItemCache } from "./deck-thread-link-item-cache";

interface Props {
  link: string;
}

export const DeckThreadLinkItem = ({ link }: Props) => {
  const { addToCache, getFromCache } = useDeckThreadLinkItemCache();

  const [title, setTitle] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedSuccess, setLoadedSuccess] = useState(false);

  useEffect(() => {
    requestData();
  }, []);

  const requestData = async () => {
    if (await attemptToLoadCache()) {
      return;
    }

    try {
      const response = await fetch(link, {
        method: "GET",
        mode: "no-cors"
      });
      const raw = await response.text();
      const pageDOM = document.createElement("html");
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

      const isSuccess = !!description ?? !!image ?? !!title ?? false;
      setLoadedSuccess(isSuccess);

      if (isSuccess) {
        await addToCache(link, { title, image, description });
      }
    } catch (e) {
      console.error(`Failed to fetch post preview in thread: ${link}`);
    }
  };

  const attemptToLoadCache = async () => {
    const cached = await getFromCache(link);
    if (cached) {
      setTitle(cached.title);
      setImage(cached.image);
      setDescription(cached.description);
      setIsLoading(false);
      setLoadedSuccess(true);
      return true;
    }

    return false;
  };

  return isLoading || loadedSuccess ? (
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
  ) : (
    <>{link}</>
  );
};
