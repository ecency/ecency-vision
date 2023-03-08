import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  communities,
  globalTrending,
  hot,
  notifications,
  person,
  plusEncircled,
  wallet,
  trelloSvg
} from "../../img/svg";
import { pageMapDispatchToProps, pageMapStateToProps } from "../../pages/common";
import { DeckAddModal } from "../deck-add-modal";
import ListStyleToggle from "../list-style-toggle";
import { DraggableDeckView } from "./draggable-deck-view";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import { TransactionRow } from "../transactions";
import MyTooltip from "../tooltip";
import NotificationListItem from "../notifications/notification-list-item";
import { _t } from "../../i18n";
import { error } from "../feedback";
import { IdentifiableDeckModel } from "./types";
import "./_index.scss";

const DeckViewContainer = ({
  global,
  toggleListStyle,
  fetchTransactions,
  createDeck,
  fetchDeckData,
  deleteDeck,
  loadDeckFromStorage,
  reorderDecks,
  deck,
  ...rest
}: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingNewContent, setLoadingNewContent] = useState(false);
  const [user, setUser] = useState(null);
  const [fetched, setFetched] = useState(true);

  const onSelectColumn = async (account: string, contentType: string) => {
    setOpenModal(false);
    setLoadingNewContent(true);
    setUser(rest.activeUser && rest.activeUser.username);

    if (contentType) {
      let title = `${contentType} @${account}`;
      if (contentType === _t("decks.notifications")) {
        const dataParams = [user || account, null, null, account];
        createDeck([NotificationListItem, title, notifications, dataParams], user);
        fetchDeckData(title);
        setLoadingNewContent(false);
      } else if (contentType === _t("decks.wallet")) {
        createDeck([TransactionRow, title, wallet, []], user);
        setLoadingNewContent(false);
        fetchDeckData(title);
      } else if (account.includes("hive-")) {
        title = `${_t(`decks.${contentType}`)} @${account}`;
        const dataParams = [contentType, undefined, undefined, undefined, account];
        createDeck([SearchListItem, title, communities, dataParams], user);
        fetchDeckData(title);
        setLoadingNewContent(false);
      } else {
        const dataParams = [contentType === "blogs" ? "blog" : contentType, account];
        createDeck([SearchListItem, title, person, dataParams], user);
        fetchDeckData(title);
        setLoadingNewContent(false);
      }
    } else if (account === _t("decks.trending-topics")) {
      const dataParams: any[] = [];
      const title = `${account}`;

      createDeck([HotListItem, title, hot, dataParams], user);
      fetchDeckData(title);
      setLoadingNewContent(false);
    } else if (account === _t("decks.trending")) {
      const dataParams = ["trending"];

      const title = `${account}`;
      createDeck([SearchListItem, title, globalTrending, dataParams], user);
      fetchDeckData(title);

      setLoadingNewContent(false);
    }
  };

  useEffect(() => {
    let draggableContainer = document!.getElementById("draggable-container")!;
    if (loadingNewContent && draggableContainer) {
      draggableContainer.scrollLeft = draggableContainer.getBoundingClientRect().width;
    }
  }, [loadingNewContent]);

  useEffect(() => {
    if (rest.activeUser && rest.activeUser.username !== user) {
      setUser(rest.activeUser.username);
    }
  }, [rest.activeUser]);

  const onReloadColumn = async (title: string) => {
    setUser(rest.activeUser && rest.activeUser.username);
    await fetchDeckData(title);
    setLoadingNewContent(false);
  };

  // Load decks from storage
  useEffect(() => {
    loadDeckFromStorage(user, {
      SearchListItem,
      HotListItem,
      NotificationListItem,
      TransactionRow
    });
    setFetched(false);
  }, [user]);

  useEffect(() => {
    const items = deck.items as IdentifiableDeckModel[];
    if (!fetched && items.length) {
      items.forEach(({ header: { title } }) => fetchDeckData(title));
      setFetched(true);
    }
  }, [deck.items]);

  return (
    <>
      <DeckAddModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelect={onSelectColumn}
        currentlyActivatedOptions={deck.items}
        activeUser={rest.activeUser}
      />
      <div className="d-flex flex-grow-1 deck-view">
        <div className="navbar d-flex flex-column align-items-center pt-5 p-1">
          <div className="mt-5 my-icons-5 cursor-pointer">
            <ListStyleToggle
              global={global}
              toggleListStyle={toggleListStyle}
              iconClass="menu-icon"
              float="left"
              deck={true}
            />
          </div>
          <div className="d-flex flex-column align-items-center sidebar-icons-wrapper">
            {deck.items.length > 0 &&
              deck.items.map((d: any, index: number) => {
                let avatar = d.header.title.split("@")[1];
                if (avatar) {
                  avatar = `https://images.ecency.com/${
                    global.canUseWebp ? "webp/" : ""
                  }u/${avatar}/avatar/medium`;
                }

                return (
                  <div
                    className={`${
                      index % 2 === 1 ? "my-icons-5 " : ""
                    }cursor-pointer position-relative`}
                    key={d.header.title + index}
                    onClick={() => {
                      let elementToFocus = document!.getElementById(d.id);
                      let toScrollValue = elementToFocus!.getBoundingClientRect().left;
                      elementToFocus?.classList.add("active-deck");
                      setTimeout(() => {
                        elementToFocus?.classList.remove("active-deck");
                      }, 5000);

                      document!.getElementById("draggable-container")!.scrollLeft = toScrollValue;
                    }}
                  >
                    {avatar && (
                      <div className="position-absolute avatar-xs rounded-circle">
                        <MyTooltip
                          content={d.header.title.replace(/^./, d.header.title[0].toUpperCase())}
                        >
                          <img src={avatar} className="w-100 h-100 rounded-circle" />
                        </MyTooltip>
                      </div>
                    )}
                    {d.header.icon}
                  </div>
                );
              })}
          </div>

          {/* Need this comment to use icon names when working on advanced options
          <div className="cursor-pointer">{magnify}</div>
          <div className="cursor-pointer">{tags}</div> */}

          <div
            className="my-icons-5 cursor-pointer"
            onClick={() =>
              deck.items.length === 10 ? error(_t("decks.limit-warning")) : setOpenModal(true)
            }
          >
            {plusEncircled}
          </div>
        </div>
        <div className="decks-container d-flex pt-5 pb-3 mt-5 overflow-auto flex-grow-1">
          {deck.items.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1 w-100 flex-column">
              <span style={{ width: 50 }}>{trelloSvg}</span>
              <div className="mt-3">
                <h4>{_t("decks.empty-decks")}</h4>
              </div>
            </div>
          ) : (
            <DraggableDeckView
              {...rest}
              deck={deck}
              reorderDecks={reorderDecks}
              deleteDeck={deleteDeck}
              user={user}
              global={global}
              toggleListStyle={toggleListStyle}
              loading={loadingNewContent}
              onReloadColumn={onReloadColumn}
            />
          )}
        </div>
      </div>
    </>
  );
};

export const DeckView = connect(pageMapStateToProps, pageMapDispatchToProps)(DeckViewContainer);
