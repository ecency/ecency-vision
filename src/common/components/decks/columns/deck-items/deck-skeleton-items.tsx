import React from "react";

export const ListItemSkeleton = () => {
  return (
    <div className="list-item-skeleton border-bottom p-3">
      <div className="avatar" />
      <div className="username" />
      <div className="date" />
      <div className="title" />
      <div className="media-image" />
      <div className="description" />
      <div className="actions" />
    </div>
  );
};

export const ShortListItemSkeleton = () => {
  return (
    <div className="list-item-skeleton wallet-list-item-skeleton border-bottom p-3">
      <div className="avatar" />
      <div className="username" />
      <div className="date" />
      <div className="title" />
    </div>
  );
};

export const DeckThreadItemSkeleton = () => {
  return (
    <div className="list-item-skeleton thread-item-skeleton border-bottom p-3">
      <div className="avatar" />
      <div className="username" />
      <div className="date" />
      <div className="title" />
      <div className="description" />
      <div className="actions" />
    </div>
  );
};
