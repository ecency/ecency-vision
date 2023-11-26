import React from "react";
import { LatencyStatusBar } from "./latency-status-bar";

export function BottomStatusBar() {
  return (
    <div className="fixed flex justify-start bottom-0 left-0 right-0 duration-300 overflow-hidden border-r border-[--border-color] hover:w-full whitespace-nowrap">
      <LatencyStatusBar />
    </div>
  );
}
