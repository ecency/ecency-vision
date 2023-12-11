import { stripTags } from "./strip-tags";

interface ObjInput {
  name?: string;
}

export function appName(input: string | null | undefined | ObjInput) {
  if (!input) {
    return "";
  }

  if (typeof input === "string") {
    return stripTags(input);
  }

  if (typeof input === "object" && input.name !== undefined) {
    return stripTags(input.name);
  }

  return "";
}
