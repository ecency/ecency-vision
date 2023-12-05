import { Entry } from "@/entities";
import apps from "@hiveio/hivescript/apps.json";
import defaults from "@/defaults.json";
import { appName } from "./app-name";

export function entryCanonical(entry: Entry, isAmp: boolean = false): string | null {
  if (isAmp) {
    return `${defaults.base}${entry.url}`;
  }

  if (entry.json_metadata?.canonical_url) {
    return entry.json_metadata?.canonical_url.replace("https://www.", "https://");
  }

  let scheme = `${defaults.base}/{category}/@{username}/{permlink}`;

  const app = appName(entry.json_metadata.app);

  if (app) {
    const identifier = app.split("/")[0] as keyof typeof apps;

    if (apps[identifier]) {
      scheme = (apps[identifier] as { url_scheme: string }).url_scheme;
    }
  }

  if (!scheme) {
    return null;
  }

  return scheme
    .replace("{category}", entry.category)
    .replace("{username}", entry.author)
    .replace("{permlink}", entry.permlink);
}
