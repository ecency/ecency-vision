import { KeyboardEvent } from "react";
import { detectEvent } from "../../../components/editor-toolbar";

export function handleShortcuts(e: KeyboardEvent<HTMLDivElement>) {
  if (!e.altKey) {
    return;
  }

  switch (e.key) {
    case "b":
      detectEvent("bold");
      break;
    case "i":
      detectEvent("italic");
      break;
    case "t":
      detectEvent("table");
      break;
    case "k":
      detectEvent("link");
      break;
    case "c":
      detectEvent("codeBlock");
      break;
    case "d":
      detectEvent("image");
      break;
    case "m":
      detectEvent("blockquote");
      break;
    default:
      return;
  }
}
