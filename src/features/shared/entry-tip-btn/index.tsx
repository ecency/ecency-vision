"use client";

import React, { useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Account, Entry } from "@/entities";
import { LoginRequired, Transfer } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { giftOutlineSvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";
import useMount from "react-use/lib/useMount";
import useUnmount from "react-use/lib/useUnmount";

interface Props {
  entry: Entry;
  account?: Account;
  setTipDialogMounted?: (d: boolean) => void;
  handleClickAway?: () => void;
}

export function EntryTipBtn({ entry, setTipDialogMounted, handleClickAway, account }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  const [dialog, setDialog] = useState(false);

  const to = useMemo(() => entry.author, [entry]);
  const memo = useMemo(() => `Tip for @${entry.author}/${entry.permlink}`, [entry]);

  useMount(() => setTipDialogMounted?.(true));
  useUnmount(() => setTipDialogMounted?.(false));

  return (
    <>
      {" "}
      <LoginRequired>
        <div className="entry-tip-btn" onClick={() => setDialog(true)}>
          <Tooltip content={i18next.t("entry-tip.title")}>
            <span className="inner-btn">{giftOutlineSvg}</span>
          </Tooltip>
        </div>
      </LoginRequired>
      {dialog && activeUser && (
        <Modal
          show={true}
          centered={true}
          onHide={() => setDialog(false)}
          className="tipping-dialog"
          size="lg"
        >
          <ModalHeader thin={true} closeButton={true} />
          <ModalBody>
            <Transfer
              asset={usePrivate ? "POINT" : "HIVE"}
              mode="transfer"
              amount={usePrivate ? "100.000" : "1.000"}
              to={to}
              memo={memo}
              handleClickAway={handleClickAway}
              account={account}
              onHide={() => setDialog(false)}
            />
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
