import React, { useMemo, useRef, useState } from "react";
import { Entry } from "../../store/entries/types";
import { UserAvatar } from "../user-avatar";
import { useMappedStore } from "../../store/use-mapped-store";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import { classNameObject } from "../../helper/class-name-object";
import useClickAway from "react-use/lib/useClickAway";
import { useLocation } from "react-router";
import { History } from "history";
import { dateToRelative } from "../../helper/parse-date";
import { renderPostBody } from "@ecency/render-helper";

interface Props {
  history: History;
  entries: Entry[];
}

export function DiscussionBots({ entries, history }: Props) {
  const { global } = useMappedStore();
  const location = useLocation();

  const contentRef = useRef<HTMLDivElement | null>(null);
  const [host, setHost] = useState<any>();
  const [popperElement, setPopperElement] = useState<any>();
  const [show, setShow] = useState(false);

  const popper = usePopper(host, popperElement);

  const authors = useMemo(
    () =>
      entries
        .reduce<string[]>((acc, e) => (acc.includes(e.author) ? acc : [...acc, e.author]), [])
        .slice(0, 3),
    [entries]
  );

  useClickAway(contentRef, () => setShow(false));

  return (
    <div ref={setHost}>
      <div
        className="flex items-center opacity-50 hover:opacity-100 cursor-pointer"
        onClick={() => setShow(true)}
      >
        {authors.map((e) => (
          <div className="-mr-3" key={e}>
            <UserAvatar size="small" global={global} username={e} />
          </div>
        ))}
      </div>
      {createPortal(
        show ? (
          <div
            ref={setPopperElement}
            className={classNameObject({
              hidden: !show
            })}
            style={popper.styles.popper}
            {...popper.attributes.popper}
          >
            <div
              ref={contentRef}
              className="bg-gray-100 dark:bg-gray-800 dark:text-white p-2 max-w-[280px] max-h-[280px] overflow-y-auto text-sm rounded-2xl border border-(--border-color)"
            >
              {entries.map((e) => (
                <div
                  className="bg-white p-2 border rounded-xl border-(--border-color)"
                  key={e.author + e.permlink}
                >
                  <div className="flex gap-2 justify-between">
                    <div className="flex gap-3 items-center">
                      <UserAvatar global={global} username={e.author} size="small" />
                      <div className="font-bold">{e.author}</div>
                    </div>
                    <div className="text-gray-400 text-xs">{dateToRelative(e.created)}</div>
                  </div>
                  <div dangerouslySetInnerHTML={{ __html: renderPostBody(e) }} />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <></>
        ),
        document.querySelector("#popper-container")!
      )}
    </div>
  );
}
