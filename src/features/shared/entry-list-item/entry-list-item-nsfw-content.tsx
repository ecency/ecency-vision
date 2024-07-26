"use client";

import Image from "next/image";
import i18next from "i18next";
import Link from "next/link";
import { Tsx } from "@/features/i18n/helper";
import React, { useMemo } from "react";
import { useGlobalStore } from "@/core/global-store";
import { Entry } from "@/entities";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryListItemContext } from "@/features/shared/entry-list-item/entry-list-item-context";

interface Props {
  entry: Entry;
}

export function EntryListItemNsfwContent({ entry }: Props) {
  const globalNsfw = useGlobalStore((s) => s.nsfw);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { showNsfw, setShowNsfw } = EcencyClientServerBridge.useSafeContext(EntryListItemContext);

  const nsfw = useMemo(
    () =>
      entry.json_metadata &&
      entry.json_metadata.tags &&
      Array.isArray(entry.json_metadata.tags) &&
      entry.json_metadata.tags.includes("nsfw"),
    [entry]
  );

  return nsfw && !showNsfw && !globalNsfw ? (
    <>
      <div className="item-image item-image-nsfw">
        <Image
          width={600}
          height={600}
          className="w-full"
          src="/assets/nsfw.png"
          alt={entry.title}
        />
      </div>
      <div className="item-summary">
        <div className="item-nsfw">
          <span className="nsfw-badge">NSFW</span>
        </div>
        <div className="item-nsfw-options">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setShowNsfw(true);
            }}
          >
            {i18next.t("nsfw.reveal")}
          </a>{" "}
          {i18next.t("g.or").toLowerCase()}{" "}
          {activeUser && (
            <>
              {i18next.t("nsfw.settings-1")}{" "}
              <Link href={`/@${activeUser.username}/settings`}>{i18next.t("nsfw.settings-2")}</Link>
              {"."}
            </>
          )}
          {!activeUser && (
            <>
              <Tsx k="nsfw.signup">
                <span />
              </Tsx>
              {"."}
            </>
          )}
        </div>
      </div>
    </>
  ) : (
    <></>
  );
}
