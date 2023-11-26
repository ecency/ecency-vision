import React, { useContext, useMemo } from "react";
import { CoreContext } from "../../core";
import { classNameObject } from "../../helper/class-name-object";

export function LatencyStatusBar() {
  const { lastLatency, server } = useContext(CoreContext);

  const status = useMemo(() => {
    if (lastLatency < 150) {
      return "Stable connection";
    } else if (lastLatency !== Infinity) {
      return "Poor connection";
    } else {
      return "No connection";
    }
  }, [lastLatency]);

  return (
    <div
      className={classNameObject({
        "bg-white flex leading-0 items-center gap-2 border-t text-xs font-[500] py-0.5 px-2 border-[--border-color]":
          true,
        "text-green-dark": status === "Stable connection",
        "text-orange": status === "Poor connection",
        "text-red": status === "No connection"
      })}
    >
      <svg width={16} height={12} viewBox="0 0 24 16" fill="currentColor">
        <rect width={2} height={4} x={0} y={12} />
        <rect width={2} height={8} x={6} y={10} />
        {lastLatency < 150 && <rect width={2} height={12} x={12} y={4} />}
        {lastLatency < 150 && <rect width={2} height={16} x={18} />}
      </svg>

      <div className="flex items-center">
        <span>
          {lastLatency}ms – {status}
        </span>
        <div className="text-gray-600 dark:text-gray-400 pl-1">– {server}</div>
      </div>
    </div>
  );
}
