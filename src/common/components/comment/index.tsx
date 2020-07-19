import React, {Component} from "react";

import {Form, FormControl, Button, Spinner} from "react-bootstrap";

import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";
import {Account} from "../../store/accounts/types";

import EditorToolbar from "../editor-toolbar";
import LoginRequired from "../login-required";

import defaults from "../../constants/defaults.json";

import {
    renderPostBody,
    setProxyBase,
    // @ts-ignore
} from "@esteemapp/esteem-render-helpers";

setProxyBase(defaults.imageServer);

import {_t} from "../../i18n";

interface PreviewProps {
    text: string
}


export class CommentPreview extends Component<PreviewProps> {
    shouldComponentUpdate(nextProps: Readonly<PreviewProps>): boolean {
        return this.props.text !== nextProps.text
    }

    render() {
        const {text} = this.props;

        if (text === '') {
            return null;
        }

        return <div className="comment-preview">
            <div className="comment-preview-header">{_t('comment.preview')}</div>
            <div className="preview-body markdown-view" dangerouslySetInnerHTML={{__html: renderPostBody(text)}}/>
        </div>;
    }
}

interface Props {
    defText: string;
    submitText: string;
    users: User[];
    activeUser: ActiveUser | null;
    inProgress?: boolean;
    cancellable?: boolean;
    autoFocus?: boolean;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    onSubmit: (text: string) => void;
    onChange?: (text: string) => void;
    onCancel?: () => void
}

interface State {
    text: string,
    preview: string
}

export default class Comment extends Component<Props, State> {
    state: State = {
        text: '',
        preview: ''
    }

    _updateTimer: any = null;

    componentDidMount(): void {
        const {defText} = this.props;
        this.setState({text: defText, preview: defText});
    }

    componentDidUpdate(prevProps: Readonly<Props>): void {
        const {defText} = this.props;
        if (defText !== prevProps.defText) {
            this.setState({text: defText, preview: defText});
        }
    }

    textChanged = (e: React.ChangeEvent<FormControl & HTMLInputElement>): void => {
        const {value: text} = e.target;
        this.setState({text}, () => {
            this.updatePreview();
        });
    };

    updatePreview = (): void => {
        if (this._updateTimer) {
            clearTimeout(this._updateTimer);
            this._updateTimer = null;
        }

        this._updateTimer = setTimeout(() => {
            const {onChange} = this.props;
            const {text} = this.state;
            this.setState({preview: text});
            if (onChange) onChange(text);
        }, 500);
    };

    submit = () => {
        const {text} = this.state;
        const {onSubmit} = this.props;
        onSubmit(text);
    }

    cancel = () => {
        const {onCancel} = this.props;
        if (onCancel) onCancel();
    }

    render() {
        const {inProgress, cancellable, autoFocus, submitText} = this.props;
        const {text, preview} = this.state;

        return (
            <>
                <div className="comment-box">
                    <EditorToolbar {...this.props} sm={true}/>
                    <div className="comment-body">
                        <Form.Control
                            className={`the-editor accepts-emoji ${text.length > 20 ? 'expanded' : ''}`}
                            as="textarea"
                            placeholder={_t("comment.body-placeholder")}
                            value={text}
                            onChange={this.textChanged}
                            disabled={inProgress}
                            autoFocus={autoFocus}
                        />
                    </div>
                    <div className="comment-buttons">
                        {cancellable && (
                            <Button className="btn-cancel" size="sm" variant="outline-primary" disabled={inProgress} onClick={this.cancel}>{_t('g.cancel')}</Button>
                        )}
                        <LoginRequired {...this.props}>
                            <Button className="btn-submit" size="sm" disabled={inProgress} onClick={this.submit}>
                                {inProgress && (<Spinner animation="grow" variant="light" size="sm" style={{marginRight: "6px"}}/>)} {submitText}
                            </Button>
                        </LoginRequired>
                    </div>
                    <CommentPreview text={preview}/>
                </div>
            </>
        );
    }
}
