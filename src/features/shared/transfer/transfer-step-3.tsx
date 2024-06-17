import { TransferFormHeader } from "@/features/shared/transfer/transfer-form-header";
import { LinearProgress } from "@/features/shared";
import { KeyOrHot } from "@/features/shared/key-or-hot";
import i18next from "i18next";
import React, { useCallback } from "react";
import { useTransferSharedState } from "./transfer-shared-state";
import { PrivateKey } from "@hiveio/dhive";
import { useGlobalStore } from "@/core/global-store";
import { getAccountFullQuery } from "@/api/queries";
import {
  useSignTransferByHiveSigner,
  useSignTransferByKey,
  useSignTransferByKeychain
} from "@/api/mutations";

interface Props {
  onHide: () => void;
}

export function TransferStep3({ onHide }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { step, setStep, to, amount, asset, mode, memo, inProgress } = useTransferSharedState();

  const { refetch } = getAccountFullQuery(activeUser?.username).useClientQuery();

  const { mutateAsync: signByKey } = useSignTransferByKey(mode, asset);
  const { mutateAsync: signByKeychain } = useSignTransferByKeychain(mode, asset);
  const { mutateAsync: signByHiveSigner } = useSignTransferByHiveSigner(mode, asset);

  const sign = useCallback(
    async (key: PrivateKey) => {
      const fullAmount = `${amount} ${asset}`;
      const username = activeUser?.username!;

      await signByKey({ amount, key, fullAmount, memo, to, username });
      await refetch();
      setStep(4);
    },
    [activeUser?.username, amount, asset, memo, refetch, setStep, signByKey, to]
  );

  const signHs = () => {
    const fullAmount = `${amount} ${asset}`;
    const username = activeUser?.username!;
    signByHiveSigner({ amount, fullAmount, memo, to, username });
    onHide();
  };

  const signKc = useCallback(async () => {
    const fullAmount = `${amount} ${asset}`;
    const username = activeUser?.username!;

    await signByKeychain({ amount, fullAmount, memo, to, username });
    await refetch();
    setStep(4);
  }, [activeUser?.username, amount, asset, memo, refetch, setStep, signByKeychain, to]);

  return (
    <div className="transaction-form">
      <TransferFormHeader title="sign-title" step={step} subtitle="sign-sub-title" />
      {inProgress && <LinearProgress />}
      <div className="transaction-form">
        <KeyOrHot inProgress={inProgress} onKey={sign} onHot={signHs} onKc={signKc} />
        <p className="text-center">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setStep(2);
            }}
          >
            {i18next.t("g.back")}
          </a>
        </p>
      </div>
    </div>
  );
}
