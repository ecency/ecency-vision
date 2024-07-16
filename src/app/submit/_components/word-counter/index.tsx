import React, { useCallback, useEffect, useState } from "react";
import i18next from "i18next";
import useInterval from "react-use/lib/useInterval";

interface WordStat {
  charactersNoSpaces: number;
  characters: number;
  words: number;
  lines: number;
}

export const wordCounter = (val: string): WordStat => {
  const wom = val.match(/\S+/g);

  return {
    charactersNoSpaces: val.replace(/\s+/g, "").length,
    characters: val.length,
    words: wom ? wom.length : 0,
    lines: val.split(/\r*\n/).length
  };
};

interface Props {
  selector: string;
  watch: boolean;
}

export function WordCount({ selector, watch }: Props) {
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(0.0);

  const countTime = useCallback(() => {
    const el = document.querySelector(selector) as HTMLDivElement;
    if (!el) {
      return { count: 0, time: 0.0 };
    }

    const val = el.innerText.trim();
    const { words } = wordCounter(val);
    const wordsPerSec = 140;
    const time = words / wordsPerSec;

    setTime(time);
    setCount(words);
  }, [selector]);

  useEffect(() => {
    countTime();
  }, [countTime]);

  useInterval(() => countTime, watch ? 1000 : null);

  if (count > 0) {
    return (
      <div className="words-count">
        <span className="words">{i18next.t("word-count.label", { n: count })}</span>
        <span className="time">
          {" "}
          {time <= 0.8
            ? i18next.t("word-count.read-time-less-1-min")
            : i18next.t("word-count.read-time-n-min", { n: Math.ceil(time) })}{" "}
        </span>
      </div>
    );
  }
  return <></>;
}
