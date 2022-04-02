console.log(process.env.RAZZLE_RUNTIME_HIVE_ID);

export const setupConfig = {
  communityId: process.env.RAZZLE_RUNTIME_HIVE_ID ?? "",
  selectedTheme: process.env.RAZZLE_RUNTIME_THEME ?? "",
  tags: process.env.RAZZLE_RUNTIME_TAGS?.split(",") ?? [""],
  navBarImg: "",
};
