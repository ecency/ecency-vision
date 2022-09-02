import reducer, {
  initialState,
  fetchAct,
  fetchedAct,
  setFilterAct,
  setUnreadCountAct,
  markAct
} from "./index";
import { NFetchMode, NotificationFilter } from "./types";
import { apiNotificationList1, apiNotificationList2 } from "../../helper/test-helper";

import { logoutAct } from "../active-user";

let state = initialState;

it("1- default state", () => {
  expect(state).toMatchSnapshot();
});

it("2- fetchAct", () => {
  state = reducer(state, fetchAct(NFetchMode.REPLACE));
  expect(state).toMatchSnapshot();
});

it("3- fetchedAct", () => {
  state = reducer(state, fetchedAct(apiNotificationList1, NFetchMode.REPLACE));
  expect(state).toMatchSnapshot();
});

it("4- fetchedAct", () => {
  state = reducer(state, fetchedAct(apiNotificationList2, NFetchMode.APPEND));
  expect(state).toMatchSnapshot();
});

it("5- markAct", () => {
  state = reducer(state, markAct("m-49590315"));
  expect(state).toMatchSnapshot();
});

it("6- markAct", () => {
  state = reducer(state, markAct(null));
  expect(state).toMatchSnapshot();
});

it("8- setFilterAct", () => {
  state = reducer(state, setFilterAct(NotificationFilter.VOTES));
  expect(state).toMatchSnapshot();
});

it("9- setUnreadCountAct", () => {
  state = reducer(state, setUnreadCountAct(8));
  expect(state).toMatchSnapshot();
});

it("10- logoutAct", () => {
  state = reducer(state, logoutAct());
  expect(state).toMatchSnapshot();
});
