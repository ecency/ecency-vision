import React, {Component} from "react";

import {Entry} from "../../store/entries/types";
import {ActiveUser} from "../../store/active-user/types";

import PopoverConfirm from "../popover-confirm";

import {error} from "../feedback";

import {deleteComment, formatError} from "../../api/operations";

import _c from "../../util/fix-class-names";

interface Props {
    children: JSX.Element;
    entry: Entry;
    activeUser: ActiveUser | null;
    onSuccess: () => void
}

interface State {
    inProgress: boolean;
}

export class EntryDeleteBtn extends Component<Props> {
    state: State = {
        inProgress: false,
    };

    _mounted: boolean = true;

    componentWillUnmount() {
        this._mounted = false;
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    delete = () => {
        const {entry, activeUser, onSuccess} = this.props;

        this.stateSet({inProgress: true});
        deleteComment(activeUser?.username!, entry.author, entry.permlink)
            .then(() => {
                onSuccess();
                this.stateSet({inProgress: false});
            })
            .catch((e) => {
                error(formatError(e));
                this.stateSet({inProgress: false});
            })
    };

    render() {
        const {children} = this.props;
        const {inProgress} = this.state;

        const {className} = children.props;
        const baseCls = className ? className.replace("in-progress") : "";

        const clonedChildren = React.cloneElement(children, {
            className: _c(`${baseCls} ${inProgress ? "in-progress" : ""}`)
        });

        if (inProgress) {
            return clonedChildren
        }

        return (
            <PopoverConfirm onConfirm={this.delete}>
                {clonedChildren}
            </PopoverConfirm>
        );
    }
}

export default (props: Props) => {
    const p: Props = {
        children: props.children,
        entry: props.entry,
        activeUser: props.activeUser,
        onSuccess: props.onSuccess
    }

    return <EntryDeleteBtn {...p} />
}
