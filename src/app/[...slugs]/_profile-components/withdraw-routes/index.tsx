import React, { useCallback, useMemo, useRef, useState } from "react";
import { PrivateKey } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Form } from "@ui/form";
import { Table, Td, Th, Tr } from "@ui/table";
import i18next from "i18next";
import { KeyOrHot } from "@/features/shared";
import { deleteForeverSvg } from "@ui/svg";
import { Tooltip } from "@ui/tooltip";
import { useGlobalStore } from "@/core/global-store";
import { setWithdrawVestingRouteHot } from "@/api/operations";
import { getWithdrawRoutesQuery } from "@/api/queries";
import { useWithDrawRouteByKey, useWithDrawRouteByKeychain } from "@/api/mutations";
import { handleInvalid, handleOnInput } from "@/utils";

interface Props {
  onHide: () => void;
}

export function WithdrawRoutesDialog({ onHide }: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  const activeUser = useGlobalStore((s) => s.activeUser);

  const [mode, setMode] = useState("");
  const [account, setAccount] = useState("");
  const [percent, setPercent] = useState("10");
  const [auto, setAuto] = useState("");

  const { data: routes } = getWithdrawRoutesQuery(activeUser!.username).useClientQuery();

  const { mutateAsync: signByKey, isPending: isByKeyPending } = useWithDrawRouteByKey(
    account,
    percent,
    auto
  );
  const { mutateAsync: signByKeychain, isPending: isByKeychainPending } =
    useWithDrawRouteByKeychain(account, percent, auto);

  const inProgress = useMemo(
    () => isByKeychainPending || isByKeyPending,
    [isByKeyPending, isByKeychainPending]
  );

  const sign = useCallback(
    async (key: PrivateKey) => {
      await signByKey({ key });
      setMode("");
      setPercent("10");
      setAuto("yes");
    },
    [signByKey]
  );

  const signHs = useCallback(() => {
    setWithdrawVestingRouteHot(
      activeUser!.username,
      account,
      Number(percent) * 100,
      auto === "yes"
    );
    setMode("");
    setPercent("10");
    setAuto("yes");
  }, [account, activeUser, auto, percent]);

  const signKS = useCallback(async () => {
    await signByKeychain();
    setMode("");
    setPercent("10");
    setAuto("yes");
  }, [signByKeychain]);

  return (
    <Modal show={true} centered={true} onHide={onHide} className="withdraw-routes-dialog">
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("withdraw-routes.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {mode === "sign" ? (
          <>
            <KeyOrHot inProgress={inProgress} onHot={signHs} onKey={sign} onKc={signKS} />
            <p className="text-center">
              <a
                onClick={(e) => {
                  e.preventDefault();
                  setMode("");
                }}
                href="#"
              >
                {i18next.t("g.back")}
              </a>
            </p>
          </>
        ) : (
          <>
            <Form
              ref={formRef}
              onSubmit={(e: React.FormEvent) => {
                e.preventDefault();
                e.stopPropagation();

                if (!formRef.current?.checkValidity()) {
                  return;
                }

                setMode("sign");
              }}
            >
              <div className="mb-4">
                <label>{i18next.t("withdraw-routes.account")}</label>
                <FormControl
                  type="text"
                  required={true}
                  minLength={3}
                  maxLength={20}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  value={account}
                  name="account"
                  onChange={(e) => setAccount(e.target.value)}
                  onInvalid={(e: any) => handleInvalid(e, "withdraw-routes.", "validation-account")}
                  onInput={handleOnInput}
                />
              </div>
              <div className="grid grid-cols-12 gap-4">
                <div className="col-span-12 md:col-span-3 mb-4">
                  <label>{i18next.t("withdraw-routes.percent")}</label>
                  <FormControl
                    type="number"
                    min={0}
                    max={100}
                    required={true}
                    value={percent}
                    name="percent"
                    onChange={(e) => setPercent(e.target.value)}
                    onInvalid={(e: any) =>
                      handleInvalid(e, "withdraw-routes.", "validation-percent")
                    }
                    onInput={handleOnInput}
                  />
                </div>
                <div className="col-span-12 md:col-span-7 mb-4">
                  <label>{i18next.t("withdraw-routes.auto-power-up")}</label>
                  <FormControl
                    type="select"
                    value={auto}
                    name="auto"
                    onChange={(e: any) => setAuto(e.target.value)}
                  >
                    <option value="yes">{i18next.t("g.yes")}</option>
                    <option value="no">{i18next.t("g.no")}</option>
                  </FormControl>
                </div>
                <div className="col-span-12 md:col-span-2 flex items-end mb-4">
                  <Button className="!h-[2.75rem]" type="submit">
                    {i18next.t("g.add")}
                  </Button>
                </div>
              </div>
            </Form>

            {routes && routes.length > 0 && (
              <Table full={true} className="route-table">
                <thead>
                  <Tr>
                    <Th className="border p-2">{i18next.t("withdraw-routes.account")}</Th>
                    <Th className="border p-2">{i18next.t("withdraw-routes.percent")}</Th>
                    <Th className="border p-2">{i18next.t("withdraw-routes.auto-power-up")}</Th>
                    <Th className="border p-2" />
                  </Tr>
                </thead>
                <tbody>
                  {routes.map((r) => {
                    return (
                      <Tr key={r.id}>
                        <Td className="border p-2">{r.to_account}</Td>
                        <Td className="border p-2">{`${r.percent / 100}%`}</Td>
                        <Td className="border p-2">
                          {r.auto_vest ? i18next.t("g.yes") : i18next.t("g.no")}
                        </Td>
                        <Td className="border p-2">
                          <Tooltip content={i18next.t("g.delete")}>
                            <Button
                              className="ml-2"
                              noPadding={true}
                              appearance="gray-link"
                              onClick={() => {
                                setAccount(r.to_account);
                                setPercent("0");
                                setAuto("no");
                                setMode("sign");
                              }}
                              icon={deleteForeverSvg}
                            />
                          </Tooltip>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </>
        )}
      </ModalBody>
    </Modal>
  );
}
