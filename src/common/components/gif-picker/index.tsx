import React from "react";
import BaseComponent from "../base";
import SearchBox from "../search-box";
import { _t } from "../../i18n";
import { insertOrReplace } from "../../util/input-util";
import _ from "lodash";
import { fetchGif } from "../../api/misc";
import "./_index.scss";
interface Props {
  fallback?: (e: string) => void;
  shGif: boolean;
  changeState: (gifState?: boolean) => void;
  style?: {
    width: string;
    bottom: string;
    left: string | number;
    marginLeft: string;
    borderTopLeftRadius: string;
    borderTopRightRadius: string;
    borderBottomLeftRadius: string;
  };
  gifImagesStyle?: {
    width: string;
  };
}

interface State {
  data: any[];
  filter: string | null;
  filteredData: any[];
  limit: string;
  offset: string;
  total_count: number;
}

interface GifImageStyle {
  width: string;
}

export default class GifPicker extends BaseComponent<Props> {
  state: State = {
    data: [],
    filter: "",
    filteredData: [],
    limit: "50",
    offset: "0",
    total_count: 0
  };
  _target: HTMLInputElement | null = null;

  handleScroll = async (e: any) => {
    const gifWrapper = e.target;
    const { offset, limit, total_count, filter, data } = this.state;
    // Added one to the div height while making comparison to account for the scrollbar height
    const bottom = gifWrapper.scrollHeight - gifWrapper.scrollTop <= gifWrapper.clientHeight + 1;
    if (bottom) {
      if (!filter && data?.length <= total_count) {
        return this.getGifsDataOnScroll(null, limit, offset + 50);
      }
      this.delayedSearchOnScroll(filter, limit, offset + 50);
    }
  };
  componentDidMount() {
    const gifWrapper = document.querySelector(".emoji-picker");
    gifWrapper?.addEventListener("scroll", this.handleScroll);
    this.getGifsData(null, this.state.limit, this.state.offset);

    this.watchTarget(); // initial

    if (typeof window !== "undefined") {
      window.addEventListener("focus", this.watchTarget, true);
    }
  }

  componentWillUnmount() {
    const gifWrapper = document.querySelector("#gif-wrapper");
    super.componentWillUnmount();
    if (typeof window !== "undefined") {
      window.removeEventListener("focus", this.watchTarget, true);
    }
    gifWrapper?.removeEventListener("scroll", this.handleScroll);
  }

  watchTarget = () => {
    if (document.activeElement?.classList.contains("accepts-emoji")) {
      this._target = document.activeElement as HTMLInputElement;
    }
  };

  getSearchedData = async (_filter: string | null, limit: string, offset: string) => {
    const { data } = await fetchGif(_filter, limit, offset);
    if (_filter?.length) {
      let _data: State = {
        data: [],
        filteredData: [...data.data],
        filter: this.state.filter,
        limit: data.pagination.limit,
        offset: data.pagination.offset + 10,
        total_count: data.pagination.total_count
      };
      this.stateSet(_data);
      return;
    }
    let _data: State = {
      data: [],
      filteredData: [...data.data],
      filter: this.state.filter,
      limit: data.pagination.limit,
      offset: data.pagination.offset + 10,
      total_count: data.pagination.total_count
    };
    this.stateSet(_data);
  };
  getSearchedDataOnScroll = async (_filter: string | null, limit: string, offset: string) => {
    const { data } = await fetchGif(_filter, limit, offset);
    if (_filter?.length) {
      let _data: State = {
        data: [],
        filteredData: [...this.state.filteredData, ...data.data],
        filter: this.state.filter,
        limit: data.pagination.limit,
        offset: data.pagination.offset + 10,
        total_count: data.pagination.total_count
      };
      this.stateSet(_data);
    }
  };

  getGifsData = async (_filter: string | null, limit: string, offset: string) => {
    const { data } = await fetchGif(_filter, limit, offset);
    let _data: State = {
      data: [...data.data],
      filteredData: [],
      filter: null,
      limit: this.state.limit,
      offset: data.pagination.offset,
      total_count: data.pagination.total_count
    };
    this.stateSet(_data);
  };
  getGifsDataOnScroll = async (_filter: string | null, limit: string, offset: string) => {
    const { data } = await fetchGif(_filter, limit, offset);
    let _data: State = {
      data: [...this.state.data, ...data.data],
      filteredData: [],
      filter: null,
      limit: this.state.limit,
      offset: data.pagination.offset,
      total_count: data.pagination.total_count
    };
    this.stateSet(_data);
  };

  itemClicked = async (
    url: string,
    _filter?: string | any,
    limit?: string | any,
    offset?: string | any
  ) => {
    const { data } = await fetchGif(_filter, limit, offset);
    const gifTitles: any = [];
    for (let i = 0; i < data.data.length; i++) {
      gifTitles.push(data.data[i].title);
    }
    const selecteGifTitle: string = gifTitles[_.random(gifTitles.length - 1)];
    let _url = url.split(".gif");
    let gifUrl = `![${selecteGifTitle}](${_url[0]}.gif)`;
    if (this._target) {
      insertOrReplace(this._target, gifUrl);
    } else {
      const { fallback } = this.props;
      if (fallback) fallback(gifUrl);
    }
    this.props.changeState(!this.props.shGif);
  };

  delayedSearch = _.debounce(this.getSearchedData, 2000);
  delayedSearchOnScroll = _.debounce(this.getSearchedDataOnScroll, 2000);

  filterChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ filter: e.target.value });
    if (e.target.value === "") {
      this.getGifsData(null, this.state.limit, this.state.offset);
      return;
    }
    this.delayedSearch(e.target.value, this.state.limit, this.state.offset);
  };

  renderEmoji = (gifData: any[] | null) => {
    const gifImageStyle: GifImageStyle = {
      width: "200px",
      ...(this.props.gifImagesStyle && this.props.gifImagesStyle)
    };
    return gifData?.map((_gif, i) => {
      return (
        <div className="emoji gifs" key={_gif?.id || i}>
          <img
            style={gifImageStyle}
            loading="lazy"
            src={_gif?.images?.fixed_height?.url}
            alt="can't fetch :("
            onClick={() => {
              this.itemClicked(_gif?.images?.fixed_height?.url);
            }}
          />
        </div>
      );
    });
  };

  render() {
    const { data, filteredData, filter } = this.state;
    if (!data.length && !filteredData.length) {
      return null;
    }

    const gifPickerStyle = {
      ...(this.props.style && this.props.style)
    };

    return (
      <div className="emoji-picker gif" style={gifPickerStyle} onScroll={this.handleScroll}>
        <SearchBox
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck="false"
          placeholder={_t("gif-picker.filter-placeholder")}
          onChange={this.filterChanged}
        />

        {(() => {
          if (filter) {
            return (
              <div className="gif-cat-list gif-cat-list" id="gif-wrapper">
                <div className="gif-cat gif-cat">
                  <div className="gif-list gif-list">{this.renderEmoji(filteredData)}</div>
                </div>
              </div>
            );
          } else {
            return (
              <div className="gif-cat-list gif-cat-list" id="gif-wrapper">
                <div className="gif-cat gif-cat">
                  <div className="gif-list gif-list">{this.renderEmoji(data)}</div>
                </div>
              </div>
            );
          }
        })()}
        <span className="flex justify-content-end">{_t("gif-picker.credits")}</span>
      </div>
    );
  }
}
