"use client";

import React, { CSSProperties, useEffect, useRef, useState } from "react";
import "./_index.scss";
import { classNameObject } from "@ui/util";
import useClickAway from "react-use/lib/useClickAway";
import i18next from "i18next";
import { useRouter } from "next/navigation";
import useMount from "react-use/lib/useMount";
import { usePrevious } from "react-use";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  items: any[];
  modeItems?: any[];
  header?: string;
  containerClassName?: string;
  renderer?: (item: any) => JSX.Element;
  onSelect?: (item: any) => void;
  children: JSX.Element;
  searchValue?: string;
  ignoreFirstInputFocus?: boolean;
  listStyle?: CSSProperties;
}

export function SuggestionList({
  children,
  containerClassName,
  modeItems,
  items,
  listStyle,
  header,
  searchValue,
  renderer,
  onSelect,
  ignoreFirstInputFocus
}: Props) {
  const parentRef = useRef<HTMLDivElement | null>(null);
  const clickAwayRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();

  const [showList, setShowList] = useState(false);

  const previousModeItems = usePrevious(modeItems);

  useMount(() => {
    document.addEventListener("keydown", watchKb);
    document.addEventListener("click", watchClick);

    const input = getPossibleInput();
    if (input) {
      if (input === document.activeElement && !ignoreFirstInputFocus) {
        setShowList(true);
      }

      if (ignoreFirstInputFocus) {
        input.blur();
      }

      input.addEventListener("focus", watchInputFocus);
    }
  });

  useUnmount(() => {
    document.removeEventListener("keydown", watchKb);
    document.removeEventListener("click", watchClick);

    const input = getPossibleInput();
    if (input) {
      input.removeEventListener("focus", watchInputFocus);
    }
  });

  useClickAway(clickAwayRef, () => setShowList(false));

  useEffect(() => {
    if (previousModeItems !== modeItems && modeItems && modeItems.length > 0) {
      setShowList(true);
    }
  }, [previousModeItems, modeItems]);

  const getPossibleInput = () =>
    parentRef.current?.querySelector("input[type='text']") as HTMLInputElement | null;
  const focusItem = (index: number) =>
    (parentRef.current?.querySelectorAll(".list-item")[index] as HTMLLinkElement)?.focus?.();

  const focusInput = () => {
    const input = getPossibleInput();
    input?.focus();
  };

  const getFocusedIndex = (): number => {
    const el = parentRef.current?.querySelector(".list-item:focus") as HTMLLinkElement;
    if (el && el.parentElement) {
      // @ts-ignore
      return [...el.parentElement.children].indexOf(el);
    }

    return -1;
  };

  const moveUp = () => {
    const i = getFocusedIndex();
    if (i === 0) {
      focusInput();
      return;
    }
    focusItem(i - 1);
  };

  const moveDown = () => {
    const i = getFocusedIndex();
    focusItem(i + 1);
  };

  const watchKb = (e: KeyboardEvent) => {
    if (!showList) {
      return;
    }

    switch (e.keyCode) {
      case 38:
        e.preventDefault();
        moveUp();

        break;
      case 40:
        e.preventDefault();
        moveDown();
        break;
      default:
        break;
    }
  };

  const watchClick = (e: MouseEvent) => {
    if (!showList) {
      return;
    }

    const target = e.target as Element;
    const val = parentRef.current?.contains(target);
    setShowList(val === true);
  };

  const watchInputFocus = () => setShowList(true);

  const moreResultsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowList(false);
    if (!!searchValue && !!history && !!location) {
      if (["/search-more", "/search-more/"].includes(location.pathname)) {
        router.push(`/search-more/?q=${encodeURIComponent(searchValue)}`);
      } else {
        router.push(`/search/?q=${encodeURIComponent(searchValue)}`);
      }
    }
  };

  return (
    <div
      className={classNameObject({
        "suggestion relative": true,
        [containerClassName ?? ""]: !!containerClassName
      })}
      ref={parentRef}
    >
      {children}
      <div ref={clickAwayRef}>
        {showList && modeItems && modeItems.length > 0 ? (
          <div className="suggestion-list-parent">
            {modeItems.map((modeItem, modeKey) => {
              const _items = modeItem.items;
              return (
                _items.length > 0 && (
                  <div className="search-suggestion-list" key={modeKey}>
                    {modeItem.header && <div className="list-header">{modeItem.header}</div>}
                    <div className="list-body">
                      {_items.map((x: any, i: number) => (
                        <a
                          href="#"
                          key={i}
                          className="list-item"
                          onClick={(e: React.MouseEvent) => {
                            e.preventDefault();
                            modeItem.onSelect?.(x);
                            setShowList(false);
                          }}
                        >
                          {modeItem.renderer?.(x) ?? x}
                        </a>
                      ))}
                    </div>
                  </div>
                )
              );
            })}
            <div className="search-suggestion-list more-result">
              <div className="list-body">
                <a href="#" className="list-item" onClick={moreResultsClick}>
                  {i18next.t("g.more-results")}
                </a>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
        {showList && !modeItems && items.length > 0 ? (
          <div className="modal-suggestion-list rounded-3xl -top-[44px] absolute" style={listStyle}>
            {header && (
              <div className="list-header bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-600 px-2 pb-2 pt-12">
                {header}
              </div>
            )}
            <div className="list-body">
              {items.map((x, i) => (
                <a
                  href="#"
                  key={i}
                  className="list-item"
                  onClick={(e: React.MouseEvent) => {
                    e.preventDefault();
                    onSelect?.(x);
                    setShowList(false);
                  }}
                >
                  {renderer?.(x) ?? x}
                </a>
              ))}
            </div>
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
