import React from "react";
import { TransferAsset } from "@/features/shared";

interface AssetSwitchProps {
  options: TransferAsset[];
  selected: TransferAsset;
  onChange: (i: TransferAsset) => void;
}
export function TransferAssetSwitch({ options, selected, onChange }: AssetSwitchProps) {
  return (
    <div className="asset-switch">
      {options.map((opt) => (
        <a
          key={opt}
          onClick={() => onChange(opt)}
          className={`asset ${selected === opt ? "selected" : ""}`}
        >
          {opt}
        </a>
      ))}
    </div>
  );
}
