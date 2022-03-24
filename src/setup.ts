console.log(process.env.RAZZLE_HIVE_ID);

export const setupConfig = {
  communityId: process.env.RAZZLE_HIVE_ID ?? "hive-176364",
  selectedTheme: process.env.RAZZLE_THEME ?? "sky",
  tags: process.env.RAZZLE_TAGS?.split(",") ?? ["3speak", "spk"],
  navBarImg: "",
};
