import {
  DeletedPostScreen,
  EntryBodyExtra,
  EntryPageContent,
  EntryPageContextProvider,
  EntryPageCrossPostHeader,
  EntryPageEditHistory,
  EntryPageLoadingScreen,
  EntryPageMeta,
  MdHandler,
  ReadTime
} from "@/app/[...slugs]/_entry-components";
import { Feedback, Navbar, ScrollToTop, Theme } from "@/features/shared";
import "./entry.scss";
import { getDeletedEntryQuery, getPostQuery } from "@/api/queries";
import { notFound } from "next/navigation";

interface Props {
  category: string;
  username: string;
  permlink: string;
  isEdit: boolean;
  searchParams: Record<string, string | undefined>;
}

export async function EntryPage({ category, searchParams, permlink, username, isEdit }: Props) {
  const entry = await getPostQuery(username, permlink).prefetch();

  if (!entry) {
    const deletedEntry = await getDeletedEntryQuery(username, permlink).prefetch();
    if (deletedEntry) {
      return (
        <EntryPageContextProvider>
          <DeletedPostScreen deletedEntry={deletedEntry} username={username} permlink={permlink} />
        </EntryPageContextProvider>
      );
    }

    return notFound();
  }

  return (
    <EntryPageContextProvider>
      <EntryPageMeta entry={entry} />
      <ScrollToTop />
      <Theme />
      <Feedback />
      <MdHandler />
      <Navbar />

      <div className="app-content entry-page">
        <EntryPageLoadingScreen />
        <ReadTime entry={entry} />

        <div className="the-entry">
          <EntryPageCrossPostHeader entry={entry} />
          <span itemScope={true} itemType="http://schema.org/Article">
            <EntryPageContent
              category={category}
              isEdit={isEdit}
              entry={entry}
              rawParam={searchParams["raw"] ?? ""}
            />
          </span>
        </div>
      </div>
      <EntryPageEditHistory entry={entry} />
      <EntryBodyExtra entry={entry} />
    </EntryPageContextProvider>
  );
}
