"use client";

import { Entry } from "@/entities";
import i18next from "i18next";
import { EntryDeleteBtn, EntryMenu } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { useMemo } from "react";
import { deleteForeverSvg, pencilOutlineSvg } from "@ui/svg";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";
import * as ls from "@/utils/local-storage";
import { useRouter } from "next/navigation";

interface Props {
  entry: Entry;
}

export function EntryPageMainInfoMenu({ entry }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const router = useRouter();
  const { setLoading } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  const isComment = useMemo(() => !!entry.parent_author, [entry]);
  const isOwnEntry = useMemo(
    () => activeUser?.username === entry.author,
    [activeUser?.username, entry.author]
  );
  const extraItems = useMemo(
    () => [
      ...(isOwnEntry && isComment
        ? [
            {
              label: i18next.t("g.edit"),
              onClick: () => router.push(`/${entry.url}/edit`),
              icon: pencilOutlineSvg
            }
          ]
        : []),
      ...(!(entry.children > 0 || entry.net_rshares > 0 || entry.is_paidout) &&
      isOwnEntry &&
      isComment
        ? [
            {
              label: "",
              onClick: () => {},
              icon: (
                <EntryDeleteBtn
                  entry={entry}
                  setDeleteInProgress={(value) => () => setLoading(true)}
                  onSuccess={deleted}
                >
                  <a title={i18next.t("g.delete")} className="edit-btn">
                    {deleteForeverSvg} {i18next.t("g.delete")}
                  </a>
                </EntryDeleteBtn>
              )
            }
          ]
        : [])
    ],
    []
  );

  const deleted = () => {
    ls.set(`deletedComment`, entry?.post_id);
    router.back();
  };

  return <EntryMenu entry={entry} separatedSharing={true} extraMenuItems={extraItems} />;
}
