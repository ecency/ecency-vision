import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { Advanced } from "../types";
import { useEffect, useState } from "react";
import { BeneficiaryRoute, RewardType } from "../../../api/operations";
import { useThreeSpeakManager } from "./three-speak-manager";

export function useAdvancedManager() {
  const [localAdvanced, setLocalAdvanced] = useLocalStorage<Advanced>(PREFIX + "local_advanced");
  const [advanced, setAdvanced] = useState(false);
  const [reward, setReward] = useState<RewardType>("default");
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryRoute[]>([]);
  const [description, setDescription] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<string | null>(null);
  const [reblogSwitch, setReblogSwitch] = useState(false);

  const threeSpeakManager = useThreeSpeakManager();

  useEffect(() => {
    saveAdvanced();
  }, [
    reblogSwitch,
    beneficiaries,
    schedule,
    description,
    threeSpeakManager.videoMetadata,
    threeSpeakManager.is3Speak,
    threeSpeakManager.videoId,
    threeSpeakManager.speakPermlink,
    threeSpeakManager.speakAuthor,
    threeSpeakManager.isNsfw
  ]);

  const saveAdvanced = () => {
    const advanced: Advanced = {
      reward,
      beneficiaries,
      schedule,
      reblogSwitch,
      description,
      // Speak Advanced
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
    localAdvanced,
    setLocalAdvanced,
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
      description !== "",

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
