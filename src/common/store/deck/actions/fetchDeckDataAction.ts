import { Dispatch } from "redux";
import { DeckState, IdentifiableDeckModel } from "../types";
import { _t } from "../../../i18n";
import { getNotifications } from "../../../api/private-api";
import { getAllTrendingTags } from "../../../api/hive";
import { getAccountPosts, getPostsRanked } from "../../../api/bridge";
import { setDataAct, setReloadingAct } from "../acts";
import { fetchTransactions } from "../../transactions/fetchTransactions";
import { search } from "../../../api/search-api";

export const fetchDeckData =
  (title: string) => async (dispatch: Dispatch, getState: () => { deck: DeckState }) => {
    const [deckType, account] = title.split(" @");
    const decks = getState().deck.items;
    const deckToUpdate = decks.find((d: IdentifiableDeckModel) => d.header.title === title);

    if (!deckToUpdate) {
      return;
    }

    dispatch(setReloadingAct({ title: deckToUpdate.header.title, isReloading: true }));

    const isPost =
      deckType.toLocaleLowerCase() === _t("decks.posts").toLocaleLowerCase() ||
      deckType.toLocaleLowerCase() === _t("decks.blogs").toLocaleLowerCase() ||
      deckType.toLocaleLowerCase() === _t("decks.comments").toLocaleLowerCase() ||
      deckType.toLocaleLowerCase() === _t("decks.replies").toLocaleLowerCase();
    const isCommunity = title.includes("hive-");
    if (!isPost && !isCommunity) {
      let res;
      switch (deckType.toLocaleLowerCase()) {
        case _t("decks.notifications").toLocaleLowerCase():
          const type = deckToUpdate.dataFilters.type;
          deckToUpdate.dataParams[1] = type;
          // @ts-ignore
          res = await getNotifications(...deckToUpdate.dataParams);
          dispatch(setDataAct({ title, data: res.map((item) => ({ ...item, deck: true })) }));
          break;
        case _t("decks.search").toLocaleLowerCase():
          if (deckToUpdate.dataParams) {
            const searchParams = deckToUpdate.dataParams[0];
            // @ts-ignore
            res = await search(
              searchParams.q,
              searchParams.sort || "popularity",
              searchParams.hideLow_,
              searchParams.since
            );
            dispatch(setDataAct({ title, data: res.results }));
          }
          break;
        case _t("decks.trending-topics").toLocaleLowerCase():
          res = await getAllTrendingTags();
          dispatch(setDataAct({ title, data: res }));
          break;
        case _t("decks.trending").toLocaleLowerCase():
          res = await getPostsRanked("trending");
          dispatch(setDataAct({ title, data: res }));
          break;
        case _t("decks.wallet").toLocaleLowerCase():
          const group = deckToUpdate.dataFilters.group;
          const transactionsList = await fetchTransactions(account, group);
          dispatch(setDataAct({ title, data: transactionsList }));
          break;
      }
    } else if (isCommunity) {
      // @ts-ignore
      const res = await getPostsRanked(...deckToUpdate.dataParams);
      dispatch(setDataAct({ title, data: res }));
    } else if (isPost) {
      // @ts-ignore
      const res = await getAccountPosts(...deckToUpdate.dataParams);
      dispatch(setDataAct({ title, data: res }));
    }

    dispatch(setReloadingAct({ title: deckToUpdate.header.title, isReloading: false }));
  };
