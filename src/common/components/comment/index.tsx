import React, { Component, Ref } from "react";

import { Button } from "react-bootstrap";

import { User } from "../../store/users/types";
import { ActiveUser } from "../../store/active-user/types";
import { Account } from "../../store/accounts/types";
import { ToggleType, UI } from "../../store/ui/types";
import { Entry } from "../../store/entries/types";

import EditorToolbar from "../editor-toolbar";
import LoginRequired from "../login-required";
import { detectEvent, toolbarEventListener } from "../../components/editor-toolbar";

import defaults from "../../constants/defaults.json";

import { renderPostBody, setProxyBase } from "@ecency/render-helper";
import { _t } from "../../i18n";
import { Global } from "../../store/global/types";
import * as ss from "../../util/session-storage";

import TextareaAutocomplete from "../textarea-autocomplete";
import { AvailableCredits } from "../available-credits";
import { Location } from "history";
import "./_index.scss";
import { Spinner } from "@ui/spinner";

setProxyBase(defaults.imageServer);

interface PreviewProps {
  text: string;
  global: Global;
}

export class CommentPreview extends Component<PreviewProps> {
  shouldComponentUpdate(nextProps: Readonly<PreviewProps>): boolean {
    return this.props.text !== nextProps.text;
  }

  render() {
    const { text, global } = this.props;

    if (text === "") {
      return null;
    }

    return (
      <div className="comment-preview">
        <div className="comment-preview-header">{_t("comment.preview")}</div>
        <div
          className="preview-body markdown-view"
          dangerouslySetInnerHTML={{ __html: renderPostBody(text, false, global.canUseWebp) }}
        />
      </div>
    );
  }
}

interface Props {
  defText: string;
  submitText: string;
  users: User[];
  activeUser: ActiveUser | null;
  ui: UI;
  global: Global;
  entry: Entry;
  location: Location;
  inProgress?: boolean;
  isCommented?: boolean;
  cancellable?: boolean;
  autoFocus?: boolean;
  setActiveUser: (username: string | null) => void;
  updateActiveUser: (data?: Account) => void;
  deleteUser: (username: string) => void;
  toggleUIProp: (what: ToggleType) => void;
  onSubmit: (text: string) => void;
  resetSelection?: () => void;
  onCancel?: () => void;
  inputRef?: Ref<any>;
}

interface State {
  text: string;
  preview: string;
  showEmoji: boolean;
  showGif: boolean;
  inputHeight: number;
}

export class Comment extends Component<Props, State> {
  commentBodyRef: React.RefObject<HTMLDivElement>;
  constructor(props: Props) {
    super(props);
    this.commentBodyRef = React.createRef();
  }
  state: State = {
    text: "",
    preview: "",
    showEmoji: false,
    showGif: false,
    inputHeight: 0
  };

  timer: any = null;
  _updateTimer: any = null;

  componentDidMount(): void {
    const { defText } = this.props;
    this.setState({ text: defText || "", preview: defText || "" });

    this.addToolbarEventListners();
  }

  componentDidUpdate(prevProps: Readonly<Props>): void {
    const { defText, resetSelection, isCommented } = this.props;
    const { text } = this.state;
    if (defText !== prevProps.defText && !prevProps.defText) {
      let commentText = text ? text + "\n" + defText : defText;
      this.setState({ text: commentText || "", preview: commentText || "" });
      if (resetSelection) resetSelection();
      this.updateLsCommentDraft(commentText);
    }
    if (prevProps.isCommented && !isCommented) {
      this.setState({ text: "", preview: "" });
    }
  }

  componentWillUnmount(): void {
    this.removeToolbarEventListners();
  }

  updateLsCommentDraft = (text: string) => {
    const { entry } = this.props;
    ss.set(`reply_draft_${entry.author}_${entry.permlink}`, text);
  };

  textChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { value: text } = e.target;
    let scHeight: number = e.target.scrollHeight;
    let reduceScHeight: number = scHeight - 20 || scHeight - 24;
    if (reduceScHeight) {
      scHeight = reduceScHeight;
    }
    this.setState({ text, inputHeight: scHeight }, () => {
      this.updateLsCommentDraft(text);
      this.updatePreview();
    });
  };

  updatePreview = (): void => {
    if (this._updateTimer) {
      clearTimeout(this._updateTimer);
      this._updateTimer = null;
    }

    this._updateTimer = setTimeout(() => {
      const { text } = this.state;
      this.setState({ preview: text || "" });
    }, 50);
  };

  submit = () => {
    const { text } = this.state;
    const { onSubmit } = this.props;
    onSubmit(text);
  };

  cancel = () => {
    const { onCancel } = this.props;
    if (onCancel) onCancel();
  };

  addToolbarEventListners = () => {
    if (this.commentBodyRef) {
      const el = this.commentBodyRef?.current;

      if (el) {
        el.addEventListener("paste", this.handlePaste);
        el.addEventListener("dragover", this.handleDragover);
        el.addEventListener("drop", this.handleDrop);
      }
    }
  };

  removeToolbarEventListners = () => {
    if (this.commentBodyRef) {
      const el = this.commentBodyRef?.current;

      if (el) {
        el.removeEventListener("paste", this.handlePaste);
        el.removeEventListener("dragover", this.handleDragover);
        el.removeEventListener("drop", this.handleDrop);
      }
    }
  };

  handlePaste = (event: Event): void => {
    toolbarEventListener(event, "paste");
  };

  handleDragover = (event: Event): void => {
    toolbarEventListener(event, "dragover");
  };

  handleDrop = (event: Event): void => {
    toolbarEventListener(event, "drop");
  };
  handleShortcuts = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.altKey && e.key === "b") {
      detectEvent("bold");
    }
    if (e.altKey && e.key === "i") {
      detectEvent("italic");
    }
    if (e.altKey && e.key === "t") {
      detectEvent("table");
    }
    if (e.altKey && e.key === "k") {
      detectEvent("link");
    }
    if (e.altKey && e.key === "c") {
      detectEvent("codeBlock");
    }
    if (e.altKey && e.key === "d") {
      detectEvent("image");
    }
    if (e.altKey && e.key === "m") {
      detectEvent("blockquote");
    }
  };

  render() {
    const { inProgress, cancellable, autoFocus, submitText, inputRef, activeUser } = this.props;
    const { text, preview, showEmoji, showGif, inputHeight } = this.state;
    const rows = text.split(/\r\n|\r|\n|<br>/).length;

    return (
      <>
        <div
          className="comment-box"
          onMouseEnter={() =>
            !showEmoji && !showGif && this.setState({ showEmoji: true, showGif: true })
          }
        >
          {EditorToolbar({ ...this.props, sm: true, showEmoji })}
          <div className="comment-body" onKeyDown={this.handleShortcuts} ref={this.commentBodyRef}>
            <TextareaAutocomplete
              className={`the-editor accepts-emoji ${text?.length > 20 ? "expanded" : ""}`}
              as="textarea"
              placeholder={_t("comment.body-placeholder")}
              containerStyle={{ height: !text ? "80px" : inputHeight }}
              value={text}
              onChange={this.textChanged}
              disabled={inProgress}
              autoFocus={autoFocus}
              minrows={10}
              rows={rows}
              maxrows={100}
              ref={inputRef}
              acceptCharset="UTF-8"
              global={this.props.global}
              id="the-editor"
              spellCheck={true}
              activeUser={(activeUser && activeUser.username) || ""}
              isComment={true}
            />
            <div className="editor-toolbar bottom">
              {this.props.activeUser ? (
                <AvailableCredits
                  className="p-2 w-100"
                  operation="comment_operation"
                  username={this.props.activeUser.username}
                  activeUser={activeUser}
                  location={this.props.location}
                />
              ) : (
                <></>
              )}
            </div>
          </div>
          <div className="comment-buttons d-flex align-items-center mt-3">
            {cancellable && (
              <Button
                className="btn-cancel"
                size="sm"
                variant="outline-primary"
                disabled={inProgress}
                onClick={this.cancel}
              >
                {_t("g.cancel")}
              </Button>
            )}
            {LoginRequired({
              ...this.props,
              children: (
                <Button
                  className="btn-submit"
                  size="sm"
                  disabled={inProgress}
                  onClick={this.submit}
                >
                  {inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />} {submitText}
                </Button>
              )
            })}
          </div>
          <CommentPreview global={this.props.global} text={preview} />
        </div>
      </>
    );
  }
}

export default (p: Props) => {
  const props: Props = {
    defText: p.defText,
    submitText: p.submitText,
    users: p.users,
    activeUser: p.activeUser,
    ui: p.ui,
    global: p.global,
    entry: p.entry,
    inProgress: p.inProgress,
    isCommented: p.isCommented,
    cancellable: p.cancellable,
    autoFocus: p.autoFocus,
    setActiveUser: p.setActiveUser,
    updateActiveUser: p.updateActiveUser,
    deleteUser: p.deleteUser,
    toggleUIProp: p.toggleUIProp,
    onSubmit: p.onSubmit,
    resetSelection: p.resetSelection,
    onCancel: p.onCancel,
    inputRef: p.inputRef,
    location: p.location
  };

  return <Comment {...props} />;
};
