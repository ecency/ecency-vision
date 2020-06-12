import React, { Component } from "react";

import { Link } from "react-router-dom";
import Meta from "../meta";

const logoCircle = require("../../img/logo-circle.svg");

export default class NotFound extends Component {
  render() {
    const metaProps = {
      title: "404",
    };

    return (
      <>
        <Meta {...metaProps} />
        <div className="not-found-404">
          <img src={logoCircle} className="logo" />
          <h1>This page doesn't exist.</h1>
          <p className="links">
            <Link to="/">Home</Link>
            <Link to="/created">New posts</Link>
            <Link to="/hot">Hot posts</Link>
            <Link to="/trending">Trending posts</Link>
          </p>
        </div>
      </>
    );
  }
}
