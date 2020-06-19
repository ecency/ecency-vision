import React, { Component } from "react";

interface Props {
  items: any[];
  header?: string;
  renderer?: (item: any) => JSX.Element;
  onSelect?: (item: any) => void;
  children: JSX.Element;
}

interface State {
  showList: boolean;
}

export default class SuggestionList extends Component<Props> {
  state: State = {
    showList: false,
  };

  parent = React.createRef<HTMLDivElement>();

  componentDidMount() {
    document.addEventListener("keydown", this.watchKb);
    document.addEventListener("click", this.watchClick);
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.watchKb);
    document.removeEventListener("click", this.watchClick);
  }

  focusInput = () => {
    const el = this.parent.current?.querySelector("input[type='text']") as HTMLInputElement;
    if (el) {
      el.focus();
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
    const target = e.target as Element;
    const showList = this.parent.current?.contains(target);
    this.setState({ showList });
  };

  render() {
    const { children, items, header, renderer } = this.props;
    const { showList } = this.state;
    return (
      <>
        <div className="suggestion" ref={this.parent}>
          {children}

          {showList && items.length > 0 && (
            <div className="suggestion-list">
              {header && <div className="list-header">{header}</div>}
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
          )}
        </div>
      </>
    );
  }
}
