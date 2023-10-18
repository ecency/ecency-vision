import React, { useContext, useEffect, useRef, useState } from "react";
import { _t } from "../../../i18n";
import { History } from "history";
import { expandSideBar } from "../../../img/svg";
import { ChatContext } from "../chat-context-provider";
import "./index.scss";
import { InputGroupCopyClipboard } from "@ui/input";
import qrcode from "qrcode";
import { classNameObject } from "../../../helper/class-name-object";

interface Props {
  history: History;
}

export default function ManageChatKey({ history }: Props) {
  const { chatPrivKey, windowWidth, setShowSideBar } = useContext(ChatContext);

  const qrImgRef = useRef<HTMLImageElement | null>(null);
  const [isQrShow, setIsQrShow] = useState(false);

  useEffect(() => {
    compileQR(chatPrivKey);
  }, [chatPrivKey]);

  const compileQR = async (key: string) => {
    if (qrImgRef.current) {
      qrImgRef.current.src = await qrcode.toDataURL(key, { width: 300 });
      setIsQrShow(true);
    }
  };

  return (
    <>
      <div className="manage-chat-key">
        <div className="private-key flex">
          {windowWidth < 768 && history.location.pathname.includes("/chats") && (
            <div className="expand-icon md:hidden">
              <p className="expand-svg" onClick={() => setShowSideBar(true)}>
                {expandSideBar}
              </p>
            </div>
          )}
          <div className="flex gap-4 flex-col w-full">
            <div className="text-sm text-gray-600">{_t("chat.chat-priv-key")}</div>
            <InputGroupCopyClipboard value={chatPrivKey} />
            <img
              ref={qrImgRef}
              className={classNameObject({
                "self-center border rounded-xl border-[--border-color]": true,
                hidden: !isQrShow,
                block: isQrShow
              })}
            />
          </div>
        </div>
      </div>
    </>
  );
}
