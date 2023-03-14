import React from "react";
import "./index.scss";

interface Props {
  className?: string;
  style?: object;
}

export const Skeleton = ({ className, style }: Props) => {
  return <div className={`skeleton ${className}`} style={style} />;
};
