import { useDispatch, useSelector, useStore } from "react-redux";
import { AppState } from "./index";
import { bindActionCreators } from "redux";
import "./actions";
import { getActions } from "./actions";

export const useMappedStore = () => {
  const store = useStore<AppState>();
  const dispatch = useDispatch();

  const storeStateAccessor: AppState = store.getState();
  const storeStateAccessorProxy = new Proxy<AppState>(storeStateAccessor, {
    get(target, p, receiver: any): any {
      return useSelector((state: any) => state[p]);
    }
  });

  return {
    ...storeStateAccessorProxy,
    ...bindActionCreators(getActions(), dispatch)
  };
};
