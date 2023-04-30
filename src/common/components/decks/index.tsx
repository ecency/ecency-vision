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
import { DeckThreadsFormManager } from "./deck-threads-form/deck-threads-form-manager";
import { DeckThreadsForm } from "./deck-threads-form";

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
        <DeckThreadsFormManager>
          {({ show: showThreadsForm }) => (
            <div
              className={
                "decks w-100 " +
                (isExpanded ? "expanded " : "") +
                (showThreadsForm ? "thread-form-showed" : "")
              }
            >
              <DeckToolbar
                history={history}
                isExpanded={isExpanded}
                setIsExpanded={setIsExpanded}
              />
              <DeckThreadsForm className={showThreadsForm ? "show" : ""} />
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
        </DeckThreadsFormManager>
      )}
    </DeckManager>
  );
};
