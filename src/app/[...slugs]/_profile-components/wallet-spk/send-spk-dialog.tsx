import React, { useState } from "react";
import "./wallet-spk-dialog.scss";
import { WalletSpkSteps } from "./wallet-spk-steps";
import { SendSpkDialogForm } from "./dialog-steps/send-spk-dialog-form";
import { SendSpkDialogDelegateForm } from "./dialog-steps/send-spk-dialog-delegate-form";
import { SendSpkDialogConfirm } from "./dialog-steps/send-spk-dialog-confirm";
import numeral from "numeral";
import { SendSpkDialogSign } from "./dialog-steps/send-spk-dialog-sign";
import { SendSpkSuccess } from "./dialog-steps/send-spk-success";
import { SendSpkDialogPowerUpForm } from "./dialog-steps/send-spk-dialog-power-up-form";
import { SendSpkDialogLockForm } from "./dialog-steps/send-spk-dialog-lock";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { Account, Market } from "@/entities";

interface Props {
  show: boolean;
  setShow: (value: boolean) => void;
  balance: string;
  account: Account;
  onFinish: () => void;
  asset: "SPK" | "LARYNX" | "LP";
  type: "transfer" | "delegate" | "powerup" | "powerdown" | "lock" | "unlock";
  prefilledTo?: string;
  prefilledAmount?: string;
  markets: Market[];
}

export const SendSpkDialog = ({
  show,
  setShow,
  balance,
  onFinish,
  asset,
  type,
  prefilledTo,
  prefilledAmount,
  markets
}: Props) => {
  const [username, setUsername] = useState(prefilledTo || "");
  const [amount, setAmount] = useState(prefilledAmount || "0");
  const [memo, setMemo] = useState("");
  const [stepIndex, setStepIndex] = useState(0);

  const precision = (balance + "").split(".")[1]?.length || 3;

  const getTitle = () => {
    if (type === "delegate") return "wallet.spk.delegate.title";
    if (type === "transfer") return "wallet.spk.send.title";
    if (type === "powerup") return "wallet.spk.power-up.title";
    if (type === "powerdown") return "wallet.spk.power-down.title";
    if (type === "lock") return "wallet.spk.lock.title";
    if (type === "unlock") return "wallet.spk.unlock.title";
    return "";
  };

  const getSubTitle = () => {
    if (type === "delegate") return "wallet.spk.delegate.subtitle";
    if (type === "transfer") return "wallet.spk.send.subtitle";
    if (type === "powerup") return "wallet.spk.power-up.subtitle";
    if (type === "powerdown") return "wallet.spk.power-down.subtitle";
    if (type === "lock") return "wallet.spk.lock.subtitle";
    if (type === "unlock") return "wallet.spk.unlock.subtitle";
    return "";
  };

  const steps = [
    {
      title: getTitle(),
      subtitle: getSubTitle(),
      submit: () => {
        // make sure 3 decimals in amount
        const fixedAmount = formatNumber(amount, precision);
        setAmount(fixedAmount);
        setStepIndex(stepIndex + 1);
      }
    },
    {
      title: "transfer.confirm-title",
      subtitle: "transfer.confirm-sub-title",
      submit: () => {
        setStepIndex(stepIndex + 1);
      }
    },
    {
      title: "trx-common.sign-title",
      subtitle: "trx-common.sign-sub-title",
      submit: () => {}
    },
    {
      title: "trx-common.success-title",
      subtitle: "trx-common.success-sub-title",
      submit: () => {}
    }
  ];

  const formatNumber = (num: number | string, precision: number) => {
    const format = `0.${"0".repeat(precision)}`;

    return numeral(num).format(format, Math.floor); // round to floor
  };

  const clear = () => {
    setUsername(prefilledTo || "");
    setAmount("0");
    setMemo("");
    setStepIndex(0);
  };

  return (
    <Modal
      show={show}
      centered={true}
      onHide={() => {
        setShow(false);
        clear();
      }}
      size="lg"
      className="send-spk-dialog transfer-dialog-content"
    >
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody>
        <WalletSpkSteps steps={steps} stepIndex={stepIndex}>
          <>
            {stepIndex === 0 && type === "transfer" ? (
              <SendSpkDialogForm
                username={username}
                amount={amount}
                balance={balance}
                memo={memo}
                setMemo={setMemo}
                setUsername={setUsername}
                setAmount={setAmount}
                submit={() => steps[stepIndex]?.submit()}
                asset={asset}
              />
            ) : (
              <></>
            )}

            {stepIndex === 0 && type === "delegate" ? (
              <SendSpkDialogDelegateForm
                username={username}
                amount={amount}
                balance={balance}
                memo={memo}
                setMemo={setMemo}
                setUsername={setUsername}
                setAmount={setAmount}
                submit={() => steps[stepIndex]?.submit()}
                asset={asset}
                markets={markets}
              />
            ) : (
              <></>
            )}

            {stepIndex === 0 && ["powerup", "powerdown"].includes(type) ? (
              <SendSpkDialogPowerUpForm
                amount={amount}
                balance={balance}
                setAmount={setAmount}
                submit={() => steps[stepIndex]?.submit()}
                asset={asset}
              />
            ) : (
              <></>
            )}

            {stepIndex === 0 && ["lock", "unlock"].includes(type) ? (
              <SendSpkDialogLockForm
                amount={amount}
                balance={balance}
                setAmount={setAmount}
                submit={() => steps[stepIndex]?.submit()}
                asset={asset}
              />
            ) : (
              <></>
            )}

            {stepIndex === 1 ? (
              <SendSpkDialogConfirm
                title={`${type}-title`}
                showTo={!["powerup", "powerdown", "lock", "unlock"].includes(type)}
                to={username}
                memo={memo}
                amount={amount}
                asset={asset}
                back={() => setStepIndex(stepIndex - 1)}
                confirm={() => steps[stepIndex]?.submit()}
              />
            ) : (
              <></>
            )}
            {stepIndex === 2 ? (
              <SendSpkDialogSign
                asset={asset}
                mode={type}
                memo={memo}
                onBack={() => setStepIndex(stepIndex - 1)}
                setNextStep={() => setStepIndex(stepIndex + 1)}
                to={username}
                amount={amount}
              />
            ) : (
              <></>
            )}
            {stepIndex === 3 ? (
              <SendSpkSuccess
                amount={amount}
                asset={asset}
                reset={() => clear()}
                onFinish={() => {
                  setShow(false);
                  clear();
                  onFinish();
                }}
                to={username}
                mode={type}
              />
            ) : (
              <></>
            )}
          </>
        </WalletSpkSteps>
      </ModalBody>
    </Modal>
  );
};
