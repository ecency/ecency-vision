"use client";

import { renderPostBody } from "@ecency/render-helper";
import { EditHistory, Navbar, ScrollToTop, StaticNavbar, Theme } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { AuthorInfoCard } from "@/app/[...slugs]/_entry-components/author-info-card";
import i18next from "i18next";
import { SimilarEntries } from "@/app/[...slugs]/_entry-components/similar-entries";
import { EcencyClientServerBridge } from "@/core/client-server-bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";

interface Props {
  deletedEntry: {
    title: string;
    body: string;
    tags: any;
  };
  staticNav?: boolean;
  username: string;
  permlink: string;
}

export const DeletedPostScreen = ({ username, permlink, staticNav, deletedEntry }: Props) => {
  const isMobile = useGlobalStore((s) => s.isMobile);
  const { showProfileBox, editHistory, setEditHistory } =
    EcencyClientServerBridge.useSafeContext(EntryPageContext);

  return (
    <div>
      {staticNav ? <StaticNavbar fullVersionUrl="" /> : <Navbar />}
      {deletedEntry && (
        <div className="container overflow-x-hidden">
          <ScrollToTop />
          <Theme />
          <div className="grid grid-cols-12">
            <div className="w-0 lg:w-auto lg:col-span-2 mt-5">
              <div className="mb-4 mt-5">
                <div id="avatar-fixed-container" className="invisible">
                  {!isMobile && showProfileBox && (
                    <AuthorInfoCard entry={{ author: username.replace("@", "") } as any} />
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-12 lg:col-span-9">
              <div className="p-0 p-lg-5 the-entry">
                <div className="p-3 bg-danger rounded text-white my-0 mb-4 my-lg-5">
                  {i18next.t("entry.deleted-content-warning")}
                  <u
                    onClick={() => setEditHistory(!editHistory)}
                    className="text-blue-dark-sky pointer"
                  >
                    {i18next.t("points.history")}
                  </u>{" "}
                  {i18next.t("g.logs")}.
                </div>
                <div className="cross-post">
                  <h1 className="entry-title">{deletedEntry!.title}</h1>
                </div>
                <div dangerouslySetInnerHTML={{ __html: renderPostBody(deletedEntry!.body) }} />
                {editHistory && (
                  <EditHistory
                    entry={
                      {
                        author: username.replace("@", ""),
                        permlink
                      } as any
                    }
                    onHide={() => setEditHistory(!editHistory)}
                  />
                )}
                <div className="mt-3">
                  <SimilarEntries
                    entry={
                      {
                        permlink,
                        author: username.replace("@", ""),
                        json_metadata: { tags: deletedEntry.tags }
                      } as any
                    }
                    display=""
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
