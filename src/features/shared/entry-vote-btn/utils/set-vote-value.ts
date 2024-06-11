import * as ss from "@/utils/session-storage";

export const setVoteValue = (
  type: "up" | "down" | "downPrevious" | "upPrevious",
  username: string,
  value: number
) => {
  ss.set(`vote-value-${type}-${username}`, value);
};
