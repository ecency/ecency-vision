import moment from "moment";

export const dateToRelative = (d: string): string => {
  const isTimeZoned = d.includes('.')||d.includes('+') ? d :`${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  const dd = dm.fromNow(true);
  return dd.replace(' seconds','s').replace(' minutes','m').replace(' hours','h').replace('an hour','1h').replace(' days','d').replace('a day','1d').replace(' months','M').replace('a month','1M').replace(' years','y').replace('a year','1y');
}

export const dateToFullRelative = (d: string): string => {
  const isTimeZoned = d.includes('.')||d.includes('+') ? d :`${d}.000Z`;
  const dm = moment(new Date(isTimeZoned))
  return dm.fromNow();
}

export const dateToFormatted = (d: string, format: string = "LLLL"): string => {
  const isTimeZoned = d.includes('.')||d.includes('+') ? d :`${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.format(format);
}

const parseDate = (d: string): Date => new Date(`${d}.000Z`);

export default parseDate;
