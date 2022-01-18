import { Component } from "react";

export default class FullHeight extends Component {
  componentDidMount() {
    const root = document.getElementById("root");
    if (root) {
      root.classList.add("full-height");
    }
  }

  componentWillUnmount() {
    const root = document.getElementById("root");
    if (root) {
      root.classList.remove("full-height");
    }
  }

  render() {
    return null;
  }
}
