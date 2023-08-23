import moment from "moment";

export const dateToFullRelative = (d: string): string => {
  const isTimeZoned = d.indexOf(".") !== -1 || d.indexOf("+") !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.fromNow();
};

export default (d: string): Date => new Date(`${d}.000Z`);
