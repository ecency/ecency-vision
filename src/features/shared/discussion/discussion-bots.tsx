import React, { useMemo, useRef, useState } from "react";
import { UserAvatar } from "../user-avatar";
import { createPortal } from "react-dom";
import { usePopper } from "react-popper";
import useClickAway from "react-use/lib/useClickAway";
import { renderPostBody } from "@ecency/render-helper";
import { EntryLink } from "../entry-link";
import { Entry } from "@/entities";
import { classNameObject } from "@ui/util";
import { dateToRelative } from "@/utils";
import { ProfileLink } from "@/features/shared";

interface Props {
  entries: Entry[];
}

export function DiscussionBots({ entries }: Props) {
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
            <UserAvatar size="small" username={e} />
          </div>
        ))}
      </div>
      {createPortal(
        show ? (
          <div
            ref={setPopperElement}
            className={classNameObject({
              hidden: !show,
              "z-20": true
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
                  <div className="flex items-center gap-3 justify-between">
                    <ProfileLink username={e.author}>
                      <div className="flex gap-3 items-center">
                        <UserAvatar username={e.author} size="small" />
                        <div className="font-bold">{e.author}</div>
                      </div>
                    </ProfileLink>
                    <EntryLink entry={e}>
                      <div className="text-gray-400 text-xs">{dateToRelative(e.created)}</div>
                    </EntryLink>
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
