import React, { useEffect, useState } from "react";
import { DEFAULT_LAYOUT } from "./consts";
import { DeckGrid, DeckGridItem, DeckGrids } from "./types";
import uuid from "uuid";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import { createDeck, getDecks, updateDeck } from "./deck-api";
import { useMappedStore } from "../../store/use-mapped-store";
import usePrevious from "react-use/lib/usePrevious";

interface Context {
  layout: DeckGrid;
  decks: DeckGrids;
  activeDeck: string;
  add: (column: Omit<DeckGridItem, "id">) => void;
  reOrder: (originalIndex: number, nextIndex: number) => void;
  scrollTo: (key: DeckGridItem["key"]) => void;
  setActiveDeck: (key: string) => void;
  pushOrUpdateDeck: (deck: DeckGrid) => void;
}

export const DeckGridContext = React.createContext<Context>({
  activeDeck: "",
  layout: DEFAULT_LAYOUT[0],
  decks: DEFAULT_LAYOUT,
  add: () => {},
  reOrder: () => {},
  scrollTo: () => {},
  setActiveDeck: () => {},
  pushOrUpdateDeck: () => {}
});

interface Props {
  children: (context: Context) => JSX.Element;
}

export const DeckManager = ({ children }: Props) => {
  const { activeUser } = useMappedStore();
  const [localDecks, setLocalDecks] = useLocalStorage(PREFIX + "_d", DEFAULT_LAYOUT);

  const [decks, setDecks] = useState(localDecks ?? DEFAULT_LAYOUT);
  const [activeDeck, setActiveDeck] = useState(decks.decks[0].key);
  const [layout, setLayout] = useState(decks.decks[0]);
  const previousLayout = usePrevious(layout);

  useEffect(() => {
    fetchDecks();
  }, []);

  // Save active deck after column re-arrange
  useEffect(() => {
    if (previousLayout?.key === activeDeck) {
      if (activeUser && layout.storageType === "account") {
        updateDeck(activeUser.username, layout);
      } else {
        const localDecksSnapshot = { decks: [...localDecks?.decks] };
        const existingDeckIndex = localDecksSnapshot.decks.findIndex((d) => d.key === activeDeck);
        if (existingDeckIndex > -1) {
          localDecksSnapshot.decks[existingDeckIndex] = layout;
          setLocalDecks(localDecksSnapshot);
        }
      }
    }
  }, [layout]);

  useEffect(() => {
    const deck = decks.decks.find((d) => d.key === activeDeck);
    if (deck) {
      setLayout(deck);
    }
  }, [activeDeck]);

  const fetchDecks = async () => {
    if (activeUser) {
      const accountDecks = await getDecks(activeUser?.username);
      setDecks({
        decks: [...accountDecks, ...decks.decks]
      });
      setActiveDeck(accountDecks[0].key);
    }
  };

  const getNextKey = () => Math.max(...layout.columns.map((c: DeckGridItem) => c.key)) + 1;

  const add = (column: Omit<DeckGridItem, "id">) => {
    const layoutSnapshot = { ...layout, columns: [...layout.columns] };
    const existingColumnIndex = layoutSnapshot.columns.findIndex((c) => c.key === column.key);
    if (existingColumnIndex > -1) {
      layoutSnapshot.columns[existingColumnIndex] = {
        id: layoutSnapshot.columns[existingColumnIndex].id,
        ...column
      };
    } else {
      column.key = getNextKey();
      layoutSnapshot.columns.push({
        id: uuid.v4(),
        ...column
      });
    }
    setLayout(layoutSnapshot);
  };

  const reOrder = (originalIndex: number, newIndex: number) => {
    if (newIndex === originalIndex) {
      return;
    }

    const hasOriginalIndexColumn = layout.columns[originalIndex] !== undefined;

    if (hasOriginalIndexColumn) {
      const layoutSnapshot = { ...layout, columns: [...layout.columns] };
      const [column] = layoutSnapshot.columns.splice(originalIndex, 1);

      layoutSnapshot.columns.splice(newIndex, 0, column);

      setLayout(layoutSnapshot);
    }
  };

  const scrollTo = (key: number) => {
    document.getElementById(`${key - 1}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const pushOrUpdateDeck = async (deck: DeckGrid) => {
    const decksSnapshot = decks.decks;
    const existingDeckIndex = decksSnapshot.findIndex((d) => d.key === deck.key);
    if (existingDeckIndex > -1) {
      decksSnapshot[existingDeckIndex] = deck;
    } else {
      decksSnapshot.push(deck);
      if (activeUser && deck.storageType === "account") {
        await createDeck(activeUser?.username, deck);
      } else {
        setLocalDecks({ decks: decksSnapshot.filter((d) => d.storageType === "local") });
      }
    }

    setDecks({ decks: decksSnapshot });
  };

  return (
    <DeckGridContext.Provider
      value={{
        decks,
        layout,
        add,
        reOrder,
        scrollTo,
        activeDeck,
        setActiveDeck,
        pushOrUpdateDeck
      }}
    >
      {children({
        layout,
        add,
        reOrder,
        scrollTo,
        setActiveDeck,
        activeDeck,
        decks,
        pushOrUpdateDeck
      })}
    </DeckGridContext.Provider>
  );
};
