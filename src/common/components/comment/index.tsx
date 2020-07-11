import React, {Component} from "react";

import {Form, FormControl, Button} from "react-bootstrap";

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
    disabled: boolean;
    users: User[];
    activeUser: ActiveUser | null;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
    onChange: (text: string) => void
    onSubmit: (text: string) => void
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
            onChange(text);
        }, 500);
    };

    submit = () => {
        const {text} = this.state;
        const {onSubmit} = this.props;
        onSubmit(text);
    }

    render() {
        const {disabled} = this.props;
        const {text, preview} = this.state;

        return (
            <>
                <div className="comment-box">
                    <EditorToolbar/>
                    <div className="comment-body">
                        <Form.Control
                            id="the-editor"
                            className="accepts-emoji"
                            as="textarea"
                            placeholder={_t("comment.body-placeholder")}
                            value={text}
                            onChange={this.textChanged}
                            disabled={disabled}
                        />
                    </div>
                    {text !== '' && (
                        <div className="comment-buttons">
                            <LoginRequired {...this.props}>
                                <Button size="sm" disabled={disabled} onClick={this.submit}>{_t('comment.reply')}</Button>
                            </LoginRequired>
                        </div>
                    )}
                    <CommentPreview text={preview}/>
                </div>
            </>
        );
    }
}
