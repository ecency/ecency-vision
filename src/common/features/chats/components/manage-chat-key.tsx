import React, { useEffect, useMemo, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { InputGroupCopyClipboard } from "@ui/input";
import qrcode from "qrcode";
import { classNameObject } from "../../../helper/class-name-object";
import { useMappedStore } from "../../../store/use-mapped-store";
import { PREFIX } from "../../../util/local-storage";
import { useKeysQuery } from "../queries/keys-query";
import { Button } from "@ui/button";

export default function ManageChatKey() {
  const { activeUser } = useMappedStore();

  const qrImgRef = useRef<HTMLImageElement | null>(null);
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
    [publicKey, privateKey]
  );

  useEffect(() => {
    if (ecencyKey) {
      compileQR();
    }
  }, [ecencyKey]);

  const compileQR = async () => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(ecencyKey!!, { width: 300 });
      setIsQrShow(true);
    }
  };

  return (
    <div className="flex gap-4 flex-col w-full">
      <div className="text-sm text-gray-600">{_t("chat.chat-priv-key")}</div>
      <div className="text-sm">PIN</div>
      <InputGroupCopyClipboard value={pin ?? ""} />
      <div className="text-sm mt-4">Ecency key</div>
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
        {_t("g.download")}
      </Button>
    </div>
  );
}
