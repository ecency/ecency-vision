import React, { Component, MouseEvent } from "react";

import Tooltip from "../tooltip";

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
} from "../../img/svg";

export default class EditorToolbar extends Component {
  bold = () => {};

  italic = () => {};

  header = (n: number) => {};

  code = () => {};

  quote = () => {};

  ol = () => {};

  ul = () => {};

  link = () => {};

  image = () => {};

  table = () => {};

  table1 = () => {};

  table2 = () => {};

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
                    // document.getElementById("file-input").click();
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
        </div>
      </>
    );
  }
}
