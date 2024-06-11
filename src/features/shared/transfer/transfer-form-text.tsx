import React from "react";

interface Props {
  type: string;
  msg: string;
}

export function TransferFormText({ type, msg }: Props) {
  return (
    <div className="grid grid-cols-12">
      <div className="col-span-12 md:col-span-10 col-start-2">
        <small className={`text-${type} tr-form-text`}>{msg}</small>
      </div>
    </div>
  );
}
