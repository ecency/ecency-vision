import moment from "moment";

export const dateToRelative = (d: string): string => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  const dd = dm.fromNow(true);
  return dd
    .replace("a few seconds", "~1s")
    .replace(" seconds", "s")
    .replace(" minutes", "m")
    .replace("a minute", "1m")
    .replace(" hours", "h")
    .replace("an hour", "1h")
    .replace(" days", "d")
    .replace("a day", "1d")
    .replace(" months", "M")
    .replace("a month", "1M")
    .replace(" years", "y")
    .replace("a year", "1y");
};

export const dateToFullRelative = (d: string): string => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.fromNow();
};

export const dateToFormatted = (d: string, format: string = "LLLL"): string => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.format(format);
};

export const dayDiff = (d: string) => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  const _MS_PER_DAY = 1000 * 60 * 60 * 24;
  const a = new Date(isTimeZoned);
  const b = new Date();

  const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

  return Math.floor((utc2 - utc1) / _MS_PER_DAY);
};

export const hourDiff = (d: string) => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  let diff = (new Date().getTime() - new Date(isTimeZoned).getTime()) / 1000;
  diff /= 60 * 60;
  return Math.abs(Math.round(diff));
};

export const secondDiff = (d: string) => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  let diff = (new Date().getTime() - new Date(isTimeZoned).getTime()) / 1000;
  return Math.abs(Math.round(diff));
};

const parseDate = (d: string): Date => new Date(`${d}.000Z`);

export default parseDate;
