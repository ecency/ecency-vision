import React from "react";

const SSRSuspense =
  typeof window !== "undefined" ? React.Suspense : ({ children, ...props }: any) => children;

export default SSRSuspense;
