import React, {Component, Ref} from "react";

import {Form, FormControl, Button, Spinner} from "react-bootstrap";

import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";
import {UI, ToggleType} from "../../store/ui/types";
import {Entry} from "../../store/entries/types";

import EditorToolbar from "../editor-toolbar";
import LoginRequired from "../login-required";

import defaults from "../../constants/defaults.json";

import {renderPostBody, setProxyBase} from "@ecency/render-helper";
import { getCommunity } from "../../api/bridge";

setProxyBase(defaults.imageServer);

import {_t} from "../../i18n";
import {Global} from '../../store/global/types';
import * as ls from "../../util/local-storage";
import { updateUserPoints } from "../../api/breakaway";

interface PreviewProps {
    text: string;
    global: Global;
}


export class CommentPreview extends Component<PreviewProps> {
    shouldComponentUpdate(nextProps: Readonly<PreviewProps>): boolean {
        return this.props.text !== nextProps.text
    }

    render() {
        const {text, global} = this.props;

        if (text === '') {
            return null;
        }

        return <div className="comment-preview">
            <div className="comment-preview-header">{_t('comment.preview')}</div>
            <div className="preview-body markdown-view" dangerouslySetInnerHTML={{__html: renderPostBody(text, false, global.canUseWebp)}}/>
        </div>;
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
    text: string,
    preview: string,
    showEmoji: boolean,
    communityData: any,
}

export class Comment extends Component<Props, State> {
    state: State = {
        text: '',
        preview: '',
        showEmoji: false,
        communityData: {}
    }

    _updateTimer: any = null;

    componentDidMount(): void {
        const {defText} = this.props;
        this.setState({text: defText || "", preview: defText || ""});
        this.getCommunityInfo()
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {defText, resetSelection, isCommented} = this.props;
        const {text} = this.state;
        if ((defText !== prevProps.defText) && !prevProps.defText) {
            let commentText = text ? text + '\n' + defText : defText
            this.setState({text: commentText || "", preview: commentText || ""});
            if (resetSelection) resetSelection()
            this.updateLsCommentDraft(commentText)
        }
        if(prevProps.isCommented && !isCommented) {
            this.setState({text: "", preview: ""})
        }
    }

    updateLsCommentDraft = (text: string) => {
        const {entry} = this.props
        ls.set(`reply_draft_${entry.author}_${entry.permlink}`, text);
    }

    textChanged = (e: React.ChangeEvent<typeof FormControl & HTMLInputElement>): void => {
        const {value: text} = e.target;
        this.setState({text}, () => {
            this.updateLsCommentDraft(text)
            this.updatePreview();
        });
    };

    updatePreview = (): void => {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }

        this._updateTimer = setTimeout(() => {
            const {text} = this.state;
            this.setState({preview: text || ""});
        }, 500);
    };

    submit = async () => {
        const {text, communityData} = this.state;
        const {onSubmit, activeUser} = this.props;
        try {            
            onSubmit(text);
            const res = await updateUserPoints(activeUser!.username, communityData.title, "comments")
        } catch (error) {
            
        }
    }

    cancel = () => {
        const {onCancel} = this.props;
        if (onCancel) onCancel();
    }

    getCommunityInfo = async () => {
        const communityData = await getCommunity(this.props.global.hive_id)
        this.setState({communityData})
      }

    render() {
        const {inProgress, cancellable, autoFocus, submitText, inputRef} = this.props;
        const {text, preview, showEmoji} = this.state;
        return (
            <>
                <div className="comment-box" onMouseEnter={() => !showEmoji && this.setState({showEmoji: true})}>
                    {EditorToolbar({...this.props, sm: true, showEmoji})}
                    <div className="comment-body">
                        <Form.Control
                            className={`the-editor accepts-emoji ${text.length > 20 ? 'expanded' : ''}`}
                            as="textarea"
                            placeholder={_t("comment.body-placeholder")}
                            value={text}
                            onChange={this.textChanged}
                            disabled={inProgress}
                            autoFocus={autoFocus}
                            rows={text.split(/\r\n|\r|\n/).length}
                            ref={inputRef}
                        />
                    </div>
                    <div className="comment-buttons">
                        {cancellable && (
                            <Button className="btn-cancel" size="sm" variant="outline-primary" disabled={inProgress} onClick={this.cancel}>{_t('g.cancel')}</Button>
                        )}
                        {LoginRequired({
                            ...this.props,
                            children: <Button 
                                className="btn-submit" 
                                size="sm" 
                                disabled={inProgress} 
                                onClick={this.submit}
                            >
                                {inProgress && (<Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>)} {submitText}
                            </Button>
                        })}
                    </div>
                    <CommentPreview global={this.props.global} text={preview}/>
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
    }

    return <Comment {...props} />
}
