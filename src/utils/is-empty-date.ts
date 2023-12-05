export default (s: string | undefined): boolean => {
  if (s === undefined) {
    return true;
  }

  return parseInt(s.split("-")[0], 10) < 1980;
};
