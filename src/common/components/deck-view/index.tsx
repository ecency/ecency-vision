import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import {
  communities,
  globalTrending,
  hot,
  magnify,
  notifications,
  person,
  plusEncircled,
  tags,
  wallet,
} from "../../img/svg";
import {
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "../../pages/common";
import { DeckAddModal } from "../deck-add-modal";
import ListStyleToggle from "../list-style-toggle";
import { DraggableDeckView, getItems } from "./draggable-deck-view";
import { decks as initialDeckItems } from "./decks.data";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import {
  getAccountNotifications,
  getAccountPosts,
  getPostsRanked,
} from "../../api/bridge";
import { getAccountHistory, getFullTrendingTags } from "../../api/hive";
import { TransactionRow } from "../transactions";
import MyTooltip from "../tooltip";
import { Transaction } from "../../store/transactions/types";
import { getNotifications } from "../../api/private-api";
import { NotificationListItem } from "../notifications";
import { _t } from "../../i18n";

const DeckViewContainer = ({
  global,
  toggleListStyle,
  fetchTransactions,
  transactions: { list: transactionsList },
  ...rest
}: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingNewContent, setLoadingNewContent] = useState(false);
  const [decks, setDecks] = useState<any>(getItems(initialDeckItems));

  const onSelectColumn = (account: string, contentType: string) => {
    setOpenModal(false);
    setLoadingNewContent(true);
    if (contentType) {
      if (contentType === _t("decks.notifications")) {
        getNotifications(rest.activeUser.username, null, null, account).then(
          (res) => {
            setDecks(
              getItems([
                ...decks,
                {
                  data: res,
                  listItemComponent: NotificationListItem,
                  header: {
                    title: `${contentType} @${account}`,
                    icon: notifications,
                  },
                },
              ])
            );
            setLoadingNewContent(false);
          }
        );
      } else if (contentType === _t("decks.wallet")) {
        setLoadingNewContent(true);
        fetchTransactions(account);
      } else if (account.includes("hive-")) {
        getPostsRanked(
          contentType,
          undefined,
          undefined,
          undefined,
          account
        ).then((res) => {
          setDecks(
            getItems([
              ...decks,
              {
                data: res,
                listItemComponent: SearchListItem,
                header: {
                  title: `${contentType} @${account}`,
                  icon: communities,
                },
              },
            ])
          );
          setLoadingNewContent(false);
        });
      } else {
        getAccountPosts(contentType, account).then((res) => {
          setDecks(
            getItems([
              ...decks,
              {
                data: res,
                listItemComponent: SearchListItem,
                header: {
                  title: `${contentType} @${account}`,
                  icon: person,
                },
              },
            ])
          );
          setLoadingNewContent(false);
        });
      }
    } else if (account === _t("decks.trending-topics")) {
      getFullTrendingTags().then((res) => {
        setDecks(
          getItems([
            ...decks,
            {
              data: res,
              listItemComponent: HotListItem,
              header: { title: `${account}`, icon: hot },
            },
          ])
        );
        setLoadingNewContent(false);
      });
    } else if (account === _t("decks.trending")) {
      getPostsRanked("trending").then((res) => {
        setDecks(
          getItems([
            ...decks,
            {
              data: res,
              listItemComponent: SearchListItem,
              header: { title: `${account}`, icon: globalTrending },
            },
          ])
        );
        setLoadingNewContent(false);
      });
    }
  };

  const [fetched, setFetched] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  useEffect(() => {
    let accountName = rest.activeUser && rest.activeUser.username;
    if (currentUser !== accountName) {
      setFetched(false);
      setCurrentUser(accountName);
    }
    if (!fetched) {
      setFetched(true);
      setLoadingNewContent(true);
      setCurrentUser(accountName);
      let defaultDecks: any = [...decks];
      if (accountName) {
        getAccountPosts("posts", accountName).then((accountData) => {
          defaultDecks.push({
            data: accountData,
            listItemComponent: SearchListItem,
            header: {
              title: `${_t("decks.posts")} @${accountName}`,
              icon: person,
            },
          });

          getNotifications(
            rest.activeUser.username,
            null,
            null,
            accountName
          ).then((notificationsData) => {
            defaultDecks.push({
              data: notificationsData,
              listItemComponent: NotificationListItem,
              header: {
                title: `${_t("decks.notifications")} @${accountName}`,
                icon: notifications,
              },
            });
            setDecks(getItems([...defaultDecks]));
            setLoadingNewContent(false);
          });
        });
      } else {
        getPostsRanked("trending").then((res) => {
          defaultDecks.unshift({
            data: res,
            listItemComponent: SearchListItem,
            header: { title: _t("decks.trending"), icon: globalTrending },
          });
          getFullTrendingTags().then((res) => {
            defaultDecks.unshift({
              data: res,
              listItemComponent: HotListItem,
              header: { title: _t("decks.trending-topics"), icon: hot },
            });
            setDecks(getItems(defaultDecks));
            setLoadingNewContent(false);
          });
        });
      }
    }
  }, [rest.activeUser, fetched]);

  useEffect(() => {
    if (transactionsList && transactionsList.length > 0 && loadingNewContent) {
      setLoadingNewContent(false);
      let firstTransaction = transactionsList[0];
      setDecks(
        getItems([
          ...decks,
          {
            data: transactionsList,
            listItemComponent: TransactionRow,
            header: {
              title: `${_t("decks.wallet")} @${
                firstTransaction.curator ||
                firstTransaction.to ||
                firstTransaction.delegator ||
                firstTransaction.receiver
              }`,
              icon: wallet,
            },
          },
        ])
      );
    }
  }, [transactionsList]);

  return (
    <>
      <DeckAddModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSelect={onSelectColumn}
        currentlyActivatedOptions={decks}
      />
      <div className="d-flex flex-grow-1">
        <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
          <div className="mt-5 my-icons-5 cursor-pointer">
            <ListStyleToggle
              global={global}
              toggleListStyle={toggleListStyle}
              iconClass="menu-icon"
              float="left"
            />
          </div>
          {decks &&
            decks.length > 0 &&
            decks.map((deck: any, index: number) => {
              let avatar = deck.header.title.split("@")[1];
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
                  key={deck.header.title + index}
                  onClick={() => {
                    let elementToFocus = document!.getElementById(deck.id);
                    let toScrollValue =
                      elementToFocus!.getBoundingClientRect().left;
                    elementToFocus?.classList.add("active-deck");
                    setTimeout(() => {
                      elementToFocus?.classList.remove("active-deck");
                    }, 5000);

                    document!.getElementById(
                      "draggable-container"
                    )!.scrollLeft = toScrollValue;
                  }}
                >
                  {avatar && (
                    <div className="position-absolute avatar-xs rounded-circle">
                      <MyTooltip
                        content={deck.header.title.replace(
                          /^./,
                          deck.header.title[0].toUpperCase()
                        )}
                      >
                        <img
                          src={avatar}
                          className="w-100 h-100 rounded-circle"
                        />
                      </MyTooltip>
                    </div>
                  )}
                  {deck.header.icon}
                </div>
              );
            })}

          {/* Need this comment to use icon names when working on advanced options
          <div className="cursor-pointer">{magnify}</div>
          <div className="cursor-pointer">{tags}</div> */}
          <div
            className="my-icons-5 cursor-pointer"
            onClick={() => setOpenModal(true)}
          >
            {plusEncircled}
          </div>
        </div>
        <div className="decks-container d-flex p-5 mt-5 overflow-auto flex-grow-1">
          <DraggableDeckView
            decks={decks}
            setDecks={setDecks}
            {...rest}
            global={global}
            toggleListStyle={toggleListStyle}
            loading={loadingNewContent}
          />
        </div>
      </div>
    </>
  );
};

export const DeckView = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckViewContainer);
