import { EditHistory } from "@/features/shared";
import { Entry } from "@/entities";
import { EcencyClientServerBridge } from "@/core/bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";

interface Props {
  entry: Entry;
}

export function EntryPageEditHistory({ entry }: Props) {
  const { editHistory, setEditHistory } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  return editHistory ? (
    <EditHistory entry={entry} onHide={() => setEditHistory(!editHistory)} />
  ) : (
    <></>
  );
}
