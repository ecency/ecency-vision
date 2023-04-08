import React, { useEffect, useState } from "react";
import { useNav } from "../../util/use-nav";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { DeckManager } from "./deck-manager";
import { History } from "history";
import { DeckToolbar } from "./deck-toolbar/deck-toolbar";
import { DeckFloatingManager } from "./deck-floating-manager";
import { DeckLoader } from "./deck-loader";

interface Props {
  history: History;
}

export const Decks = ({ history }: Props) => {
  const { setNavShow } = useNav();

  const [isExpanded, setIsExpanded] = useState(false);

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
                {/*<DeckSmoothScroller>*/}
                <DeckGrid history={history} />
                {/*</DeckSmoothScroller>*/}
              </div>
              <DeckFloatingManager />
            </>
          )}
        </div>
      )}
    </DeckManager>
  );
};
