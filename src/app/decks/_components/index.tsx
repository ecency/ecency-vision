"use client";

import React, { useState } from "react";
import "./_deck.scss";
import "./_index.scss";
import { DeckGrid } from "./deck-grid";
import { DeckManager } from "./deck-manager";
import { DeckToolbar } from "./deck-toolbar/deck-toolbar";
import { DeckFloatingManager } from "./deck-floating-manager";
import { DeckLoader } from "./deck-loader";
import { DeckThreadsForm, DeckThreadsFormManager } from "./deck-threads-form";
import { DeckThreadsManager } from "./columns/deck-threads-manager";
import useMount from "react-use/lib/useMount";
import { DeckFloatingToolbarActivator } from "./deck-toolbar/deck-floating-toolbar-activator";
import { useNav } from "@/utils";
import { PollsManager } from "@/features/polls";
import { classNameObject } from "@ui/util";

export const Decks = () => {
  const { setNavShow } = useNav();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useMount(() => {
    setNavShow(false);
  });

  useMount(() => {
    if (window.innerWidth <= 576) {
      setIsCollapsed(true);
    }
  });

  return (
    <DeckManager>
      {({ isDecksLoading }) => (
        <DeckThreadsManager>
          <PollsManager>
            <DeckThreadsFormManager>
              {({ show: showThreadsForm }) => (
                <div
                  className={classNameObject({
                    "decks grid grid-cols-deck items-center duration-300": true,
                    "w-full": !isCollapsed,
                    expanded: isExpanded,
                    "toolbar-collapsed translate-x-[-72px] w-[calc(100%+72px)] sm:translate-x-0 sm:w-[auto]":
                      isCollapsed,
                    "thread-form-showed": showThreadsForm
                  })}
                >
                  <DeckFloatingToolbarActivator
                    open={!isCollapsed}
                    setOpen={(v) => setIsCollapsed(!v)}
                  />
                  <DeckToolbar isExpanded={isExpanded} setIsExpanded={setIsExpanded} />
                  <DeckThreadsForm className={showThreadsForm ? "show" : ""} persistable={true} />
                  {isDecksLoading ? (
                    <DeckLoader />
                  ) : (
                    <>
                      <div className="decks-container w-full overflow-hidden">
                        {/*<DeckSmoothScroller>*/}
                        <DeckGrid />
                        {/*</DeckSmoothScroller>*/}
                      </div>
                      <DeckFloatingManager />
                    </>
                  )}
                </div>
              )}
            </DeckThreadsFormManager>
          </PollsManager>
        </DeckThreadsManager>
      )}
    </DeckManager>
  );
};
