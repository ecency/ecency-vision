import React, {Component} from "react";

import isEqual from "react-fast-compare";

import {ActiveUser} from "../../store/active-user/types";

import Tooltip from "../tooltip";
import EmojiPicker from "../emoji-picker";

import {uploadImage} from "../../api/ecency";

import {_t} from "../../i18n";

import {insertOrReplace, replace} from "../../util/input-util";

import _c from "../../util/fix-class-names";

import {
    formatBoldSvg,
    formatItalicSvg,
    formatTitleSvg,
    codeTagsSvg,
    formatQuoteCloseSvg,
    formatListNumberedSvg,
    formatListBulletedSvg,
    linkSvg,
    imageSvg,
    gridSvg,
    emoticonHappyOutlineSvg,
} from "../../img/svg";
import {User} from "../../store/users/types";


const getTargetEl = (): HTMLInputElement | null => {
    return document.querySelector("#the-editor");
}

const insertText = (before: string, after: string = "") => {
    const el = getTargetEl();
    if (!el) {
        return;
    }

    insertOrReplace(el, before, after);
};

const replaceText = (find: string, rep: string) => {
    const el = getTargetEl();
    if (!el) {
        return;
    }

    replace(el, find, rep);
}


interface Props {
    users: User[];
    activeUser: ActiveUser | null;
    sm?: boolean
}

