import { Component } from "react";

export default class BaseComponent<P = {}, S = {}> extends Component<P, S> {
  _mounted: boolean = true;

  componentWillUnmount() {
    this._mounted = false;
  }

  stateSet = <K extends keyof S>(state: Pick<S, K>, callback?: () => void): void => {
    if (this._mounted) {
      this.setState(state, callback);
    }
  };
}
