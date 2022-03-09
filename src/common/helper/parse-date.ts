import moment from "moment";

export const dateToRelative = (d: string): string => {
  const dm = moment(new Date(`${d}.000Z`))
  const dd = dm.fromNow(true);
  return dd.replace(' seconds','s').replace(' minutes','m').replace(' hours','h').replace('an hour','1h').replace(' days','d').replace('a day','1d').replace(' months','M').replace('a month','1M').replace(' years','y').replace('a year','1y');
}

export const dateToFullRelative = (d: string): string => {
  const dm = moment(new Date(`${d}.000Z`))
  return dm.fromNow();
}

export const dateToFormatted = (d: string): string => {
  const dm = moment(new Date(`${d}.000Z`));
  return dm.format("LLLL");
}

const parseDate = (d: string): Date => new Date(`${d}.000Z`);

export default parseDate;
