export const parseUrl = (s: string): URL | null => {
  let url;

  try {
    url = new URL(s);
    return url;
  } catch (e) {
    return null;
  }
};
