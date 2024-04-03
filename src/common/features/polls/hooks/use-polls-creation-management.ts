import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { useMemo } from "react";

export function usePollsCreationManagement() {
  const [title, setTitle, clearTitle] = useLocalStorage(PREFIX + "_plls_t", "");
  const [accountAge, setAccountAge, clearAccountAge] = useLocalStorage(PREFIX + "_plls_ag", 100);
  const [choices, setChoices, clearChoices] = useLocalStorage<string[]>(PREFIX + "_plls_ch", []);

  const hasEmptyOrDuplicatedChoices = useMemo(() => {
    if (!choices || choices.length === 0) {
      return true;
    }

    const hasDuplicates = new Set(choices).size !== choices.length;
    return choices.some((c) => !c) || hasDuplicates;
  }, [choices]);

  const pushChoice = (choice: string) => setChoices([...(choices ?? []), choice]);

  const deleteChoiceByIndex = (index: number) => {
    const next = [...(choices ?? [])];
    next.splice(index, 1);
    return setChoices(next);
  };

  const updateChoiceByIndex = (choice: string, index: number) => {
    const next = [...(choices ?? [])];
    next.splice(index, 1, choice);
    return setChoices(next);
  };

  return {
    title,
    setTitle,
    choices,
    pushChoice,
    deleteChoiceByIndex,
    updateChoiceByIndex,
    hasEmptyOrDuplicatedChoices,
    accountAge,
    setAccountAge
  };
}
