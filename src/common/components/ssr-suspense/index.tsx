import React from "react";

const SSRSuspense =
  typeof window !== "undefined" && window.location.href.indexOf('file://') === -1
    ? React.Suspense
    : ({ children, ...props }:any) => children;

export default SSRSuspense;
