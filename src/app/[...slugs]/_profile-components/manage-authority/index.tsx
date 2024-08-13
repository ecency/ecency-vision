"use client";

import React, { useState } from "react";
import { PrivateKey } from "@hiveio/dhive";
import { AccountDataType, actionType } from "./types";
import "./index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";
import { getAccounts } from "@/api/hive";
import { useGlobalStore } from "@/core/global-store";
import { formatError, Revoke, RevokeHot, RevokeKc } from "@/api/operations";
import { error, KeyOrHot, LinearProgress, UserAvatar } from "@/features/shared";
import i18next from "i18next";
import { ManageAuthIcon } from "../manage-auth-icon";
import { ManageKeys } from "../manage-keys";
import useMount from "react-use/lib/useMount";

export function ManageAuthorities() {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [accountData, setAccountdata] = useState<AccountDataType>();
  const [newPostingsAuthority, setNewPostingsAuthority] = useState<[string, number][]>([]);
  const [step, setStep] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [targetAccount, setTargetAccount] = useState("");
  const [inProgress, setInProgress] = useState(false);

  useMount(() => {
    getAccountData();
  });

  const getAccountData = async () => {
    const response = await getAccounts([activeUser!.username]);
    if (response) {
      const resp = response[0];
      setAccountdata({
        postingsAuthority: resp.posting.account_auths,
        posting: resp.posting.key_auths[0],
        owner: resp.owner.key_auths[0],
        active: resp.active.key_auths[0],
        weight: resp.active.weight_threshold,
        memokey: resp.memo_key,
        account: response[0],
        publicKeys: {
          publicOwnerKey: resp.owner.key_auths[0][0],
          publicActiveKey: resp.active.key_auths[0][0],
          publicPostingKey: resp.posting.key_auths[0][0],
          publicMemoKey: resp.memo_key
        }
      });
    }
  };

  const toggleKeyDialog = () => {
    setKeyDialog(!keyDialog);
  };

  const handleRevoke = (account: string) => {
    setTargetAccount(account);
    setKeyDialog(true);
    setStep(1);
    setNewPostingsAuthority(accountData!.postingsAuthority.filter((x) => x[0] !== account));
  };

  const onKey = async (key: PrivateKey) => {
    try {
      setInProgress(true);
      const resp = await Revoke(
        activeUser!.username,
        accountData!.weight,
        newPostingsAuthority,
        [accountData!.posting],
        accountData!.memokey,
        key
      );
      if (resp.id) {
        setKeyDialog(true);
        setStep(2);
      }
    } catch (err) {
      error(...formatError(err));
    } finally {
      setInProgress(false);
    }
  };

  const onHot = () => {
    RevokeHot(
      activeUser!.username,
      accountData!.weight,
      newPostingsAuthority,
      [accountData!.posting],
      accountData!.memokey
    );
    setKeyDialog(false);
  };

  const onKc = () => {
    RevokeKc(
      activeUser!.username,
      accountData!.weight,
      newPostingsAuthority,
      [accountData!.posting],
      accountData!.memokey
    );
  };

  const finish = () => {
    setKeyDialog(false);
    getAccountData();
  };

  const signkeyModal = () => {
    return (
      <>
        <div className="sign-dialog-header border-b border-[--border-color]">
          <div className="step-no">1</div>
          <div className="sign-dialog-titles">
            <div className="authority-main-title">{i18next.t("manage-authorities.sign-title")}</div>
            <div className="authority-sub-title">
              {i18next.t("manage-authorities.sign-sub-title")}
            </div>
          </div>
        </div>
        {inProgress && <LinearProgress />}
        <KeyOrHot
          inProgress={inProgress}
          onKey={onKey}
          onHot={() => {
            toggleKeyDialog();
            if (onHot) {
              onHot();
            }
          }}
          onKc={() => {
            toggleKeyDialog();
            if (onKc) {
              onKc();
            }
          }}
        />
        <p className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setKeyDialog(false);
            }}
          >
            {i18next.t("g.back")}
          </a>
        </p>
      </>
    );
  };

  const successModal = () => {
    return (
      <>
        <div className="success-dialog-header border-b border-[--border-color]">
          <div className="step-no">2</div>
          <div className="success-dialog-titles">
            <div className="authority-main-title">{i18next.t("trx-common.success-title")}</div>
            <div className="authority-sub-title">{i18next.t("trx-common.success-sub-title")}</div>
          </div>
        </div>

        <div className="success-dialog-body">
          <div className="success-dialog-content">
            <span>
              {" "}
              {i18next.t("manage-authorities.success-message")}{" "}
              <a href={`https://ecency.com/@${targetAccount}`} target="_blank">
                {targetAccount}
              </a>{" "}
            </span>
          </div>
          <div className="flex justify-center">
            <span className="hr-6px-btn-spacer" />
            <Button onClick={finish}>{i18next.t("g.finish")}</Button>
          </div>
        </div>
      </>
    );
  };

  const table = () => {
    return (
      <Table full={true}>
        <thead>
          <Tr>
            <Th>{i18next.t("manage-authorities.type")}</Th>
            <Th>{i18next.t("manage-authorities.key")}</Th>
            <Th className="hidden sm:table-cell" />
            <Th className="sm:hidden col-action">{i18next.t("manage-authorities.actions")}</Th>
            <Th className="col-weight-content p-2">{i18next.t("manage-authorities.weight")}</Th>
          </Tr>
        </thead>
        <tbody>
          {accountData!.postingsAuthority && accountData!.postingsAuthority.length > 0 && (
            <>
              {accountData!.postingsAuthority.map((account, i) => {
                return (
                  <>
                    <Tr key={i} className="tabl-row">
                      <Td className="col-type-content">
                        {i18next.t("manage-authorities.posting")}
                      </Td>
                      {
                        <>
                          <Td>
                            <p className="col-key-content">
                              <a
                                className="username"
                                target="_blank"
                                href={`https://ecency.com/@${account[0]}`}
                              >
                                <span className="user-img">
                                  <UserAvatar username={account[0]} size="small" />
                                </span>

                                {account[0]}
                              </a>
                            </p>
                          </Td>
                          <Td className="hidden sm:table-cell">
                            {" "}
                            <Button onClick={() => handleRevoke(account[0])} outline={true}>
                              {i18next.t("manage-authorities.revoke")}
                            </Button>
                          </Td>
                          <Td className="sm:hidden">
                            {
                              <ManageAuthIcon
                                type={actionType.Revoke}
                                account={account[0]}
                                onRevoke={(account) => {
                                  handleRevoke(account);
                                }}
                              />
                            }
                          </Td>
                          <Td className="col-weight-content">{account[1]}</Td>
                        </>
                      }
                    </Tr>
                  </>
                );
              })}
            </>
          )}

          <ManageKeys accountData={accountData!} />
        </tbody>
      </Table>
    );
  };

  return (
    <>
      <div className="authority-table">{accountData && table()}</div>

      {keyDialog && (
        <Modal
          show={true}
          centered={true}
          onHide={toggleKeyDialog}
          className="authorities-dialog"
          size="lg"
        >
          <ModalHeader closeButton={true} />
          <ModalBody>
            {step === 1 && signkeyModal()}
            {step === 2 && successModal()}
          </ModalBody>
        </Modal>
      )}
    </>
  );
}
