import { Appearance } from "./types";

export const ALERT_STYLES: Record<Appearance, string> = {
  primary:
    "bg-blue-dark-sky-040 border border-blue-dark-sky-030 text-blue-dark-sky dark:bg-dark-400 dark:border-dark-300 dark:text-white",
  secondary:
    "bg-gray-100 border border-gray-200 text-gray-600 dark:bg-opacity-[20%] dark:border-opacity-[20%]",
  success:
    "bg-green-040 border border-green-030 text-green dark:bg-opacity-[20%] dark:border-opacity-[20%]",
  warning:
    "bg-warning-040 border border-warning-030 text-orange dark:bg-opacity-[20%] dark:border-opacity-[20%] dark:text-warning-default",
  danger:
    "bg-red-040 border border-red-030 text-red dark:bg-opacity-[20%] dark:border-opacity-[20%]"
};
