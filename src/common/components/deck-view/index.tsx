import React, { useEffect, useState } from "react";
import { connect, useDispatch } from 'react-redux';
import {
  communities,
  globalTrending,
  hot,
  notifications,
  notificationSvg,
  person,
  plusEncircled,
  wallet,
  trelloSvg,
} from "../../img/svg";
import {
  pageMapDispatchToProps,
  pageMapStateToProps,
} from "../../pages/common";
import { DeckAddModal } from "../deck-add-modal";
import ListStyleToggle from "../list-style-toggle";
import { DraggableDeckView, getDecks } from './draggable-deck-view';
import { decks as initialDeckItems } from "./decks.data";
import { HotListItem, SearchListItem } from "../deck/deck-items";
import { getAccountPosts, getPostsRanked } from "../../api/bridge";
import { getAllTrendingTags } from "../../api/hive";
import { TransactionRow } from "../transactions";
import MyTooltip from "../tooltip";
import { getNotifications } from "../../api/private-api";
import { NotificationListItem } from "../notifications";
import { _t } from "../../i18n";
import * as ls from "../../util/local-storage";
import { error } from "../feedback";
import { setDataAct } from '../../store/deck';

export const normalizeHeader = (data: any) => {
  return data.map((item: any) => {
    let icon = person; // Handle conditional icons and listItemComponent
    let listItemComponent: any = SearchListItem; // Handle conditional icons and listItemComponent
    let lowercasedTitle = item.header.title.toLowerCase();
    if (lowercasedTitle.includes(_t("decks.trending-topics").toLowerCase())) {
      icon = hot;
      listItemComponent = HotListItem;
    } else if (lowercasedTitle.includes(_t("decks.trending").toLowerCase())) {
      icon = globalTrending;
      listItemComponent = SearchListItem;
    } else if (lowercasedTitle.includes("hive-")) {
      icon = communities;
      listItemComponent = SearchListItem;
    } else if (
      lowercasedTitle.includes(_t("decks.notifications").toLowerCase())
    ) {
      icon = notificationSvg;
      listItemComponent = NotificationListItem;
    } else if (lowercasedTitle.includes(_t("decks.wallet").toLowerCase())) {
      icon = wallet;
      listItemComponent = TransactionRow;
    }
    return {
      ...item,
      listItemComponent,
      header: {
        ...item.header,
        icon,
      },
    };
  });
};

