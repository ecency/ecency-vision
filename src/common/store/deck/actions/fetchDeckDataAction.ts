import { Dispatch } from 'redux';
import { AppState } from '../../index';
import { IdentifiableDeckModel } from '../types';
import { _t } from '../../../i18n';
import { getNotifications } from '../../../api/private-api';
import { getAllTrendingTags } from '../../../api/hive';
import { getAccountPosts, getPostsRanked } from '../../../api/bridge';
import { setDataAct, setReloadingAct } from '../index';
import { fetchTransactions } from '../../transactions';

export const fetchDeckData = (title: string) => async (dispatch: Dispatch, getState: () => AppState) => {
  const [deckType, account] = title.split(" @");
  const decks = getState().deck.items;
  const deckToUpdate = decks.find((d: IdentifiableDeckModel) => d.header.title === title);

  if  (!deckToUpdate) {
    return;
  }

  dispatch(setReloadingAct({ title: deckToUpdate.header.title, isReloading: true }));

  const isPost =
    deckType.toLocaleLowerCase() === _t("decks.posts").toLocaleLowerCase() ||
    deckType.toLocaleLowerCase() === _t("decks.blogs").toLocaleLowerCase() ||
    deckType.toLocaleLowerCase() ===
    _t("decks.comments").toLocaleLowerCase() ||
    deckType.toLocaleLowerCase() === _t("decks.replies").toLocaleLowerCase();
  const isCommunity = title.includes("hive-");
  if (!isPost && !isCommunity) {
    let res;
    switch (deckType.toLocaleLowerCase()) {
      case _t("decks.notifications").toLocaleLowerCase():
        // @ts-ignore
        res = await getNotifications(...deckToUpdate.dataParams);
        dispatch(setDataAct({ title, data: res.map((item) => ({ ...item, deck: true })) }));
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
        // todo not working
        fetchTransactions(account);
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
}
