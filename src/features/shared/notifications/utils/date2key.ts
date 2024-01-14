import moment from "moment";
import i18next from "i18next";

export const date2key = (s: string): string => {
  if (s === "Yesterday") {
    return moment().subtract(1, "days").fromNow();
  }

  if (s.indexOf("hours") > -1) {
    const h = parseInt(s, 10);
    return moment().subtract(h, "hours").fromNow();
  }

  if (s.split("-").length === 3) {
    return moment.utc(s).fromNow();
  }

  const gt = i18next.t(`notifications.group-title-${s.toLowerCase()}`);
  if (gt) {
    return gt;
  }

  return s;
};
