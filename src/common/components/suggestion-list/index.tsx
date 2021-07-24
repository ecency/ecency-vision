import React, {Component} from "react";

interface Props {
    items: any[];
    header?: string;
    containerClassName?: string;
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

        const input = this.getPossibleInput();
        if (input) {
            if (input === document.activeElement) {
                this.setState({showList: true});
            }
            input.addEventListener("focus", this.watchInputFocus);
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
        const {showList} = this.state;
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
        const {showList} = this.state;
        if (!showList) {
            return;
        }

        const target = e.target as Element;
        const val = this.parent.current?.contains(target);
        this.setState({showList: val});
    };

    watchInputFocus = (e: Event) => {
        this.setState({showList: true});
    };

    render() {
        const {children, items, header, renderer, containerClassName} = this.props;
        const {showList} = this.state;
        
        return (
            <>
                <div className={containerClassName ? `suggestion ${containerClassName}` : "suggestion"} ref={this.parent}>
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
                                                const {onSelect} = this.props;
                                                if (onSelect) {
                                                    onSelect(x);
                                                }

                                                this.setState({showList: false});
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
