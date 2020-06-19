import React, { Component } from "react";

import { FormControl } from "react-bootstrap";

import { magnifySvg } from "../../img/svg";

type Props = any;

export default class SearchBox extends Component<Props> {
  render() {
    return (
      <div className="search-box">
        <span className="prepend">{magnifySvg}</span>
        <FormControl type="text" {...this.props} />
      </div>
    );
  }
}
