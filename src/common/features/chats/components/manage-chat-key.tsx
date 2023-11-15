import React, { useEffect, useMemo, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { InputGroupCopyClipboard } from "@ui/input";
import qrcode from "qrcode";
import { classNameObject } from "../../../helper/class-name-object";
import { useKeysQuery } from "../queries/keys-query";
import { useGetAccountFullQuery } from "../../../api/queries";
import { useMappedStore } from "../../../store/use-mapped-store";
import { getUserChatPrivateKey } from "../utils";

export default function ManageChatKey() {
  const { activeUser } = useMappedStore();
  const { privateKey, publicKey } = useKeysQuery();

  const { data: fullAccount } = useGetAccountFullQuery(activeUser?.username);
  const qrImgRef = useRef<HTMLImageElement | null>(null);
  const [isQrShow, setIsQrShow] = useState(false);

  const { iv } = useMemo(
    () => (fullAccount ? getUserChatPrivateKey(fullAccount) : { iv: undefined }),
    [fullAccount]
  );

  useEffect(() => {
    if (privateKey) {
      compileQR();
    }
  }, [privateKey]);

  const compileQR = async () => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(
        `Private key: ${privateKey}. Public key: ${publicKey}. Initial vector value: ${iv}`,
        { width: 300 }
      );
      setIsQrShow(true);
    }
  };

  return (
    <div className="flex gap-4 flex-col w-full">
      <div className="text-sm text-gray-600">{_t("chat.chat-priv-key")}</div>
      <div className="text-sm">{_t("chat.public-key")}</div>
      <InputGroupCopyClipboard value={publicKey ?? ""} />
      <div className="text-sm">{_t("chat.private-key")}</div>
      <InputGroupCopyClipboard value={privateKey ?? ""} />
      <div className="text-sm">{_t("chat.import.iv")}</div>
      <InputGroupCopyClipboard value={iv ?? ""} />
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
