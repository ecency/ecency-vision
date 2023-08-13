import useLocalStorage from "react-use/lib/useLocalStorage";
import { PREFIX } from "../../../util/local-storage";
import { Advanced } from "../types";

export function useAdvancedManager() {
  const [advanced, setAdvanced] = useLocalStorage<Advanced>(PREFIX + "local_advanced");

  return {
    advanced
  };
}