export default class EditorToolbar extends Component<Props> {
    shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
        return !isEqual(this.props.activeUser, nextProps.activeUser);
    }

    componentDidMount() {
        const el = getTargetEl();
        if (el) {
            el.addEventListener('dragover', this.onDragOver);
            el.addEventListener('drop', this.drop);
        }
    }

    componentWillUnmount() {
        const el = getTargetEl();
        if (el) {
            el.removeEventListener('dragover', this.onDragOver);
            el.removeEventListener('drop', this.drop);
        }
    }

    onDragOver = (e: DragEvent) => {
        const {activeUser} = this.props;
        if (!activeUser) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = 'copy';
            e.dataTransfer.dropEffect = 'copy';
        }
    }

    drop = (e: DragEvent) => {
        const {activeUser} = this.props;
        if (!activeUser) {
            return;
        }

        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer) {
            return;
        }

        const files = [...e.dataTransfer.files]
            .filter(i => this.checkFile(i.name))
            .filter(i => i);

        if (files.length > 0) {
            files.forEach(file => this.upload(file));
        }
    }

    bold = () => {
        insertText("**", "**");
    };

    italic = () => {
        insertText("*", "*");
    };

    header = (w: number) => {
        const h = "#".repeat(w);
        insertText(`${h} `);
    };

    code = () => {
        insertText("<code>", "</code>");
    };

    quote = () => {
        insertText(">");
    };

    ol = () => {
        insertText("1. item1\n2. item2\n3. item3");
    };

    ul = () => {
        insertText("* item1\n* item2\n* item3");
    };

    link = () => {
        insertText("[", "](https://)");
    };

    image = (name = "", url = "url") => {
        insertText(`![${name}`, `](${url})`);
    };

    table = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        const t =
            "\n|\tColumn 1\t|\tColumn 2\t|\tColumn 3\t|\n" +
            "|\t------------\t|\t------------\t|\t------------\t|\n" +
            "|\t     Text     \t|\t     Text     \t|\t     Text     \t|\n";
        insertText(t);
    };

    table1 = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();

        const t = "\n|\tColumn 1\t|\n" + "|\t------------\t|\n" + "|\t     Text     \t|\n";
        insertText(t);
    };

    table2 = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        const t =
            "\n|\tColumn 1\t|\tColumn 2\t|\n" +
            "|\t------------\t|\t------------\t|\n" +
            "|\t     Text     \t|\t     Text     \t|\n";
        insertText(t);
    };

    fileInputChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
        const files = [...e.target.files]
            .filter(i => this.checkFile(i.name))
            .filter(i => i);

        if (files.length > 0) {
            e.stopPropagation();
            e.preventDefault();
        }

        files.forEach(file => this.upload(file));
    };

    upload = async (file: File) => {
        const {activeUser, users} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        const tempImgTag = `![Uploading ${file.name} #${Math.floor(
            Math.random() * 99
        )}]()\n\n`;
        insertText(tempImgTag);

        let imageUrl: string;
        try {
            const resp = await uploadImage(file, user.accessToken)
            imageUrl = resp.url;
        } catch (e) {
            return;
        }

        const imageName = imageUrl.split('/').pop();
        const imgTag = `![${imageName}](${imageUrl})\n\n`;

        replaceText(tempImgTag, imgTag);
    };

    checkFile = (filename: string) => {
        const filenameLow = filename.toLowerCase();
        return ['jpg', 'jpeg', 'gif', 'png'].some(el => filenameLow.endsWith(el));
    };

    render() {
        const {sm, activeUser} = this.props;

        return (
            <>
                <div className={_c(`editor-toolbar ${sm ? 'toolbar-sm' : ''}`)}>
                    <Tooltip content={_t("editor-toolbar.bold")}>
                        <div className="editor-tool" onClick={this.bold}>
                            {formatBoldSvg}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.italic")}>
                        <div className="editor-tool" onClick={this.italic}>
                            {formatItalicSvg}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.header")}>
                        <div
                            className="editor-tool"
                            onClick={() => {
                                this.header(1);
                            }}
                        >
                            {formatTitleSvg}
                            <div className="sub-tool-menu">
                                {[...Array(3).keys()].map((i) => (
                                    <div
                                        key={i}
                                        className="sub-tool-menu-item"
                                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                                            e.stopPropagation();
                                            this.header(i + 2);
                                        }}
                                    >
                                        {`H${i + 2}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Tooltip>
                    <div className="tool-separator"/>
                    <Tooltip content={_t("editor-toolbar.code")}>
                        <div className="editor-tool" onClick={this.code}>
                            {codeTagsSvg}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.quote")}>
                        <div className="editor-tool" onClick={this.quote}>
                            {formatQuoteCloseSvg}
                        </div>
                    </Tooltip>
                    <div className="tool-separator"/>
                    <Tooltip content={_t("editor-toolbar.ol")}>
                        <div className="editor-tool" onClick={this.ol}>
                            {formatListNumberedSvg}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.ul")}>
                        <div className="editor-tool" onClick={this.ul}>
                            {formatListBulletedSvg}
                        </div>
                    </Tooltip>
                    <div className="tool-separator"/>
                    <Tooltip content={_t("editor-toolbar.link")}>
                        <div className="editor-tool" onClick={this.link}>
                            {linkSvg}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.image")}>
                        <div
                            className="editor-tool"
                            onClick={() => {
                                this.image();
                            }}>
                            {imageSvg}

                            {activeUser && (
                                <div className="sub-tool-menu">
                                    <div
                                        className="sub-tool-menu-item"
                                        onClick={(e: React.MouseEvent<HTMLElement>) => {
                                            e.stopPropagation();
                                            const el = document.getElementById("file-input");
                                            if (el) el.click();
                                        }}
                                    >
                                        {_t("editor-toolbar.upload")}
                                    </div>
                                    {/*
                                        <div
                                            className="sub-tool-menu-item"
                                            onClick={(e: React.MouseEvent<HTMLElement>) => {
                                                e.stopPropagation();
                                                // this.setState({ galleryModalVisible: true });
                                            }}
                                        >
                                            {_t("editor-toolbar.gallery")}
                                        </div>
                                    */}
                                </div>
                            )}
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.table")}>
                        <div className="editor-tool" onClick={this.table}>
                            {gridSvg}
                            <div className="sub-tool-menu">
                                <div className="sub-tool-menu-item" onClick={this.table}>
                                    {_t("editor-toolbar.table-3-col")}
                                </div>
                                <div className="sub-tool-menu-item" onClick={this.table2}>
                                    {_t("editor-toolbar.table-2-col")}
                                </div>
                                <div className="sub-tool-menu-item" onClick={this.table1}>
                                    {_t("editor-toolbar.table-1-col")}
                                </div>
                            </div>
                        </div>
                    </Tooltip>
                    <Tooltip content={_t("editor-toolbar.emoji")}>
                        <div className="editor-tool" role="none">
                            {emoticonHappyOutlineSvg}
                            <EmojiPicker {...this.props} />
                        </div>
                    </Tooltip>
                </div>
                <input
                    onChange={this.fileInputChanged}
                    className="file-input"
                    id="file-input"
                    type="file"
                    accept="image/*"
                    multiple={true}
                    style={{display: 'none'}}
                />
            </>
        );
    }
}
