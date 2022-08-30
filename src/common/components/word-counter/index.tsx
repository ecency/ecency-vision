import React, { Component } from "react";

import isEqual from "react-fast-compare";

import { _t } from "../../i18n";

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

interface State {
  count: number;
  time: number;
}

export default class WordCount extends Component<Props, State> {
  state: State = {
    count: 0,
    time: 0
  };

  _timer: any = null;

  componentDidMount() {
    const { watch } = this.props;

    if (watch) {
      this._timer = setInterval(this.countWords, 1000);
    } else {
      setTimeout(() => {
        this.countWords();
      }, 1000);
    }
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<{}>): boolean {
    return !isEqual(this.state, nextState);
  }

  componentWillUnmount() {
    clearInterval(this._timer);
  }

  countWords = () => {
    const { selector } = this.props;
    const el = document.querySelector(selector) as HTMLDivElement;
    if (!el) {
      return;
    }

    const val = el.innerText.trim();
    const { words } = wordCounter(val);
    const wordsPerSec = 140;
    const time = words / wordsPerSec;

    this.setState({ count: words, time });
  };

  render() {
    const { count, time } = this.state;

    let timeEl = null;

    if (time <= 0.8) {
      timeEl = _t("word-count.read-time-less-1-min");
    } else {
      timeEl = _t("word-count.read-time-n-min", { n: Math.ceil(time) });
    }

    if (count > 0) {
      return (
        <div className="words-count">
          <span className="words">{_t("word-count.label", { n: count })}</span>
          <span className="time"> {timeEl} </span>
        </div>
      );
    }
    return null;
  }
}
