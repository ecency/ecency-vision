import { useDispatch, useStore } from "react-redux";
import { useState } from "react";
import { AppState } from "./index";
import { bindActionCreators } from "redux";
import "./actions";
import { getActions } from "./actions";

export const useMappedStore = () => {
  const store = useStore<AppState>();
  const dispatch = useDispatch();

  const [state, setState] = useState(store.getState());

  store.subscribe(() => {
    setState(store.getState());
  });

  return {
    ...state,
    ...bindActionCreators(getActions(), dispatch)
  };
};
