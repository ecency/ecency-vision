"use client";

import React from "react";
import "./_page.scss";
import { Navbar, Theme } from "@/features/shared";
import {
  SearchComment,
  SearchCommunities,
  SearchPeople,
  SearchTopics
} from "@/app/search/_components";

export function SearchPage() {
  return (
    <>
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
