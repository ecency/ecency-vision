import React, { useEffect } from "react";
import { useNav } from "../../util/use-nav";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { DeckManager } from "./deck-manager";
import { History } from "history";
import { DeckToolbar } from "./deck-toolbar/deck-toolbar";
import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../util/local-storage";
import { DeckFloatingManager } from "./deck-floating-manager";
import { DeckLoader } from "./deck-loader";

interface Props {
  history: History;
}

export const Decks = ({ history }: Props) => {
  const { setNavShow } = useNav();

  const [isExpanded, setIsExpanded] = useLocalStorage(PREFIX + "_de", false);

  useEffect(() => {
    setNavShow(false);
  }, []);

  return (
    <DeckManager>
      {({ isDecksLoading }) => (
        <div className={"decks w-100 " + (isExpanded ? "expanded" : "")}>
          <DeckToolbar history={history} isExpanded={!!isExpanded} setIsExpanded={setIsExpanded} />
          {isDecksLoading ? (
            <DeckLoader />
          ) : (
            <>
              <div className="decks-container w-100">
                <DeckGrid history={history} />
              </div>
              <DeckFloatingManager />
            </>
          )}
        </div>
      )}
    </DeckManager>
  );
};
