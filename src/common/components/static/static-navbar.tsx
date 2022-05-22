import React from 'react';

interface Props {
  fullVersionUrl: string;
}

export const StaticNavbar = ({ fullVersionUrl }: Props) => {
  return <>
    <div className="sticky-container" id="sticky-container">
      <div className="nav-bar-sm sticky">
        <div className="brand">
          <a href="/">
            <img src="http://localhost:3001/static/media/logo-circle.2df6f251.svg" className="logo" alt="Logo"/>
          </a>
        </div>
        <div className="text-menu">
          <a className="menu-item mt-0" href="/discover">Discover</a>
          <a className="menu-item mt-0" href="/communities">Communities</a>
        </div>
      </div>
      <div className="nav-bar">
        <div className="nav-bar-inner">
          <div className="brand">
            <a href="/">
              <img src="http://localhost:3001/static/media/logo-circle.2df6f251.svg" className="logo" alt="Logo"/>
            </a>
          </div>
          <div className="text-menu">
            <a className="menu-item mt-0" href="/discover">Discover</a>
            <a className="menu-item mt-0" href="/communities">Communities</a>
          </div>
          <div className="flex-spacer"/>
          <a className="btn btn-primary" href={fullVersionUrl}>View full version</a>
        </div>
      </div>
    </div>

    <div className="p-3 w-100 fixed-bottom hidden d-block d-md-none">
      <a className="btn btn-primary py-2 w-100" href={fullVersionUrl}>View full version</a>
    </div>
  </>
}