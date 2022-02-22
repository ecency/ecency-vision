import React from "react";

const SSRSuspense =
  typeof window !== "undefined" && !window.location.href.startsWith('file://')
    ? React.Suspense
    : ({ children, ...props }:any) => children;

export default SSRSuspense;
