export const formattedUserName = (username: string) => {
  if (username && username.startsWith("@")) {
    return username.replace("@", "");
  }
  return username;
};
