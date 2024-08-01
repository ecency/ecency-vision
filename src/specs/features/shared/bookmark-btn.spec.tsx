import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useGlobalStore } from "@/core/global-store";
import { useBookmarksQuery } from "@/api/queries";
import { useBookmarkAdd, useBookmarkDelete } from "@/api/mutations/bookmarks";
import { Entry } from "@/entities";
import { BookmarkBtn } from "../../../features/shared";

jest.mock("@/core/global-store", () => ({
  useGlobalStore: jest.fn()
}));

jest.mock("@/api/queries", () => ({
  useBookmarksQuery: jest.fn()
}));

jest.mock("@/api/mutations/bookmarks", () => ({
  useBookmarkAdd: jest.fn(),
  useBookmarkDelete: jest.fn()
}));

jest.mock("i18next", () => ({
  t: jest.fn((key) => key)
}));

jest.mock("@iconscout/react-unicons", () => ({
  UilBookmark: () => <svg data-testid="bookmark-icon" />
}));

describe("BookmarkBtn", () => {
  const entry: Entry = {
    author: "author1",
    permlink: "permlink1"
    // Add other required fields for Entry
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders login required when no active user", () => {
    useGlobalStore.mockReturnValue(null);
    useBookmarksQuery.mockReturnValue({ data: [] });
    useBookmarkAdd.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    useBookmarkDelete.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(<BookmarkBtn entry={entry} />);

    expect(screen.getByTitle("bookmark-btn.add")).toBeInTheDocument();
  });

  test("renders add bookmark button for non-bookmarked entry", () => {
    useGlobalStore.mockReturnValue({ activeUser: { id: 1 } });
    useBookmarksQuery.mockReturnValue({ data: [] });
    useBookmarkAdd.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
    useBookmarkDelete.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(<BookmarkBtn entry={entry} />);

    expect(screen.getByTitle("bookmark-btn.add")).toBeInTheDocument();
  });

  test("calls addBookmark when button is clicked", () => {
    const addBookmarkMock = jest.fn();
    useGlobalStore.mockReturnValue({ activeUser: { id: 1 } });
    useBookmarksQuery.mockReturnValue({ data: [] });
    useBookmarkAdd.mockReturnValue({ mutateAsync: addBookmarkMock, isPending: false });
    useBookmarkDelete.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(<BookmarkBtn entry={entry} />);

    fireEvent.click(screen.getByRole("button"));

    expect(addBookmarkMock).toHaveBeenCalled();
  });

  test("renders delete bookmark button for bookmarked entry", () => {
    const bookmarkId = "bookmark123";
    useGlobalStore.mockReturnValue({ activeUser: { id: 1 } });
    useBookmarksQuery.mockReturnValue({
      data: [{ _id: bookmarkId, author: entry.author, permlink: entry.permlink }]
    });
    useBookmarkDelete.mockReturnValue({ mutateAsync: jest.fn(), isPending: false });

    render(<BookmarkBtn entry={entry} />);

    expect(screen.getByTitle("bookmark-btn.delete")).toBeInTheDocument();
  });

  test("calls deleteBookmark when button is clicked", () => {
    const deleteBookmarkMock = jest.fn();
    const bookmarkId = "bookmark123";
    useGlobalStore.mockReturnValue({ activeUser: { id: 1 } });
    useBookmarksQuery.mockReturnValue({
      data: [{ _id: bookmarkId, author: entry.author, permlink: entry.permlink }]
    });
    useBookmarkDelete.mockReturnValue({ mutateAsync: deleteBookmarkMock, isPending: false });

    render(<BookmarkBtn entry={entry} />);

    fireEvent.click(screen.getByRole("button"));

    expect(deleteBookmarkMock).toHaveBeenCalled();
  });
});
