"use client";

import React, { useMemo, useState } from "react";
import { diff_match_patch } from "diff-match-patch";
import defaults from "@/defaults.json";
import { renderPostBody, setProxyBase } from "@ecency/render-helper";
import "./index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Entry } from "@/entities";
import i18next from "i18next";
import { historySvg, tagSvg } from "@ui/svg";
import { useGetCommentHistoryQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";
import { dateToFormatted } from "@/utils";
import { classNameObject } from "@ui/util";

setProxyBase(defaults.imageServer);

const dmp = new diff_match_patch();

const make_diff = (str1: string, str2: string): string => {
  const d = dmp.diff_main(str1, str2);
  dmp.diff_cleanupSemantic(d);
  return dmp.diff_prettyHtml(d).replace(/&para;/g, "&nbsp;");
};

export interface CommentHistoryListItemDiff {
  title: string;
  titleDiff?: string;
  body: string;
  bodyDiff?: string;
  tags: string;
  tagsDiff?: string;
  timestamp: string;
  v: number;
}

interface Props {
  entry: Entry;
  onHide: () => void;
}

export function EditHistory({ onHide, entry }: Props) {
  const [showDiff, setShowDiff] = useState(true);
  const [selected, setSelected] = useState(1);

  const { data: historyData, isLoading } = useGetCommentHistoryQuery(entry);
  const history = useMemo(() => {
    const t: CommentHistoryListItemDiff[] = [];

    let h = "";
    for (let l = 0; l < historyData.length; l += 1) {
      if (historyData[l].body.startsWith("@@")) {
        const p = dmp.patch_fromText(historyData[l].body);
        h = dmp.patch_apply(p, h)[0];
        historyData[l].body = h;
      } else {
        h = historyData[l].body;
      }

      t.push({
        v: historyData[l].v,
        title: historyData[l].title,
        body: h,
        timestamp: historyData[l].timestamp,
        tags: historyData[l].tags.join(", ")
      });
    }

    for (let l = 0; l < t.length; l += 1) {
      const p = l > 0 ? l - 1 : l;

      t[l].titleDiff = make_diff(t[p].title, t[l].title);
      t[l].bodyDiff = make_diff(t[p].body, t[l].body);
      t[l].tagsDiff = make_diff(t[p].tags, t[l].tags);
    }

    return t;
  }, [historyData]);

  const selectedItem = useMemo(() => history.find((x) => x.v === selected), [history, selected]);

  return (
    <Modal show={true} centered={true} onHide={onHide} className="edit-history-dialog" size="lg">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("edit-history.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {isLoading && (
          <div className="edit-history-dialog-content loading">
            <LinearProgress />
          </div>
        )}

        {!isLoading && selectedItem && (
          <div className="edit-history-dialog-content">
            <div className="version-list-sm">
              <div className="diff-select">
                <label>
                  <input
                    type="checkbox"
                    checked={showDiff}
                    onChange={(e) => setShowDiff(e.target.checked)}
                  />{" "}
                  {i18next.t("edit-history.show-diff")}
                </label>
              </div>
              <FormControl
                type="select"
                value={selected}
                onChange={(e) => setSelected(+(e.target as any).value)}
              >
                {history.map((i) => {
                  return (
                    <option value={i.v} key={i.v}>
                      {" "}
                      {i18next.t("edit-history.version", { n: i.v })}
                    </option>
                  );
                })}
              </FormControl>
            </div>
            <div className="version-list-lg">
              <div className="diff-select">
                <label>
                  <input
                    type="checkbox"
                    checked={showDiff}
                    onChange={(e) => setShowDiff(e.target.checked)}
                  />{" "}
                  {i18next.t("edit-history.show-diff")}
                </label>
              </div>
              {history.map((i) => {
                return (
                  <div
                    key={i.v}
                    className={classNameObject({
                      "version-list-item": true,
                      selected: selected === i.v
                    })}
                    onClick={() => setSelected(i.v)}
                  >
                    <div className="item-icon">{historySvg}</div>
                    <div className="item-title">
                      {i18next.t("edit-history.version", { n: i.v })}
                    </div>
                    <div className="item-date">{dateToFormatted(i.timestamp, "LLL")}</div>
                  </div>
                );
              })}
            </div>
            <div className="version-detail">
              <h1
                className="entry-title"
                dangerouslySetInnerHTML={{
                  __html: showDiff ? selectedItem.titleDiff! : selectedItem.title
                }}
              />
              <div className="entry-tags">
                {tagSvg}{" "}
                <span
                  dangerouslySetInnerHTML={{
                    __html: showDiff ? selectedItem.tagsDiff! : selectedItem.tags
                  }}
                />
              </div>
              <div
                className="entry-body markdown-view"
                dangerouslySetInnerHTML={{
                  __html: showDiff ? selectedItem.bodyDiff! : renderPostBody(selectedItem.body)
                }}
              />
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
