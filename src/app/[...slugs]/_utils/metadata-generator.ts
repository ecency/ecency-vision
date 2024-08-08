import { Metadata, ResolvingMetadata } from "next";
import { getAccountFullQuery, getPostQuery } from "@/api/queries";
import { PageDetector } from "@/app/[...slugs]/_utils/page-detector";
import defaults from "@/defaults.json";
import { capitalize, parseDate, truncate } from "@/utils";
import { catchPostImage, postBodySummary } from "@ecency/render-helper";
import { getCommunityCache } from "@/core/caches";
import i18next from "i18next";
import { initI18next } from "@/features/i18n";

export namespace MetadataGenerator {
  interface Props {
    params: { slugs: string[] };
    searchParams: Record<string, string | undefined>;
  }

  async function buildForEntry(username: string, permlink: string): Promise<Metadata> {
    const entry = await getPostQuery(username, permlink).prefetch();
    if (entry) {
      const description = `${
        entry.json_metadata?.description
          ? entry.json_metadata?.description
          : truncate(postBodySummary(entry.body, 210), 140)
      } by @${entry.author}`;
      const tags =
        (entry.json_metadata.tags && Array.from(new Set(entry.json_metadata.tags)))?.filter(
          (t) => !!t
        ) ?? [];
      return {
        title: truncate(entry.title, 67),
        description,
        openGraph: {
          title: truncate(entry.title, 67),
          description,
          url: entry.url,
          images: [catchPostImage(entry, 600, 500, "match")],
          publishedTime: parseDate(entry.created).toISOString(),
          modifiedTime: parseDate(entry.updated).toISOString(),
          tags
        }
      };
    }

    return {};
  }

  async function buildForProfile(username: string, section: string): Promise<Metadata> {
    const account = await getAccountFullQuery(username).prefetch();
    if (account) {
      const metaTitle = `${account.profile?.name || account.name}'s ${
        section ? (section === "engine" ? "tokens" : `${section}`) : ""
      } on decentralized web`;
      const metaDescription = `${
        account.profile?.about
          ? `${account.profile?.about} ${section ? `${section}` : ""}`
          : `${account.profile?.name || account.name} ${section ? `${section}` : ""}`
      }`;
      const metaUrl = `/@${username.replace("@", "")}${section ? `/${section}` : ""}`;
      const metaCanonical = `${defaults.base}/@${username.replace("@", "")}${
        section ? `/${section}` : ""
      }`;
      const metaRss = `${defaults.base}/@${username.replace("@", "")}/rss`;
      const metaKeywords = `${username.replace("@", "")}, ${username.replace("@", "")}'s blog`;
      const metaImage = `${defaults.imageServer}/u/${username.replace("@", "")}/avatar/medium`;
      return {
        title: metaTitle,
        description: metaDescription,
        openGraph: {
          title: metaTitle,
          description: metaDescription,
          images: [metaImage],
          url: metaUrl,
          tags: metaKeywords
        }
      };
    }

    return {};
  }

  async function buildForCommunity(filter: string, tag: string): Promise<Metadata> {
    const community = await getCommunityCache(tag).prefetch();
    const account = await getAccountFullQuery(tag).prefetch();
    if (community && account) {
      const title = `${community!!.title.trim()} community ${filter} list`;
      const description = i18next.t("community.page-description", {
        f: `${capitalize(filter)} ${community!!.title.trim()}`
      });
      const metaRss = `${defaults.base}/${filter}/${community!!.name}/rss.xml`;
      const metaCanonical = `${defaults.base}/created/${community!!.name}`;

      return {
        title,
        description,
        openGraph: {
          title,
          description,
          url: `/${filter}/${community!!.name}`,
          images: [`${defaults.imageServer}/u/${community!!.name}/avatar/medium`]
        }
      };
    }

    return {};
  }

  async function buildForIndex(filter: string, tag: string): Promise<Metadata> {
    const fC = capitalize(filter);
    let title = i18next.t("entry-index.title", { f: fC });
    let description = i18next.t("entry-index.description", { f: fC });
    let url = `/${filter}`;
    let canonical = `${defaults.base}/${filter}`;
    let rss = "";

    if (tag) {
      title = `latest #${tag} ${filter} topics on internet`;
      description = i18next.t("entry-index.description-tag", { f: fC, t: tag });

      url = `/${filter}/${tag}`;
      canonical = `${defaults.base}/${filter}/${tag}`;
      rss = `${defaults.base}/${filter}/${tag}/rss.xml`;
    }

    return { title, description, openGraph: { url } };
  }

  async function buildForEdit(username: string, permlink: string): Promise<Metadata> {
    const forEntry = await buildForEntry(username, permlink);
    return {
      ...forEntry,
      title: `Edit – ${forEntry.title}`
    };
  }

  export async function build(props: Props, parent: ResolvingMetadata): Promise<Metadata> {
    await initI18next();
    const page = PageDetector.detect(props);

    switch (page) {
      case "entry":
        return buildForEntry(
          props.params.slugs[1].replace("%40", "").replace("@", ""),
          props.params.slugs[2]
        );
      case "profile":
        return buildForProfile(
          props.params.slugs[0].replace("%40", ""),
          props.params.slugs[1] ?? "posts"
        );
      case "community":
        return buildForCommunity(props.params.slugs[0], props.params.slugs[1]);
      case "index":
        return buildForIndex(props.params.slugs[0], props.params.slugs[1]);
      case "edit":
        return buildForEdit(
          props.params.slugs[0].replace("%40", "").replace("@", ""),
          props.params.slugs[1]
        );
    }

    return {};
  }
}
