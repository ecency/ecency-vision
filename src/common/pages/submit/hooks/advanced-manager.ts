import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { BeneficiaryRoute, RewardType } from "../../../api/operations";
import { useState } from "react";

export function useAdvancedManager() {
  const [advanced, setAdvanced] = useState(false);
  const [reward, setReward] = useLocalStorage<RewardType>(PREFIX + "_sa_r", "default");
  const [beneficiaries, setBeneficiaries] = useLocalStorage<BeneficiaryRoute[]>(
    PREFIX + "_sa_b",
    []
  );
  const [description, setDescription] = useLocalStorage<string | null>(PREFIX + "_sa_d", null);
  const [schedule, setSchedule] = useLocalStorage<string | null>(PREFIX + "_sa_s", null);
  const [reblogSwitch, setReblogSwitch] = useLocalStorage(PREFIX + "_sa_rb", false);

  return {
    advanced,
    setAdvanced,
    reward: reward!!,
    setReward,
    beneficiaries: beneficiaries!!,
    setBeneficiaries,
    description: description ?? null,
    setDescription,
    schedule: schedule!!,
    setSchedule,
    reblogSwitch: reblogSwitch!!,
    setReblogSwitch,

    hasAdvanced: () =>
      reward !== "default" ||
      (beneficiaries ?? []).length > 0 ||
      schedule !== null ||
      reblogSwitch ||
      (description !== "" && typeof description === "string"),

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
