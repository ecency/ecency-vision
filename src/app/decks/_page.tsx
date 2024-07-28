"use client";

import React from "react";
import Head from "next/head";
import i18next from "i18next";
import { getMetaProps } from "@/utils/get-meta-props";
import { useGlobalStore } from "@/core/global-store";
import { Feedback, Theme } from "@/features/shared";
import { Decks } from "@/app/decks/_components";

export function DecksPage() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const meta = getMetaProps({ activeUser, filter: "", tag: "" });

  return (
    <div className="p-0 m-0 mw-full">
      <Head>
        <title>{i18next.t("decks.title")}</title>
        <meta name="description" content={meta.description} />
        <meta property="og:title" content={i18next.t("decks.title")} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={meta.url} />
        <link rel="canonical" href={meta.canonical} />
        <link rel="alternate" type="application/rss+xml" title="RSS Feed" href={meta.rss} />
      </Head>
      <Theme />
      <Feedback />
      <div id="deck-media-view-container" />
      <Decks />
    </div>
  );
}
