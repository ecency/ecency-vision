import React, { useEffect, useMemo, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { InputGroupCopyClipboard } from "@ui/input";
import qrcode from "qrcode";
import { classNameObject } from "../../../helper/class-name-object";
import { useMappedStore } from "../../../store/use-mapped-store";
import { PREFIX } from "../../../util/local-storage";

export default function ManageChatKey() {
  const { activeUser } = useMappedStore();

  const pin = useMemo(() => localStorage.getItem(PREFIX + "_nostr_pr_" + activeUser?.username), []);
  const qrImgRef = useRef<HTMLImageElement | null>(null);
  const [isQrShow, setIsQrShow] = useState(false);

  useEffect(() => {
    if (pin) {
      compileQR();
    }
  }, [pin]);

  const compileQR = async () => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(pin!!, { width: 300 });
      setIsQrShow(true);
    }
  };

  return (
    <div className="flex gap-4 flex-col w-full">
      <div className="text-sm text-gray-600">{_t("chat.chat-priv-key")}</div>
      <div className="text-sm">PIN</div>
      <InputGroupCopyClipboard value={pin ?? ""} />
      <img
        ref={qrImgRef}
        className={classNameObject({
          "self-center border rounded-xl border-[--border-color]": true,
          hidden: !isQrShow,
          block: isQrShow
        })}
      />
    </div>
  );
}
