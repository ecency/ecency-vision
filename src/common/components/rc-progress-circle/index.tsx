import React from "react";

const RcProgressCircle = (props: any) => {
  const { radius, dasharray, usedOffset, unUsedOffset } = props;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" version="1.1">
      <circle
        cx="80"
        cy="80"
        r={radius}
        style={{ strokeDashoffset: "0", strokeDasharray: dasharray, stroke: "#357ce6" }}
      />
      <circle
        cx="80"
        cy="80"
        r={radius}
        style={{
          strokeDashoffset: usedOffset,
          strokeDasharray: dasharray,
          stroke: "#357ce6"
        }}
      />
      <circle
        cx="80"
        cy="80"
        r={radius}
        style={{
          strokeDashoffset: unUsedOffset,
          strokeDasharray: dasharray,
          stroke: "#F0706A"
        }}
      />
    </svg>
  );
};

export default RcProgressCircle;
