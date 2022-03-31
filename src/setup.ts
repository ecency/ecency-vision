export const setupConfig = {
  communityId: process.env.RAZZLE_HIVE_ID ?? "",
  selectedTheme: process.env.RAZZLE_THEME ?? "",
  tags: process.env.RAZZLE_TAGS?.split(",") ?? [""],
  navBarImg: "",
};
