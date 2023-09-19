import React from "react";

interface Props {
  fullVersionUrl: string;
}

export const StaticNavbar = ({ fullVersionUrl }: Props) => {
  return (
    <>
      <div className="sticky-container" id="sticky-container">
        <div className="nav-bar-sm sticky">
          <div className="brand">
            <a href="/">
              <img
                src={require("../../img/logo-circle.svg")}
                className="logo"
                style={{ width: "40px", height: "40px" }}
                alt="Logo"
              />
            </a>
          </div>
          <div className="text-menu">
            <a className="menu-item mt-0" href="/discover">
              Discover
            </a>
            <a className="menu-item mt-0" href="/communities">
              Communities
            </a>
          </div>
        </div>
        <div className="nav-bar">
          <div className="nav-bar-inner">
            <div className="brand">
              <a href="/">
                <img
                  src={require("../../img/logo-circle.svg")}
                  className="logo"
                  style={{ width: "40px", height: "40px" }}
                  alt="Logo"
                />
              </a>
            </div>
            <div className="text-menu">
              <a className="menu-item mt-0" href="/discover">
                Discover
              </a>
              <a className="menu-item mt-0" href="/communities">
                Communities
              </a>
            </div>
            <div className="flex-spacer" />
            <a className="btn btn-primary" href={fullVersionUrl}>
              View full version
            </a>
          </div>
        </div>
      </div>

      <div className="p-3 w-full fixed-bottom hidden block d-mhidden view-full-version">
        <a className="btn btn-primary py-2 w-full" href={fullVersionUrl}>
          View full version
        </a>
      </div>
    </>
  );
};
