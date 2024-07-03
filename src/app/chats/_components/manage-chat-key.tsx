import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CodeInput, InputGroupCopyClipboard } from "@ui/input";
import qrcode from "qrcode";
import { Button } from "@ui/button";
import { useKeysQuery } from "@ecency/ns-query";
import { useGlobalStore } from "@/core/global-store";
import { PREFIX } from "@/utils/local-storage";
import i18next from "i18next";
import { classNameObject } from "@ui/util";

export function ManageChatKey() {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const qrImgRef = useRef<HTMLImageElement | null>(null);

  const [isUnlocked, setIsUnlocked] = useState(false);
  const [validationPin, setValidationPin] = useState("");
  const [isQrShow, setIsQrShow] = useState(false);

  const { publicKey, privateKey, iv } = useKeysQuery();

  const pin = useMemo(() => localStorage.getItem(PREFIX + "_nostr_pr_" + activeUser?.username), []);
  const ecencyKey = useMemo(
    () =>
      Buffer.from(
        JSON.stringify({
          pub: publicKey,
          priv: privateKey,
          iv
        })
      ).toString("base64"),
    [publicKey, privateKey, iv]
  );

  const compileQR = useCallback(async () => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(ecencyKey!!, { width: 300 });
      setIsQrShow(true);
    }
  }, [ecencyKey]);

  useEffect(() => {
    if (validationPin === pin) {
      setIsUnlocked(true);
    }
  }, [validationPin, pin]);

  useEffect(() => {
    if (ecencyKey) {
      compileQR();
    }
  }, [compileQR, ecencyKey]);

  return (
    <div className="flex gap-4 flex-col w-full">
      {isUnlocked ? (
        <>
          <div className="text-sm text-gray-600">{i18next.t("chat.chat-priv-key")}</div>
          <div className="text-sm">PIN</div>
          <InputGroupCopyClipboard value={pin ?? ""} />
          <div className="text-sm mt-4">{i18next.t("chat.ecency-key")}</div>
          <InputGroupCopyClipboard value={ecencyKey ?? ""} />
          <img
            ref={qrImgRef}
            className={classNameObject({
              "self-center border rounded-xl border-[--border-color]": true,
              hidden: !isQrShow,
              block: isQrShow
            })}
          />
          <Button
            className="mx-auto"
            onClick={() => {
              const blob = new Blob([ecencyKey], { type: "text/plain" });
              const a = document.createElement("a");
              a.href = window.URL.createObjectURL(new File([blob], "ecency-key.txt"));
              a.download = "ecency-key.txt";
              a.click();
              document.removeChild(a);
            }}
          >
            {i18next.t("g.download")}
          </Button>
        </>
      ) : (
        <>
          <div className="text-center text-gray-600 dark:text-gray-400">
            {i18next.t("chat.unlock-the-section")}
          </div>
          <CodeInput value={validationPin} setValue={setValidationPin} codeSize={8} />
          {validationPin !== pin && validationPin.length === pin?.length && (
            <div className="text-red text-sm">{i18next.t("chat.welcome.pin-failed")}</div>
          )}
        </>
      )}
    </div>
  );
}
