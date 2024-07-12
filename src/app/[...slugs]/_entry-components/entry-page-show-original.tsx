import { EntryLink } from "@/features/shared";
import { Button } from "@ui/button";
import i18next from "i18next";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
}

export function EntryPageShowOriginal({ entry }: Props) {
  return entry.original_entry ? (
    <div className="browse-original">
      <EntryLink entry={entry.original_entry}>
        <Button>{i18next.t("entry.browse-original")}</Button>
      </EntryLink>
    </div>
  ) : (
    <></>
  );
}
