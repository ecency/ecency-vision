import React, { Component, MouseEvent } from "react";

import Tooltip from "../tooltip";
import EmojiPicker from "../emoji-picker";

import { _t } from "../../i18n";

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

import { inputReplacer } from "../../util/input-util";

const insertText = (before: string, after: string = "") => {
  const el: HTMLInputElement | null = document.querySelector("#the-editor");
  if (!el) {
    return;
  }

  inputReplacer(el, before, after);
};

export default class EditorToolbar extends Component {
  shouldComponentUpdate() {
    return false;
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
    const files = (e.target as HTMLInputElement).files!;

  };

  render() {
    return (
      <>
        <div className="editor-toolbar">
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
          <div className="tool-separator" />
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
          <div className="tool-separator" />
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
          <div className="tool-separator" />
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
              }}
            >
              {imageSvg}
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
                {/* if active user */}
                <div
                  className="sub-tool-menu-item"
                  onClick={(e: React.MouseEvent<HTMLElement>) => {
                    e.stopPropagation();
                    // this.setState({ galleryModalVisible: true });
                  }}
                >
                  {_t("editor-toolbar.gallery")}
                </div>
                {/* endif */}
              </div>
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
        <input type="file" id="file-input" onChange={this.fileInputChanged} style={{ display: "none" }} />
      </>
    );
  }
}
