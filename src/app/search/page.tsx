"use client";

import React from "react";
import "./_page.scss";
import Head from "next/head";
import i18next from "i18next";
import { Navbar, Theme } from "@/features/shared";
import {
  SearchComment,
  SearchCommunities,
  SearchPeople,
  SearchTopics
} from "@/app/search/_components";

export default function SearchPage() {
  return (
    <>
      <Head>
        <title>{i18next.t("search-page.title")}</title>
        <meta name="description" content={i18next.t("search-page.description")} />
      </Head>
      <Theme />
      <Navbar />

      <div className="app-content search-page">
        <div className="search-main">
          {/*<SearchComment {...this.props} limit={8} />*/}
          <SearchComment />
        </div>
        <div className="search-side">
          <SearchPeople />
          <SearchCommunities />
          <SearchTopics />
        </div>
      </div>
    </>
  );
}
