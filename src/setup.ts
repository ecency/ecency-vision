export const setupConfig = {
  communityId: process.env.RAZZLE_HIVE_ID ?? "hive-112019",
  selectedTheme: process.env.RAZZLE_THEME ?? "sky",
  tags: process.env.RAZZLE_TAGS?.split(",") ?? ["3speak", "spk"],
  navBarImg: "",
};
