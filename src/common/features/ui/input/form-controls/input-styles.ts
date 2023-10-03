// TODO: Add invalid styles based on aria-invalid
// TODO: Add disabled styles
export const INPUT_STYLES =
  "border-2 rounded-3xl py-2 px-3 w-full outline-none shadow-0 focus:border-gray-500 hover:border-gray-300 duration-300";

export const INPUT_DARK_STYLES = "dark:border-gray-600 dark:hover:border-gray-600 dark:bg-gray-800";

export const INVALID_INPUT_STYLES = "aria-invalid:border-red";

export const INPUT_IN_GROUP =
  "[&>input]:rounded-[0] [&>input:first-child]:rounded-l-full [&>input:last-child]:rounded-r-full";
