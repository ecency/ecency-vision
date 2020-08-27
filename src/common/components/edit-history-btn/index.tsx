import React, {Component} from "react";

import {Entry} from "../../store/entries/types";

import Tooltip from "../tooltip";

import {_t} from "../../i18n";

import EditHistory from "../edit-history";

import {historySvg} from "../../img/svg";

interface Props {
    entry: Entry;
    append?: JSX.Element
}

interface State {
    visible: boolean,
    dialog: boolean
}

export default class EditHistoryBtn extends Component<Props, State> {
    state: State = {
        visible: false,
        dialog: false
    }

    _mounted: boolean = true;

    componentDidMount() {
        this.detect();
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        const {entry} = this.props;
        if (!(entry.author === prevProps.entry.author && entry.permlink === prevProps.entry.permlink)) {
            this.detect();
        }
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (state: {}, cb?: () => void) => {
        if (this._mounted) {
            this.setState(state, cb);
        }
    };

    detect = () => {
        const {entry} = this.props;
        this.stateSet({dialog: false});
        // if comment dont show, otherwise always show
        if (entry.parent_author) {
            this.stateSet({visible: false});
        } else {
            this.stateSet({visible: true});
        }
    }

    toggleDialog = () => {
        const {dialog} = this.state;
        this.stateSet({dialog: !dialog});
    }

    render() {
        const {append, entry} = this.props;
        const {visible, dialog} = this.state;

        if (!visible) {
            return null;
        }

        return (
            <>
                <Tooltip content={_t("entry.show-history")}>
                    <a href="#" className="edit-history-btn" onClick={(e) => {
                        e.preventDefault();
                        this.toggleDialog();
                    }}>
                        {historySvg}
                    </a>
                </Tooltip>
                {append || null}
                {dialog && <EditHistory entry={entry} onHide={this.toggleDialog}/>}
            </>
        );
    }
}