const DeckViewContainer = ({
  global,
  toggleListStyle,
  fetchTransactions,
  createDeck,
  fetchDeckData,
  deck,
  transactions: { list: transactionsList },
  ...rest
}: any) => {
  const [openModal, setOpenModal] = useState(false);
  const [loadingNewContent, setLoadingNewContent] = useState(false);
  const [user, setUser] = useState((rest.activeUser && rest.activeUser.username) || "");
  // const [decks, setDecks] = useState<any>(getDecks(initialDeckItems, user));
  const dispatch = useDispatch();

  const onSelectColumn = async (account: string, contentType: string) => {
    setOpenModal(false);
    setLoadingNewContent(true);

    if (contentType) {
      let title = `${contentType} @${account}`;
      if (contentType === _t("decks.notifications")) {
        // const res = await getNotifications(user || account, null, null, account);
        // const data = res.map((item) => ({ ...item, deck: true }));
        const dataParams = [user || account, null, null, account];
        // const deckInstance = initDeck(data, NotificationListItem, `${contentType} @${account}`, notifications, dataParams);
        createDeck([NotificationListItem, title, notifications, dataParams]);
        fetchDeckData(title, user);
        // setDecks(getDecks([...decks, deckInstance], user));
        setLoadingNewContent(false);
      } else if (contentType === _t("decks.wallet")) {
        setLoadingNewContent(true);
        fetchTransactions(account);
      } else if (account.includes("hive-")) {
        // const res = await getPostsRanked(contentType, undefined, undefined, undefined, account);
        title = `${_t(`decks.${contentType}`)} @${account}`;
        const dataParams = [contentType, undefined, undefined, undefined, account];
        // setDecks(getDecks([...decks, initDeck(res, SearchListItem, title, communities, dataParams)], user));
        createDeck([SearchListItem, title, communities, dataParams]);
        fetchDeckData(title, user);
        setLoadingNewContent(false);
      } else {
        // const res = await getAccountPosts(
        //   contentType === "blogs" ? "blog" : contentType,
        //   account
        // );
        const dataParams = [contentType === "blogs" ? "blog" : contentType, account];
        // const deckInstance = initDeck(res, SearchListItem, `${contentType} @${account}`, person, dataParams);
        createDeck([SearchListItem, title, person, dataParams]);
        fetchDeckData(title, user);
        // setDecks(getDecks([...decks, deckInstance], user));
        setLoadingNewContent(false);
      }
    } else if (account === _t("decks.trending-topics")) {
      // const res = await getAllTrendingTags();
      const dataParams: any[] = [];
      const title = `${account}`;

      // setDecks(getDecks([...decks, initDeck(res,  HotListItem, `${account}`, hot, dataParams)], user));
      createDeck([HotListItem, title, hot, dataParams]);
      fetchDeckData(title, user);
      setLoadingNewContent(false);
    } else if (account === _t("decks.trending")) {
      const res = await getPostsRanked("trending");
      const dataParams = ["trending"];

      const title = `${account}`;
      // setDecks(getDecks([...decks, initDeck(res, SearchListItem, `${account}`, globalTrending, dataParams)], user));
      createDeck([res, SearchListItem, title, globalTrending, dataParams]);
      fetchDeckData(title, user);

      setLoadingNewContent(false);
    }
  };

  useEffect(() => {
    let draggableContainer = document!.getElementById("draggable-container")!;
    if (loadingNewContent && draggableContainer) {
      draggableContainer.scrollLeft =
        draggableContainer.getBoundingClientRect().width;
    }
  }, [loadingNewContent]);

  const onReloadColumn = async (title: string) => {
    fetchDeckData(title, user);
    setLoadingNewContent(false);
    // let itemToUpdate = deck.find((item: any) => item.header.title === title);
    // let titleSplitted = title.split("@");
    // let indexOfItemToUpdate = decks.indexOf(itemToUpdate);
    // let deckType = titleSplitted[0].trim();
    // let account = titleSplitted[1];
    // let updatedDecks = [...decks];
    // updatedDecks[indexOfItemToUpdate] = {
    //   ...itemToUpdate,
    //   header: { ...itemToUpdate.header, reloading: true },
    // };
    // setDecks(
    //   getDecks(
    //     [...updatedDecks],
    //     (rest.activeUser && rest.activeUser.username) || ""
    //   )
    // );
    // let isPost =
    //   deckType.toLocaleLowerCase() === _t("decks.posts").toLocaleLowerCase() ||
    //   deckType.toLocaleLowerCase() === _t("decks.blogs").toLocaleLowerCase() ||
    //   deckType.toLocaleLowerCase() ===
    //     _t("decks.comments").toLocaleLowerCase() ||
    //   deckType.toLocaleLowerCase() === _t("decks.replies").toLocaleLowerCase();
    // let isCommunity = title.includes("hive-");
    // if (!isPost && !isCommunity) {
    //   let res;
    //   switch (deckType.toLocaleLowerCase()) {
    //     case _t("decks.notifications").toLocaleLowerCase():
    //       res = await getNotifications(rest.activeUser.username, null, null, account);
    //       updatedDecks[indexOfItemToUpdate] = {
    //         data: res.map((item) => ({ ...item, deck: true })),
    //         listItemComponent: NotificationListItem,
    //         header: {
    //           title: title,
    //           icon: notifications,
    //         },
    //       };
    //       setDecks(getDecks([...updatedDecks], (rest.activeUser && rest.activeUser.username) || ""));
    //       setLoadingNewContent(false);
    //       break;
    //     case _t("decks.trending-topics").toLocaleLowerCase():
    //       res = await getAllTrendingTags();
    //       updatedDecks[indexOfItemToUpdate] = {
    //         data: res,
    //         listItemComponent: HotListItem,
    //         header: {
    //           title: title,
    //           icon: hot,
    //         },
    //       };
    //       setDecks(getDecks([...updatedDecks], (rest.activeUser && rest.activeUser.username) || ""));
    //       setLoadingNewContent(false);
    //       break;
    //     case _t("decks.trending").toLocaleLowerCase():
    //       res = await getPostsRanked("trending");
    //       updatedDecks[indexOfItemToUpdate] = {
    //         data: res,
    //         listItemComponent: SearchListItem,
    //         header: {
    //           title: title,
    //           icon: globalTrending,
    //         },
    //       };
    //       setDecks(getDecks([...updatedDecks], (rest.activeUser && rest.activeUser.username) || ""));
    //       setLoadingNewContent(false);
    //       break;
    //     case _t("decks.wallet").toLocaleLowerCase():
    //       fetchTransactions(account);
    //       break;
    //   }
    // } else if (isCommunity) {
    //   const res = await getPostsRanked(
    //     deckType.toLocaleLowerCase(),
    //     undefined,
    //     undefined,
    //     undefined,
    //     account
    //   );
    //   updatedDecks[indexOfItemToUpdate] = {
    //     data: res,
    //     listItemComponent: SearchListItem,
    //     header: {
    //       title: title,
    //       icon: communities,
    //     },
    //   };
    //   setDecks(getDecks([...updatedDecks], (rest.activeUser && rest.activeUser.username) || ""));
    // } else if (isPost) {
    //   let translatedBlogs = _t("decks.blogs").toLocaleLowerCase();
    //   let handledSortWithBlogs =
    //     deckType === translatedBlogs ? "blog" : deckType.toLocaleLowerCase();
    //   const res = await getAccountPosts(handledSortWithBlogs, account);
    //   updatedDecks[indexOfItemToUpdate] = {
    //     data: res,
    //     listItemComponent: SearchListItem,
    //     header: {
    //       title: title,
    //       icon: person,
    //     },
    //   };
    //   setDecks(getDecks([...updatedDecks], (rest.activeUser && rest.activeUser.username) || ""));
    //   setLoadingNewContent(false);
    // }
  };

  const [fetched, setFetched] = useState(false);
  const [currentUser, setCurrentUser] = useState("");

  // useEffect(() => {
  //   let accountName = rest.activeUser && rest.activeUser.username;
  //   if (currentUser !== accountName) {
  //     setFetched(false);
  //     setCurrentUser(accountName);
  //   }
  //   if (!fetched) {
  //     setFetched(true);
  //     setLoadingNewContent(true);
  //     setCurrentUser(accountName);
  //     let defaultDecks: any = [...decks];
  //     if (accountName) {
  //       let cachedDecks = ls.get(`user-${accountName}-decks`);
  //       if (cachedDecks && cachedDecks.length > 0) {
  //         setLoadingNewContent(false);
  //         defaultDecks = [...cachedDecks];
  //         defaultDecks = normalizeHeader(defaultDecks);
  //         setDecks(
  //           getDecks(
  //             [...defaultDecks],
  //             (rest.activeUser && rest.activeUser.username) || ""
  //           )
  //         );
  //       } else {
  //         getAccountPosts("posts", accountName).then((accountData) => {
  //           defaultDecks.push({
  //             data: accountData,
  //             listItemComponent: SearchListItem,
  //             header: {
  //               title: `${_t("decks.posts")} @${accountName}`,
  //               icon: person,
  //             },
  //           });
  //
  //           getNotifications(
  //             rest.activeUser.username,
  //             null,
  //             null,
  //             accountName
  //           ).then((notificationsData) => {
  //             defaultDecks.push({
  //               data: notificationsData.map((item) => {
  //                 return { ...item, deck: true };
  //               }),
  //               listItemComponent: NotificationListItem,
  //               header: {
  //                 title: `${_t("decks.notifications")} @${accountName}`,
  //                 icon: notifications,
  //               },
  //             });
  //             setDecks(
  //               getDecks(
  //                 [...defaultDecks],
  //                 (rest.activeUser && rest.activeUser.username) || ""
  //               )
  //             );
  //             setLoadingNewContent(false);
  //           });
  //         });
  //       }
  //     } else {
  //       let cachedItems = ls.get(`user-unauthed-decks`);
  //       if (cachedItems && cachedItems.length > 0) {
  //         setLoadingNewContent(false);
  //       } else {
  //         getPostsRanked("trending").then((res) => {
  //           defaultDecks.unshift({
  //             data: res,
  //             listItemComponent: SearchListItem,
  //             header: { title: _t("decks.trending"), icon: globalTrending },
  //           });
  //           getAllTrendingTags().then((res) => {
  //             defaultDecks.unshift({
  //               data: res,
  //               listItemComponent: HotListItem,
  //               header: { title: _t("decks.trending-topics"), icon: hot },
  //             });
  //             setDecks(
  //               getDecks(
  //                 defaultDecks,
  //                 (rest.activeUser && rest.activeUser.username) || ""
  //               )
  //             );
  //             setLoadingNewContent(false);
  //           });
  //         });
  //       }
  //     }
  //   }
  // }, [rest.activeUser, fetched]);

  // Prepare wallet deck
  useEffect(() => {
    if (transactionsList && transactionsList.length > 0 && loadingNewContent) {
      setLoadingNewContent(false);
      const firstTransaction = transactionsList[0];
      const title = `${_t("decks.wallet")} @${
        firstTransaction.curator ||
        firstTransaction.to ||
        firstTransaction.delegator ||
        firstTransaction.receiver
      }`;
      createDeck([TransactionRow, title, wallet, []]);
      dispatch(setDataAct({title, data: transactionsList}));
      //   setDecks(
      //     getDecks(
      //       [
      //         ...decks,
      //         {
      //           data: transactionsList,
      //           listItemComponent: TransactionRow,
      //           header: {
      //             title: `${_t("decks.wallet")} @${
      //               firstTransaction.curator ||
      //               firstTransaction.to ||
      //               firstTransaction.delegator ||
      //               firstTransaction.receiver
      //             }`,
      //             icon: wallet,
      //           },
      //         },
      //       ],
      //       (rest.activeUser && rest.activeUser.username) || ""
      //     )
      //   );
      // }
    }
  }, [transactionsList]);

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
        <div className="navbar d-flex flex-column align-items-center pt-5 p-3">
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
            {deck.items.length > 0 && deck.items.map((d: any, index: number) => {
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
                          content={d.header.title.replace(
                            /^./,
                            d.header.title[0].toUpperCase()
                          )}
                        >
                          <img
                            src={avatar}
                            className="w-100 h-100 rounded-circle"
                          />
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
              deck.items.length === 10
                ? error(_t("decks.limit-warning"))
                : setOpenModal(true)
            }
          >
            {plusEncircled}
          </div>
        </div>
        <div className="decks-container d-flex p-5 mt-5 overflow-auto flex-grow-1">
          {deck.items.length === 0 ? (
            <div className="d-flex justify-content-center align-items-center flex-grow-1 w-100 flex-column">
              <span style={{width: 50}}>
                {trelloSvg}
              </span>
              <div className="mt-3">
                <h4>{_t("decks.empty-decks")}</h4>
              </div>
            </div>
          ) : (
            <DraggableDeckView
              {...rest}
              deck={deck}
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

export const DeckView = connect(
  pageMapStateToProps,
  pageMapDispatchToProps
)(DeckViewContainer);
