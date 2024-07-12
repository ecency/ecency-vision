import { TagLink } from "@/features/shared/tag";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryTags({ entry }: Props) {
  const tags = (entry.json_metadata.tags && Array.from(new Set(entry.json_metadata.tags)))?.filter(
    (t) => !!t
  );

  return (
    <div className="entry-tags">
      {tags?.map((t, i) =>
        typeof t === "string" ? (
          <TagLink
            key={t + i}
            tag={
              entry.community && entry.community_title && t === entry.community
                ? {
                    name: entry.community,
                    title: entry.community_title
                  }
                : t.trim()
            }
            type="link"
          >
            <div className="entry-tag">{t}</div>
          </TagLink>
        ) : (
          <></>
        )
      )}
    </div>
  );
}
