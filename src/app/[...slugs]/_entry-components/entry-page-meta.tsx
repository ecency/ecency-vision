import { Entry } from "@/entities";
import { parseDate, truncate } from "@/utils";
import { catchPostImage, postBodySummary } from "@ecency/render-helper";
import Head from "next/head";
import { entryCanonical } from "@/utils/entry-canonical";
import { useGlobalStore } from "@/core/global-store";
import * as defaults from "@/defaults.json";
import moment from "moment";

interface Props {
  entry: Entry;
}

export function EntryPageMeta({ entry }: Props) {
  const canUseWebp = useGlobalStore((s) => s.canUseWebp);

  const metaTitle = truncate(entry.title, 67);
  const metaDescription = `${
    entry.json_metadata?.description
      ? entry.json_metadata?.description
      : truncate(postBodySummary(entry.body, 210), 140)
  } by @${entry.author}`;
  const metaCanonical = entryCanonical(entry) ?? "";
  const metaImage = catchPostImage(entry, 600, 500, canUseWebp ? "webp" : "match");
  const keywords = (entry.json_metadata.tags ? Array.from(new Set(entry.json_metadata.tags)) : [])
    .filter((t) => !!t)
    .join(", ");

  return (
    <Head>
      {/*TODO: Add notifications count*/}
      <title>{metaTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={metaImage} />
      <meta property="og:url" content={entry.url} />
      <meta
        name="article:published_time"
        content={moment(parseDate(entry.created)).toISOString()}
      />
      <meta itemProp="datePublished" content={moment(parseDate(entry.created)).toISOString()} />
      <meta itemProp="dateModified" content={moment(parseDate(entry.updated)).toISOString()} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={metaCanonical} />
      <link rel="amphtml" href={`${defaults.base}${entry.url}?amps`} />

      <meta itemProp="image" content={metaImage} />
      <meta itemProp="headline name" content={entry.title} />
    </Head>
  );
}
