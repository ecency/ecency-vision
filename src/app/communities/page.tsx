import { Navbar, ScrollToTop, Theme } from "@/features/shared";
import i18next from "i18next";
import Link from "next/link";
import "./page.scss";
import { CommunitiesList } from "./_components";
import { getCommunities } from "@/api/bridge";

export default async function Communities() {
  const initialData = await getCommunities("", 100, null, "rank");

  return (
    <>
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
          <CommunitiesList initialData={initialData} />
        </div>
      </div>
    </>
  );
}
