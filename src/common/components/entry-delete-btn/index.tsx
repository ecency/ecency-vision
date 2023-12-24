import React, { ReactElement } from "react";
import { Entry } from "../../store/entries/types";
import { ActiveUser } from "../../store/active-user/types";
import BaseComponent from "../base";
import PopoverConfirm from "@ui/popover-confirm";
import { error } from "../feedback";
import { deleteComment, formatError } from "../../api/operations";
import _c from "../../util/fix-class-names";
import { queryClient, QueryIdentifiers } from "../../core";

interface Props {
  children: ReactElement;
  entry: Entry;
  parent?: Entry;
  activeUser: ActiveUser | null;
  onSuccess?: () => void;
  setDeleteInProgress?: (value: boolean) => void;
  isComment?: boolean;
}

interface State {
  inProgress: boolean;
}

export class EntryDeleteBtn extends BaseComponent<Props> {
  state: State = {
    inProgress: false
  };

  delete = () => {
    const { entry, activeUser, onSuccess, setDeleteInProgress, parent } = this.props;
    setDeleteInProgress && setDeleteInProgress(true);

    this.stateSet({ inProgress: true });
    deleteComment(activeUser?.username!, entry.author, entry.permlink)
      .then(() => {
        onSuccess?.();
        this.stateSet({ inProgress: false });
        setDeleteInProgress && setDeleteInProgress(false);

        if (parent) {
          const previousReplies =
            queryClient.getQueryData<Entry[]>([
              QueryIdentifiers.FETCH_DISCUSSIONS,
              parent?.author,
              parent?.permlink
            ]) ?? [];
          queryClient.setQueryData(
            [QueryIdentifiers.FETCH_DISCUSSIONS, parent?.author, parent?.permlink],
            [
              ...previousReplies.filter(
                (r) => r.author !== entry.author || r.permlink !== entry.permlink
              )
            ]
          );
        }
      })
      .catch((e) => {
        error(...formatError(e));
        this.stateSet({ inProgress: false });
        setDeleteInProgress && setDeleteInProgress(false);
      });
  };

  render() {
    const { children } = this.props;
    const { inProgress } = this.state;

    const { className } = children.props;
    const baseCls = className ? className.replace("in-progress") : "";

    const clonedChildren = React.cloneElement(children, {
      className: _c(`${baseCls} ${inProgress ? "in-progress" : ""}`)
    });

    if (inProgress) {
      return clonedChildren;
    }

    return <PopoverConfirm onConfirm={this.delete}>{clonedChildren}</PopoverConfirm>;
  }
}

export default (props: Props) => {
  const p: Props = {
    children: props.children,
    entry: props.entry,
    activeUser: props.activeUser,
    onSuccess: props.onSuccess,
    setDeleteInProgress: props.setDeleteInProgress
  };

  return <EntryDeleteBtn {...p} />;
};
