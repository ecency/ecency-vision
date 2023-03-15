import React, { useState, useEffect } from "react";
import "./index.scss";

interface Props {
  progressBarType: string;
}

export default function ProgressBar(props: Props) {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      console.log("Interval run");
      setProgress((prevProgress) => prevProgress - 25);
    }, 1000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const style = {
    width: `${progress}%`
  };

  return (
    <div className="toast-progress-bar">
      <div className={`filler + ${props.progressBarType}`} style={style}></div>
    </div>
  );
}
