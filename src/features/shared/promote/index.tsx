import React, { useCallback, useEffect, useMemo, useState } from "react";
import { PrivateKey } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import i18next from "i18next";
import { LinearProgress, SuggestionList } from "@/features/shared";
import { KeyOrHot } from "@/features/shared/key-or-hot";
import { checkAllSvg } from "@ui/svg";
import { useGlobalStore } from "@/core/global-store";
import { promoteHot } from "@/api/operations";
import { usePreCheckPromote, usePromoteByApi, usePromoteByKeychain } from "@/api/mutations";
import { useGetPromotePriceQuery, useSearchPathQuery } from "@/api/queries";
import { useMount } from "react-use";
import { Entry } from "@/entities";

interface Props {
  entry: Entry;
  onHide: () => void;
}

export function Promote({ onHide, entry }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const [step, setStep] = useState(1);
  const [path, setPath] = useState("");
  const [pathQuery, setPathQuery] = useState("");
  const [duration, setDuration] = useState(1);
  const [balanceError, setBalanceError] = useState("");

  const { data: prices, isLoading: isPricesLoading } = useGetPromotePriceQuery();
  const { data: paths } = useSearchPathQuery(pathQuery);

  const { mutateAsync: promoteByKeychain, isPending: isKeychainPending } = usePromoteByKeychain();
  const { mutateAsync: promoteByApi, isPending: isApiPending } = usePromoteByApi();
  const { mutateAsync: next, error: postError } = usePreCheckPromote(path, () => setStep(2));

  const inProgress = useMemo(
    () => isKeychainPending || isApiPending || isPricesLoading,
    [isKeychainPending, isApiPending, isPricesLoading]
  );
  const canSubmit = useMemo(() => !postError && !balanceError && isValidPath(path), []);

  useMount(() => {
    setPath(`${entry.author}/${entry.permlink}`);
  });

  useEffect(() => {
    if (prices && prices.length > 0) {
      setDuration(prices[1].duration);
    }
  }, [prices]);

  useEffect(() => {
    const { price } = prices?.find((x) => x.duration === duration)!;
    setBalanceError(
      parseFloat(activeUser!.points.points) < price
        ? i18next.t("trx-common.insufficient-funds")
        : ""
    );
  }, [activeUser, duration, prices]);

  const pathChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const path = e.target.value;
    setPath(path);

    if (path.trim().length < 3) {
      return;
    }

    setPathQuery(path);
  }, []);

  const isValidPath = useCallback((p: string) => {
    if (p.indexOf("/") === -1) {
      return;
    }

    const [author, permlink] = p.replace("@", "").split("/");
    return author.length >= 3 && permlink.length >= 3;
  }, []);

  const sign = useCallback(
    async (key: PrivateKey) => {
      await promoteByApi({ path, duration, key });
      setStep(3);
    },
    [duration, path, promoteByApi]
  );

  const signKc = useCallback(async () => {
    await promoteByKeychain({ path, duration });
    setStep(3);
  }, [duration, path, promoteByKeychain]);

  const hotSign = useCallback(() => {
    const [author, permlink] = path.replace("@", "").split("/");

    promoteHot(activeUser!.username, author, permlink, duration);
    onHide();
  }, [activeUser, duration, onHide, path]);

  const finish = () => onHide();

  return (
    <Modal
      animation={false}
      show={true}
      centered={true}
      onHide={onHide}
      className="promote-dialog"
      size="lg"
    >
      <ModalHeader thin={true} closeButton={true} />
      <ModalBody>
        <div className="promote-dialog-content">
          {step === 1 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">1</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("promote.title")}</div>
                  <div className="sub-title">{i18next.t("promote.sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body flex flex-col">
                <div className="self-center mb-4">
                  <a href="/faq#how-promotion-work">{i18next.t("promote.learn-more")}</a>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("redeem-common.balance")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <FormControl
                      type="text"
                      className={`balance-input ${balanceError ? "is-invalid" : ""}`}
                      plaintext={true}
                      readOnly={true}
                      value={`${activeUser?.points.points} POINTS`}
                    />
                    {balanceError && <small className="pl-3 text-red">{balanceError}</small>}
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("redeem-common.post")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <SuggestionList items={paths} renderer={(i) => i} onSelect={(v) => setPath(v)}>
                      <FormControl
                        className={postError ? "is-invalid" : ""}
                        type="text"
                        value={path}
                        onChange={pathChanged}
                        placeholder={i18next.t("redeem-common.post-placeholder")}
                        disabled={inProgress}
                      />
                    </SuggestionList>
                    {postError && <small className="pl-3 text-red">{postError?.message}</small>}
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center">
                    <label>{i18next.t("promote.duration")}</label>
                  </div>
                  <div className="col-span-12 sm:col-span-10">
                    <FormControl
                      type="select"
                      value={duration}
                      onChange={(e) => setDuration(Number((e.target as any).value))}
                      disabled={inProgress}
                    >
                      {prices?.map((p) => {
                        const { duration: d, price: pr } = p;
                        const label = `${d} ${
                          d === 1 ? i18next.t("g.day") : i18next.t("g.days")
                        } - ${pr} POINTS`;
                        return (
                          <option value={p.duration} key={p.duration}>
                            {label}
                          </option>
                        );
                      })}
                    </FormControl>
                  </div>
                </div>
                <div className="grid grid-cols-12 mb-4">
                  <div className="col-span-12 sm:col-span-2 flex items-center" />
                  <div className="col-span-12 sm:col-span-10">
                    <Button onClick={() => next()} disabled={!canSubmit || inProgress}>
                      {i18next.t("g.next")}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">2</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("trx-common.sign-title")}</div>
                  <div className="sub-title">{i18next.t("trx-common.sign-sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body">
                <KeyOrHot inProgress={inProgress} onKey={sign} onHot={hotSign} onKc={signKc} />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={`transaction-form ${inProgress ? "in-progress" : ""}`}>
              <div className="transaction-form-header">
                <div className="step-no">3</div>
                <div className="box-titles">
                  <div className="main-title">{i18next.t("trx-common.success-title")}</div>
                  <div className="sub-title">{i18next.t("trx-common.success-sub-title")}</div>
                </div>
              </div>
              {inProgress && <LinearProgress />}
              <div className="transaction-form-body">
                <p className="flex justify-center align-content-center">
                  <span className="svg-icon text-green">{checkAllSvg}</span>{" "}
                  {i18next.t("redeem-common.success-message")}
                </p>
                <div className="flex justify-center">
                  <Button onClick={finish}>{i18next.t("g.finish")}</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>
    </Modal>
  );
}
