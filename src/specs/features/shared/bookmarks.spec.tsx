import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useBookmarksQuery, useFavouritesQuery } from "@/api/queries";
import { BookmarksDialog } from "../../../features/shared/bookmarks";

// Mocking the required modules
jest.mock("@/api/queries", () => ({
  useBookmarksQuery: jest.fn(),
  useFavouritesQuery: jest.fn()
}));

jest.mock("@/features/shared/bookmarks/bookmarks-list", () => ({
  BookmarksList: jest.fn(() => <div>Bookmarks List</div>)
}));

jest.mock("@/features/shared/bookmarks/favourites-list", () => ({
  FavouritesList: jest.fn(() => <div>Favourites List</div>)
}));

jest.mock("i18next", () => ({
  t: jest.fn((key) => key) // Mock the translation function to return the key
}));

jest.mock("react-use", () => ({
  useMount: jest.fn((fn) => fn()) // Immediately call the provided function to simulate mount behavior
}));

describe("BookmarksDialog", () => {
  const setShowMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Add modal-specific elements to the document body
    const modalDialogContainer = document.createElement("div");
    modalDialogContainer.setAttribute("id", "modal-dialog-container");
    document.body.appendChild(modalDialogContainer);

    const modalOverlayContainer = document.createElement("div");
    modalOverlayContainer.setAttribute("id", "modal-overlay-container");
    document.body.appendChild(modalOverlayContainer);
  });

  afterEach(() => {
    // Clean up modal-specific elements
    document.body.innerHTML = "";
  });

  test("renders the modal with bookmarks section active", () => {
    useBookmarksQuery.mockReturnValue({
      refetch: jest.fn()
    });
    useFavouritesQuery.mockReturnValue({
      refetch: jest.fn()
    });

    render(<BookmarksDialog show={true} setShow={setShowMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Check if the modal is rendered
    expect(screen.getByText("bookmarks.title")).toBeInTheDocument();
    expect(screen.getByText("favorites.title")).toBeInTheDocument();

    // Check if the bookmarks section is active and rendered
    expect(screen.getByText("Bookmarks List")).toBeInTheDocument();
  });

  test("switches to favourites section when the corresponding menu item is clicked", () => {
    useBookmarksQuery.mockReturnValue({
      refetch: jest.fn()
    });
    useFavouritesQuery.mockReturnValue({
      refetch: jest.fn()
    });

    render(<BookmarksDialog show={true} setShow={setShowMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Click the favourites menu item
    fireEvent.click(screen.getByText("favorites.title"));

    // Check if the favourites section is active and rendered
    expect(screen.getByText("Favourites List")).toBeInTheDocument();
  });

  test("calls refetch for bookmarks and favourites on mount", () => {
    const refetchBookmarks = jest.fn();
    const refetchFavourites = jest.fn();

    useBookmarksQuery.mockReturnValue({
      refetch: refetchBookmarks
    });
    useFavouritesQuery.mockReturnValue({
      refetch: refetchFavourites
    });

    render(<BookmarksDialog show={true} setShow={setShowMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Ensure refetch is called for both queries on mount
    expect(refetchBookmarks).toHaveBeenCalled();
    expect(refetchFavourites).toHaveBeenCalled();
  });

  test("hides the modal when close button is clicked", () => {
    useBookmarksQuery.mockReturnValue({
      refetch: jest.fn()
    });
    useFavouritesQuery.mockReturnValue({
      refetch: jest.fn()
    });

    render(<BookmarksDialog show={true} setShow={setShowMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Simulate clicking the close button
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // Check if setShow was called to hide the modal
    expect(setShowMock).toHaveBeenCalledWith(false);
  });
});
