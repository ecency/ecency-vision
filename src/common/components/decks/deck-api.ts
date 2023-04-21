import axios from "axios";
import { apiBase } from "../../api/helper";
import { getAccessToken } from "../../helper/user-token";
import { DeckGrid, DeckGridItem } from "./types";

interface DeckApiModel {
  _id: string;
  title: string;
  settings: {
    columns: DeckGridItem[];
  };
}

function convertApiToModel(data: DeckApiModel): DeckGrid {
  const [title, icon] = data.title.split("|");
  return {
    key: data._id,
    title,
    icon,
    columns: data.settings.columns ?? [],
    storageType: "account"
  };
}

export const getDecks = (username: string): Promise<DeckGrid[]> =>
  axios
    .post<DeckApiModel[]>(apiBase("/private-api/decks"), {
      code: getAccessToken(username)
    })
    .then((resp) => resp.data)
    .then((decks) => decks.map((d) => convertApiToModel(d)));

export const createDeck = (username: string, deck: DeckGrid): Promise<any[]> =>
  axios
    .post(apiBase("/private-api/decks-add"), {
      code: getAccessToken(username),
      title: `${deck.title}|${deck.icon}`,
      settings: { columns: deck.columns ?? [] }
    })
    .then((resp) => resp.data);

export const updateDeck = (username: string, deck: DeckGrid): Promise<any[]> =>
  axios
    .post(apiBase("/private-api/decks-update"), {
      code: getAccessToken(username),
      id: deck.key,
      title: `${deck.title}|${deck.icon}`,
      settings: { columns: deck.columns ?? [] }
    })
    .then((resp) => resp.data);

export const deleteDeck = (username: string, deck: DeckGrid): Promise<any[]> =>
  axios
    .post(apiBase("/private-api/decks-delete"), {
      code: getAccessToken(username),
      id: deck.key
    })
    .then((resp) => resp.data);
