import React from "react";
import { FormControl } from "react-bootstrap";
import BaseComponent from "../base";
import SearchBox from "../search-box";
import { _t } from "../../i18n";
import { getEmojiData } from "../../api/misc";
import * as ls from "../../util/local-storage";
import { insertOrReplace } from "../../util/input-util";
import { EmojiPickerStyleProps } from "../chats/types/chat-types";
import "./_index-old.scss";

interface Emoji {
  a: string;
  b: string;
  j: string[];
}

interface EmojiCategory {
  id: string;
  name: string;
  emojis: string[];
}

interface EmojiData {
  categories: EmojiCategory[];
  emojis: Record<string, Emoji>;
}

interface EmojiCacheItem {
  id: string;
  name: string;
  keywords: string[];
}

interface Props {
  fallback?: (e: string) => void;
  style?: EmojiPickerStyleProps;
}

interface State {
  data: EmojiData | null;
  cache: EmojiCacheItem[] | null;
  filter: string;
}

export default class EmojiPicker extends BaseComponent<Props> {
  state: State = {
    data: null,
    cache: null,
    filter: ""
  };

  _target: HTMLInputElement | null = null;

  componentDidMount() {
    getEmojiData().then((data) => this.setData(data));

    this.watchTarget(); // initial

    if (typeof window !== "undefined") {
      window.addEventListener("focus", this.watchTarget, true);
    }
  }

  componentWillUnmount() {
    super.componentWillUnmount();
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", this.watchTarget, true);
    }
  }

  watchTarget = () => {
    if (document.activeElement?.classList.contains("accepts-emoji")) {
      this._target = document.activeElement as HTMLInputElement;
    }
  };

  setData = (data: EmojiData) => {
    const cache: EmojiCacheItem[] = Object.keys(data.emojis).map((e) => {
      const em = data.emojis[e];
      return {
        id: e,
        name: em.a.toLowerCase(),
        keywords: em.j ? em.j : []
      };
    });

    this.stateSet({ data, cache });
  };

  filterChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>) => {
    this.setState({ filter: e.target.value });
  };

  clicked = (id: string, native: string) => {
    const recent = ls.get("recent-emoji", []);
    if (!recent.includes(id)) {
      const newRecent = [...new Set([id, ...recent])].slice(0, 18);
      ls.set("recent-emoji", newRecent);
      this.forceUpdate(); // Re-render recent list
    }

    if (this._target) {
      insertOrReplace(this._target, native);
    } else {
      const { fallback } = this.props;
      if (fallback) fallback(native);
    }
  };

  renderEmoji = (emoji: string) => {
    const { data } = this.state;
    const em = data!.emojis[emoji];
    if (!em) {
      return null;
    }
    const unicodes = em.b.split("-");
    const codePoints = unicodes.map((u) => Number(`0x${u}`));
    const native = String.fromCodePoint(...codePoints);

    return (
      <div
        onClick={() => {
          this.clicked(emoji, native);
        }}
        key={emoji}
        className="emoji"
        title={em.a}
      >
        {native}
      </div>
    );
  };

  render() {
    const { data, cache, filter } = this.state;
    if (!data || !cache) {
      return null;
    }

    const recent: string[] = ls.get("recent-emoji", []);

    const emojiPickerStyle = {
      ...(this.props.style && this.props.style)
    };

    return (
      <div className="emoji-picker" style={emojiPickerStyle}>
        <SearchBox
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={_t("emoji-picker.filter-placeholder")}
          value={filter}
          onChange={this.filterChanged}
        />

        {(() => {
          if (filter) {
            const results = cache
              .filter(
                (i) =>
                  i.id.indexOf(filter) !== -1 ||
                  i.name.indexOf(filter) !== -1 ||
                  i.keywords.includes(filter)
              )
              .map((i) => i.id);

            return (
              <div className="emoji-cat-list">
                <div className="emoji-cat">
                  <div className="emoji-list">
                    {results.length === 0 && _t("emoji-picker.filter-no-match")}
                    {results.length > 0 && results.map((emoji) => this.renderEmoji(emoji))}
                  </div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="emoji-cat-list">
                {recent.length > 0 && (
                  <div className="emoji-cat">
                    <div className="cat-title">{_t("emoji-picker.recently-used")}</div>
                    <div className="emoji-list">
                      {recent.map((emoji) => this.renderEmoji(emoji))}
                    </div>
                  </div>
                )}

                {data.categories.map((cat) => (
                  <div className="emoji-cat" key={cat.id}>
                    <div className="cat-title">{cat.name}</div>
                    <div className="emoji-list">
                      {cat.emojis.map((emoji) => this.renderEmoji(emoji))}
                    </div>
                  </div>
                ))}
              </div>
            );
          }
        })()}
      </div>
    );
  }
}
