import React, { useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import i18next from "i18next";
import { BookmarksList } from "@/features/shared/bookmarks/bookmarks-list";
import { FavouritesList } from "@/features/shared/bookmarks/favourites-list";
import { useBookmarksQuery, useFavouritesQuery } from "@/api/queries";
import { useMount } from "react-use";

interface Props {
  onHide: () => void;
}

export function BookmarksDialog({ onHide }: Props) {
  const [section, setSection] = useState("bookmarks");
  const bookmarksQuery = useBookmarksQuery();
  const favouritesQuery = useFavouritesQuery();

  useMount(() => {
    bookmarksQuery.refetch();
    favouritesQuery.refetch();
  });

  return (
    <Modal show={true} centered={true} onHide={onHide} size="lg" className="bookmarks-modal">
      <ModalHeader closeButton={true} />
      <ModalBody>
        <div className="dialog-menu">
          <div
            className={`menu-item ${section === "bookmarks" ? "active" : ""}`}
            onClick={() => setSection("bookmarks")}
          >
            {i18next.t("bookmarks.title")}
          </div>
          <div
            className={`menu-item ${section === "favorites" ? "active" : ""}`}
            onClick={() => setSection("favorites")}
          >
            {i18next.t("favorites.title")}
          </div>
        </div>
        {section === "bookmarks" && <BookmarksList onHide={onHide} />}
        {section === "favorites" && <FavouritesList onHide={onHide} />}
      </ModalBody>
    </Modal>
  );
}
