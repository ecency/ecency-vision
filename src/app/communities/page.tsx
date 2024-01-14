import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import i18next from "i18next";
import Link from "next/link";
import "./page.scss";
import { CommunitiesList } from "./_components";
import { getCommunities } from "@/api/bridge";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { QueryIdentifiers } from "@/core/react-query";

export default async function Communities() {
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: [QueryIdentifiers.COMMUNITIES, "rank", undefined],
    queryFn: () => getCommunities("", 100, null, "rank")
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollToTop />
      <Theme />
      <Navbar />
      <div className="app-content communities-page">
        <div className="community-list">
          <div className="list-header">
            <h1 className="list-title">{i18next.t("communities.title")}</h1>
            <Link href="/communities/create" className="create-link">
              {i18next.t("communities.create")}
            </Link>
          </div>
          <CommunitiesList />
        </div>
      </div>
    </HydrationBoundary>
  );
}
