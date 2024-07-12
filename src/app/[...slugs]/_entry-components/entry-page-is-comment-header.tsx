import i18next from "i18next";
import { Entry } from "@/entities";
import Link from "next/link";
import { makeEntryPath } from "@/utils";

interface Props {
  entry: Entry;
}

export function EntryPageIsCommentHeader({ entry }: Props) {
  const isComment = !!entry.parent_author;

  return isComment ? (
    <div className="comment-entry-header">
      <div className="comment-entry-header-title">RE: {entry.title}</div>
      <div className="comment-entry-header-info">{i18next.t("entry.comment-entry-title")}</div>
      <p className="comment-entry-root-title">{entry.title}</p>
      <ul className="comment-entry-opts">
        <li>
          <Link href={entry.url}>{i18next.t("entry.comment-entry-go-root")}</Link>
        </li>
        {entry.depth > 1 && (
          <li>
            <Link
              href={makeEntryPath(entry.category, entry.parent_author!, entry.parent_permlink!)}
            >
              {i18next.t("entry.comment-entry-go-parent")}
            </Link>
          </li>
        )}
      </ul>
    </div>
  ) : (
    <></>
  );
}
