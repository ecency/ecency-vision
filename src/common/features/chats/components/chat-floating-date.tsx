import React, { useMemo } from "react";
import { format } from "date-fns";
import { getDateFnsLocale } from "../utils";
import { useMappedStore } from "../../../store/use-mapped-store";
import { classNameObject } from "../../../helper/class-name-object";

export function ChatFloatingDate({
  currentDate,
  isPage = false
}: {
  currentDate?: Date;
  isPage?: boolean;
}) {
  const { global } = useMappedStore();
  const currentFormattedDate = useMemo(
    () =>
      currentDate
        ? format(currentDate, "dd MMMM", {
            locale: getDateFnsLocale(global.lang)
          })
        : undefined,
    [global.lang, currentDate]
  );

  return currentFormattedDate ? (
    <div
      className={classNameObject({
        "sticky z-10 flex justify-center text-xs text-center": true,
        "top-0": !isPage,
        "top-[57px]": isPage
      })}
    >
      <div className="bg-gray-200 my-3 dark:bg-gray-800 rounded-full p-1 ">
        {currentFormattedDate}
      </div>
    </div>
  ) : (
    <></>
  );
}
