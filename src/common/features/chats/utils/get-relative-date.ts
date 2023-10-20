import { differenceInDays, differenceInHours, differenceInYears, format, getDay } from "date-fns";

export function getRelativeDate(timestamp?: number) {
  if (!timestamp) {
    return "";
  }

  const date = new Date(timestamp * 1000);
  const now = new Date();

  if (getDay(now) === getDay(date) && differenceInHours(now, date) <= 24) {
    return format(date, "HH:mm");
  } else if (differenceInDays(now, date) <= 7) {
    return format(date, "EEE");
  } else if (differenceInYears(now, date) === 0) {
    return format(date, "dd.MM");
  } else {
    return format(date, "dd.MM.yyyy");
  }
}
