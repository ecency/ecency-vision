"use client";

import React, { useRef, useState } from "react";
import { cryptoUtils, KeyRole, PrivateKey } from "@hiveio/dhive";
import base58 from "bs58";
import "./_index.scss";
import { Spinner } from "@ui/spinner";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { error, success } from "@/features/shared";
import i18next from "i18next";
import { handleInvalid, handleOnInput, random } from "@/utils";
import { useGlobalStore } from "@/core/global-store";
import { formatError, updatePassword } from "@/api/operations";

interface Props {
  onUpdate?: () => void;
}

export function PasswordUpdate({ onUpdate }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [curPass, setCurPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [newPass2, setNewPass2] = useState("");
  const [inProgress, setInProgress] = useState(false);

  const update = () => {
    if (!activeUser?.data.__loaded) {
      return;
    }

    setInProgress(true);

    const newPrivateKeys: Record<string, string> = { active: "", memo: "", owner: "", posting: "" };
    const newPublicKeys: Record<string, string> = { active: "", memo: "", owner: "", posting: "" };

    ["owner", "active", "posting", "memo"].forEach((r) => {
      const k = PrivateKey.fromLogin(activeUser.username, newPass, r as KeyRole);
      newPrivateKeys[r] = k.toString();

      newPublicKeys[r] = k.createPublic().toString();
    });

    const ownerKey = PrivateKey.fromLogin(activeUser.username, curPass, "owner");

    const { data: accountData } = activeUser;

    const update = {
      account: activeUser.username,
      json_metadata: accountData.json_metadata,
      owner: Object.assign({}, accountData.owner, {
        key_auths: [[newPublicKeys.owner, 1]]
      }),
      active: Object.assign({}, accountData.active, {
        key_auths: [[newPublicKeys.active, 1]]
      }),
      posting: Object.assign({}, accountData.posting, {
        key_auths: [[newPublicKeys.posting, 1]]
      }),
      memo_key: newPublicKeys.memo
    };

    updatePassword(update, ownerKey)
      .then(() => {
        success(i18next.t("password-update.updated"));
        onUpdate && onUpdate();
      })
      .catch((e) => {
        error(...formatError(e));
      })
      .finally(() => setInProgress(false));
  };

  return (
    <div className="dialog-content">
      <Form
        ref={formRef}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();

          if (!formRef.current?.checkValidity()) {
            return;
          }

          if (newPass !== newPass2) {
            error(i18next.t("password-update.error-new2"));
            return;
          }

          update();
        }}
      >
        <div className="mb-4">
          <label>{i18next.t("password-update.account")}</label>
          <FormControl type="text" readOnly={true} value={activeUser?.username} />
        </div>
        <div className="mb-4">
          <label>{i18next.t("password-update.cur-pass")}</label>
          <FormControl
            value={curPass}
            onChange={(e) => setCurPass(e.target.value)}
            required={true}
            onInvalid={(e: any) => handleInvalid(e, "password-update.", "validation-password")}
            onInput={handleOnInput}
            type="password"
            autoFocus={true}
            autoComplete="off"
          />
        </div>
        <div className="mb-4">
          <label>{i18next.t("password-update.new-pass")}</label>
          <div>
            {!newPass && (
              <Button
                outline={true}
                onClick={() => {
                  setNewPass("P" + base58.encode(cryptoUtils.sha256(random())));
                }}
              >
                {i18next.t("password-update.pass-gen")}
              </Button>
            )}
            {newPass && <code className="pass-generated">{newPass}</code>}
          </div>
        </div>
        <div className="mb-4">
          <label>{i18next.t("password-update.new-pass2")}</label>
          <FormControl
            value={newPass2}
            onChange={(e) => setNewPass2(e.target.value)}
            required={true}
            type="password"
            autoComplete="off"
            onInvalid={(e: any) => handleInvalid(e, "password-update.", "validation-password")}
            onInput={handleOnInput}
          />
        </div>
        <div className="mb-4">
          <FormControl
            checked={false}
            required={true}
            type="checkbox"
            label={i18next.t("password-update.label-check")}
            onInvalid={(e: any) => handleInvalid(e, "password-update.", "validation-label")}
            onChange={handleOnInput}
          />
        </div>
        <Button
          type="submit"
          disabled={inProgress}
          icon={inProgress && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
          iconPlacement="left"
        >
          {i18next.t("g.update")}
        </Button>
      </Form>
    </div>
  );
}
