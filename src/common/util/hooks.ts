import { useContext } from "react";
import { ThreeSpeakVideoContext } from "./ThreeSpeakProvider";

export function useThreeSpeakManager() {
  return useContext(ThreeSpeakVideoContext);
}