import { SimilarEntries } from "@/app/[...slugs]/_entry-components/similar-entries";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryPageSimilarEntries({ entry }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const isComment = !!entry.parent_author;

  return !entry.original_entry && !isComment ? (
    <SimilarEntries entry={entry} display={activeUser ? "hidden" : ""} />
  ) : (
    <></>
  );
}
