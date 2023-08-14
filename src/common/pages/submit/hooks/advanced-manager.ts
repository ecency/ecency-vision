import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { Advanced } from "../types";
import { useEffect, useState } from "react";
import { BeneficiaryRoute, RewardType } from "../../../api/operations";
import { useThreeSpeakManager } from "./three-speak-manager";
import usePrevious from "react-use/lib/usePrevious";
import isEqual from "react-fast-compare";

export function useAdvancedManager() {
  const [localAdvanced, setLocalAdvanced] = useLocalStorage<Advanced>(PREFIX + "_local_advanced");
  const previousLocalAdvanced = usePrevious(localAdvanced);
  const [advanced, setAdvanced] = useState(false);
  const [reward, setReward] = useState<RewardType>("default");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRoute[]>([]);
  const [description, setDescription] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [reblogSwitch, setReblogSwitch] = useState(false);

  const threeSpeakManager = useThreeSpeakManager();

  useEffect(() => {
    console.log("change", beneficiaries);
  }, [beneficiaries]);

  useEffect(() => {
    if (localAdvanced && isEqual(localAdvanced, previousLocalAdvanced)) {
      console.log("loaded", localAdvanced.beneficiaries);
      setReward(localAdvanced.reward);
      setBeneficiaries(localAdvanced.beneficiaries);
      setSchedule(localAdvanced.schedule);
      setReblogSwitch(localAdvanced.reblogSwitch);
      setDescription(localAdvanced.description);
      threeSpeakManager.setIs3Speak(localAdvanced.isThreespeak);
      threeSpeakManager.setSpeakAuthor(localAdvanced.speakAuthor);
      threeSpeakManager.setSpeakPermlink(localAdvanced.speakPermlink);
      threeSpeakManager.setVideoId(localAdvanced.videoId);
      threeSpeakManager.setIsNsfw(localAdvanced.isNsfw);
      threeSpeakManager.setVideoMetadata(localAdvanced.videoMetadata);
    }
  }, [localAdvanced]);

  const saveAdvanced = () => {
    const advanced: Advanced = {
      reward,
      beneficiaries,
      schedule,
      reblogSwitch,
      description,
      isThreespeak: threeSpeakManager.is3Speak,
      videoId: threeSpeakManager.videoId,
      speakPermlink: threeSpeakManager.speakPermlink,
      speakAuthor: threeSpeakManager.speakAuthor,
      isNsfw: threeSpeakManager.isNsfw,
      videoMetadata: threeSpeakManager.videoMetadata
    };
    setLocalAdvanced(advanced);
  };

  return {
    advanced,
    setAdvanced,
    reward,
    setReward,
    beneficiaries,
    setBeneficiaries,
    description,
    setDescription,
    schedule,
    setSchedule,
    reblogSwitch,
    setReblogSwitch,

    hasAdvanced: () =>
      reward !== "default" ||
      beneficiaries?.length > 0 ||
      schedule !== null ||
      reblogSwitch ||
      (description !== "" && typeof description === "string"),

    saveAdvanced,

    clearAdvanced: () => {
      setAdvanced(false);
      setReward("default");
      setBeneficiaries([]);
      setDescription(null);
      setSchedule(null);
      setReblogSwitch(false);
    }
  };
}
