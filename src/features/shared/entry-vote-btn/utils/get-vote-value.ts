import * as ls from "@/utils/local-storage";
import * as ss from "@/utils/session-storage";

export const getVoteValue = (
  type: "up" | "down" | "downPrevious" | "upPrevious",
  username: string,
  def: number,
  isPostSlider?: boolean
): number => {
  const postUpSliderDefaultValue = ls.get("post_upSlider_value");
  const postDownSliderDefaultValue = ls.get("post_downSlider_value");
  const commentUpSliderDefaultValue = ls.get("comment_upSlider_value");
  const commentDownSliderDefaultValue = ls.get("comment_downSlider_value");

  if (isPostSlider) {
    if (type === "up") {
      return ss.get(`vote-value-${type}-${username}`, postUpSliderDefaultValue ?? def);
    } else {
      return ss.get(`vote-value-${type}-${username}`, postDownSliderDefaultValue ?? def);
    }
  } else {
    if (type === "up") {
      return ss.get(`vote-value-${type}-${username}`, commentUpSliderDefaultValue ?? def);
    } else {
      return ss.get(`vote-value-${type}-${username}`, commentDownSliderDefaultValue ?? def);
    }
  }
};
