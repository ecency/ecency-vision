import React, { useMemo } from "react";
import { format } from "date-fns";
import { getDateFnsLocale } from "../_utils";
import { useGlobalStore } from "@/core/global-store";
import { classNameObject } from "@ui/util";

export function ChatFloatingDate({
  currentDate,
  isPage = false
}: {
  currentDate?: Date;
  isPage?: boolean;
}) {
  const lang = useGlobalStore((state) => state.lang);

  const currentFormattedDate = useMemo(
    () =>
      currentDate
        ? format(currentDate, "dd MMMM", {
            locale: getDateFnsLocale(lang)
          })
        : undefined,
    [lang, currentDate]
  );

  return currentFormattedDate ? (
    <div
      className={classNameObject({
        "sticky z-[9] flex justify-center text-xs text-center": true,
        "top-0": !isPage,
        "top-[180px] md:top-[57px]": isPage
      })}
    >
      <div className="bg-gray-900 dark:bg-gray-200 text-white bg-opacity-30 dark:bg-opacity-20 font-semibold backdrop-blur-2xl my-3 rounded-full px-1.5 py-0.5 max-w-[100px] truncate">
        {currentFormattedDate}
      </div>
    </div>
  ) : (
    <></>
  );
}
