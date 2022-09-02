import capitalize from "./capitalize";
import { _t } from "../i18n";
import defaults from "../constants/defaults.json";

export function getMetaProps<T extends Record<string, any>>({ global, activeUser }: T) {
  const { filter, tag } = global;

  const fC = capitalize(filter);
  let title = _t("entry-index.title", { f: fC });
  let description = _t("entry-index.description", { f: fC });
  let url = `/${filter}`;
  let canonical = `${defaults.base}/${filter}`;
  let rss = "";

  if (tag) {
    if (activeUser && tag === "my") {
      title = `@${activeUser.username}'s community feed on decentralized web`;
      description = _t("entry-index.description-user-feed", { u: tag });
      canonical = `${defaults.base}/@${tag}/${filter}`;
    } else if (tag.startsWith("@")) {
      title = `${tag}'s ${filter} on decentralized web`;
      description = _t("entry-index.description-user-feed", { u: tag });
      canonical = `${defaults.base}/@${tag}/${filter}`;
    } else {
      title = `latest #${tag} ${filter} topics on internet`;
      description = _t("entry-index.description-tag", { f: fC, t: tag });

      url = `/${filter}/${tag}`;
      canonical = `${defaults.base}/${filter}/${tag}`;
      rss = `${defaults.base}/${filter}/${tag}/rss.xml`;
    }
  }

  return { title, description, url, canonical, rss };
}
