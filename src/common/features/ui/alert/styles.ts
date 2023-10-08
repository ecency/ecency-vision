import { Appearance } from "./types";

export const ALERT_STYLES: Record<Appearance, string> = {
  primary: "bg-blue-dark-sky-040 border border-blue-dark-sky-030 text-blue-dark-sky",
  secondary: "bg-gray-100 border border-gray-200 text-gray-600",
  success: "bg-green-040 border border-green-030 text-green",
  warning: "bg-warning-040 border border-warning-030 text-warning-default",
  danger: "bg-red-040 border border-red-030 text-red"
};
