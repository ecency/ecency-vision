import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useGlobalStore } from "@/core/global-store";
import {
  getBoostPlusPricesQuery,
  getPointsQuery,
  useGetBoostPlusAccountPricesQuery
} from "@/api/queries";
import { boostPlus } from "@/api/operations";
import { BoostDialog } from "../../../features/shared/boost";

// Mocking required modules and functions
jest.mock("@/core/global-store", () => ({
  useGlobalStore: jest.fn()
}));

jest.mock("@/api/queries", () => ({
  getBoostPlusPricesQuery: jest.fn(),
  getPointsQuery: jest.fn(),
  useGetBoostPlusAccountPricesQuery: jest.fn()
}));

jest.mock("i18next", () => ({
  t: jest.fn((key) => key) // Mock translation to return the key
}));

jest.mock("@/api/operations", () => ({
  boostPlus: jest.fn(),
  boostPlusHot: jest.fn(),
  boostPlusKc: jest.fn(),
  formatError: jest.fn((e) => [e.message])
}));

jest.mock("@/features/shared", () => ({
  KeyOrHot: jest.fn(({ onKey, onHot, onKc }) => (
    <div>
      <button onClick={() => onKey()}>KeyOrHot Component</button>
      <button onClick={() => onHot()}>Hot Component</button>
      <button onClick={() => onKc()}>Kc Component</button>
    </div>
  )),
  LinearProgress: jest.fn(() => <div />)
}));

jest.mock("@/features/shared/search-by-username", () => ({
  SearchByUsername: jest.fn(({ setUsername }) => (
    <input
      type="text"
      placeholder="Search by username"
      onChange={(e) => setUsername(e.target.value)}
    />
  ))
}));

describe("BoostDialog", () => {
  const onHideMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Add modal-specific elements to the document body
    const modalDialogContainer = document.createElement("div");
    modalDialogContainer.setAttribute("id", "modal-dialog-container");
    document.body.appendChild(modalDialogContainer);

    const modalOverlayContainer = document.createElement("div");
    modalOverlayContainer.setAttribute("id", "modal-overlay-container");
    document.body.appendChild(modalOverlayContainer);

    // Mock active user in the global store
    useGlobalStore.mockReturnValue({
      activeUser: { username: "testuser" }
    });

    // Mock API queries
    getBoostPlusPricesQuery.mockReturnValue({
      useClientQuery: jest.fn(() => ({
        data: [
          { duration: 1, price: 100 },
          { duration: 7, price: 500 }
        ]
      }))
    });

    getPointsQuery.mockReturnValue({
      useClientQuery: jest.fn(() => ({
        data: { points: "1000" }
      }))
    });

    useGetBoostPlusAccountPricesQuery.mockReturnValue({
      data: { expires: null }
    });
  });

  afterEach(() => {
    // Clean up modal-specific elements
    document.body.innerHTML = "";
  });

  test("renders and displays step 1 with correct initial data", () => {
    render(<BoostDialog onHide={onHideMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Check initial step and available points
    expect(screen.getByText("boost-plus.title")).toBeInTheDocument();
    expect(screen.getByText("boost-plus.sub-title")).toBeInTheDocument();
    expect(screen.getByDisplayValue("1000 POINTS")).toBeInTheDocument();

    // Check options in the duration select
    expect(screen.getByDisplayValue("1 g.day - 100 POINTS")).toBeInTheDocument();
    expect(screen.getByText("7 g.days - 500 POINTS")).toBeInTheDocument();
  });

  test("progresses to step 2 when the next button is clicked", () => {
    render(<BoostDialog onHide={onHideMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Set account via SearchByUsername input
    fireEvent.change(screen.getByPlaceholderText("Search by username"), {
      target: { value: "anotheruser" }
    });

    // Click the next button
    fireEvent.click(screen.getByText("g.next"));

    // Check if it progresses to step 2
    expect(screen.getByText("trx-common.sign-title")).toBeInTheDocument();
    expect(screen.getByText("trx-common.sign-sub-title")).toBeInTheDocument();
  });

  test("handles signing process and transitions to step 3", async () => {
    render(<BoostDialog onHide={onHideMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Simulate step 2 completion
    fireEvent.change(screen.getByPlaceholderText("Search by username"), {
      target: { value: "anotheruser" }
    });
    fireEvent.click(screen.getByText("g.next"));

    // Mock sign functions
    boostPlus.mockResolvedValueOnce(true);

    // Simulate signing via KeyOrHot component
    fireEvent.click(screen.getByText("KeyOrHot Component")); // Simplified click for mock component
    await screen.findByText("trx-common.success-title");

    // Check if it transitions to step 3
    expect(screen.getByText("trx-common.success-title")).toBeInTheDocument();
    expect(screen.getByText("trx-common.success-sub-title")).toBeInTheDocument();
  });

  test("finishes and calls onHide when finish button is clicked", async () => {
    render(<BoostDialog onHide={onHideMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Progress to step 3
    fireEvent.change(screen.getByPlaceholderText("Search by username"), {
      target: { value: "anotheruser" }
    });

    act(() => {
      fireEvent.click(screen.getByText("g.next"));
    });

    boostPlus.mockResolvedValueOnce(true);

    act(() => {
      fireEvent.click(screen.getByText("KeyOrHot Component"));
    });

    // Ensure step 3 is visible
    await waitFor(() => {
      expect(screen.getByText("trx-common.success-title")).toBeInTheDocument();
    });

    act(() => {
      // Click the finish button
      fireEvent.click(screen.getByText("g.finish"));
    });

    // Check if onHide is called
    expect(onHideMock).toHaveBeenCalled();
  });

  test("shows balance error message if funds are insufficient", () => {
    // Adjust points to simulate insufficient funds
    getPointsQuery.mockReturnValue({
      useClientQuery: jest.fn(() => ({
        data: { points: "50" } // Less than the minimum price
      }))
    });

    render(<BoostDialog onHide={onHideMock} />, {
      container: document.getElementById("modal-dialog-container")
    });

    // Expect error message to be displayed
    expect(screen.getByText("trx-common.insufficient-funds")).toBeInTheDocument();
  });
});
