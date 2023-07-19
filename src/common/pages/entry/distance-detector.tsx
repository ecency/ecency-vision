import React, { MutableRefObject, useEffect } from "react";

export function useDistanceDetector<T extends Element | null>(
  entryControlsRef: MutableRefObject<T>,
  showProfileBox: boolean,
  showWordCount: boolean,
  setShowProfileBox: (v: boolean) => void,
  setShowWordCount: (v: boolean) => void
) {
  useEffect(() => {
    window.addEventListener("scroll", detect);
    window.addEventListener("resize", detect);

    return () => {
      window.removeEventListener("scroll", detect);
      window.removeEventListener("resize", detect);
    };
  }, []);

  // detects distance between title and comments section sets visibility of profile card
  const detect = () => {
    const infoCard: HTMLElement | null = document.getElementById("avatar-fixed-container");
    const wordCounter: HTMLElement | null = document.getElementById("word-count");
    const top = entryControlsRef.current?.getBoundingClientRect().top || 120;

    if (infoCard != null && window.scrollY > 180 && top && !(top <= 0)) {
      infoCard.classList.replace("invisible", "visible");
      setShowProfileBox(true);
    } else if (infoCard != null && window.scrollY <= 180) {
      infoCard.classList.replace("visible", "invisible");
      setShowProfileBox(false);
    } else if (top && top <= 0 && infoCard !== null) {
      infoCard.classList.replace("visible", "invisible");
      setShowProfileBox(false);
    } else return;

    if (top && top > 0) {
      setShowWordCount(true);
    } else if (top && top < 0) {
      wordCounter?.classList.replace("visible", "invisible");
      setShowWordCount(false);
    } else return;
  };
}
