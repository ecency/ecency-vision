import React, { Component, CSSProperties } from "react";
import { History, Location } from "history";
import { _t } from "../../i18n";
import "./_index.scss";
import { classNameObject } from "../../helper/class-name-object";
import ClickAwayListener from "../clickaway-listener";

interface Props {
  history?: History;
  location?: Location;
  items: any[];
  modeItems?: any[];
  header?: string;
  containerClassName?: string;
  renderer?: (item: any) => JSX.Element;
  onSelect?: (item: any) => void;
  children: JSX.Element;
  searchValue?: string;
  ignoreFirstInputFocus?: boolean;
  listStyle?: CSSProperties;
}

interface State {
  showList: boolean;
}

export default class SuggestionList extends Component<Props> {
  state: State = {
    showList: false
  };

  parent = React.createRef<HTMLDivElement>();

  componentDidMount() {
    document.addEventListener("keydown", this.watchKb);
    document.addEventListener("click", this.watchClick);

    const input = this.getPossibleInput();
    if (input) {
      if (input === document.activeElement && !this.props.ignoreFirstInputFocus) {
        this.setState({ showList: true });
      }

      if (this.props.ignoreFirstInputFocus) {
        input.blur();
      }

      input.addEventListener("focus", this.watchInputFocus);
    }
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    if (prevProps.modeItems !== this.props.modeItems && this.props.modeItems!.length > 0) {
      this.setState({ showList: true });
    }
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.watchKb);
    document.removeEventListener("click", this.watchClick);

    const input = this.getPossibleInput();
    if (input) {
      input.removeEventListener("focus", this.watchInputFocus);
    }
  }

  getPossibleInput = (): HTMLInputElement | null => {
    return this.parent.current?.querySelector("input[type='text']") as HTMLInputElement;
  };

  focusInput = () => {
    const input = this.getPossibleInput();
    if (input) {
      input.focus();
    }
  };

  focusItem = (index: number) => {
    const el = this.parent.current?.querySelectorAll(".list-item")[index] as HTMLLinkElement;
    if (el) {
      el.focus();
    }
  };

  getFocusedIndex = (): number => {
    const el = this.parent.current?.querySelector(".list-item:focus") as HTMLLinkElement;
    if (el && el.parentElement) {
      return [...el.parentElement.children].indexOf(el);
    }

    return -1;
  };

  moveUp = () => {
    const i = this.getFocusedIndex();
    if (i === 0) {
      this.focusInput();
      return;
    }
    this.focusItem(i - 1);
  };

  moveDown = () => {
    const i = this.getFocusedIndex();
    this.focusItem(i + 1);
  };

  watchKb = (e: KeyboardEvent) => {
    const { showList } = this.state;
    if (!showList) {
      return;
    }

    switch (e.keyCode) {
      case 38:
        e.preventDefault();
        this.moveUp();

        break;
      case 40:
        e.preventDefault();
        this.moveDown();
        break;
      default:
        break;
    }
  };

  watchClick = (e: MouseEvent) => {
    const { showList } = this.state;
    if (!showList) {
      return;
    }

    const target = e.target as Element;
    const val = this.parent.current?.contains(target);
    this.setState({ showList: val });
  };

  watchInputFocus = (e: Event) => {
    this.setState({ showList: true });
  };

  moreResultsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const { history, location, searchValue } = this.props;
    this.setState({ showList: false });
    if (!!searchValue && !!history && !!location) {
      if (["/search-more", "/search-more/"].includes(location.pathname)) {
        history.push(`/search-more/?q=${encodeURIComponent(searchValue)}`);
      } else {
        history.push(`/search/?q=${encodeURIComponent(searchValue)}`);
      }
    }
  };

  render() {
    const { children, items, header, renderer, containerClassName, modeItems } = this.props;
    const { showList } = this.state;
    const modeItemsUI = modeItems && (
      <div className="suggestion-list-parent">
        {modeItems.map((modeItem, modeKey) => {
          const _items = modeItem.items;
          return (
            _items.length > 0 && (
              <div className="search-suggestion-list" key={modeKey}>
                {modeItem.header && <div className="list-header">{modeItem.header}</div>}
                <div className="list-body">
                  {_items.map((x: any, i: number) => {
                    const content = modeItem.renderer ? modeItem.renderer(x) : x;
                    return (
                      <a
                        href="#"
                        key={i}
                        className="list-item"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          modeItem.onSelect && modeItem.onSelect(x);
                          this.setState({ showList: false });
                        }}
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </div>
            )
          );
        })}
        <div className="search-suggestion-list more-result">
          <div className="list-body">
            <a href="#" className="list-item" onClick={this.moreResultsClick}>
              {_t("g.more-results")}
            </a>
          </div>
        </div>
      </div>
    );

    return (
      <>
        <div
          className={classNameObject({
            "suggestion relative": true,
            [containerClassName ?? ""]: !!containerClassName
          })}
          ref={this.parent}
        >
          {children}
          <ClickAwayListener onClickAway={() => this.setState({ showList: false })}>
            {showList && modeItems && modeItems?.length > 0 ? modeItemsUI : <></>}
            {showList && !modeItems && items.length > 0 ? (
              <div
                className="modal-suggestion-list rounded-3xl -top-[44px] absolute"
                style={this.props.listStyle}
              >
                {header && (
                  <div className="list-header bg-gray-100 dark:bg-gray-700 text-sm font-semibold text-gray-600 px-2 pb-2 pt-12">
                    {header}
                  </div>
                )}
                <div className="list-body">
                  {items.map((x, i) => {
                    const content = renderer ? renderer(x) : x;
                    return (
                      <a
                        href="#"
                        key={i}
                        className="list-item"
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          const { onSelect } = this.props;
                          if (onSelect) {
                            onSelect(x);
                          }

                          this.setState({ showList: false });
                        }}
                      >
                        {content}
                      </a>
                    );
                  })}
                </div>
              </div>
            ) : (
              <></>
            )}
          </ClickAwayListener>
        </div>
      </>
    );
  }
}
