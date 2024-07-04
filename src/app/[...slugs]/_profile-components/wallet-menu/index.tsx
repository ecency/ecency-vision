import React from "react";
import "./_index.scss";
import { useGlobalStore } from "@/core/global-store";
import Link from "next/link";
import Image from "next/image";
import { hiveEngineSvg, hiveSvg, spkSvg } from "@ui/svg";

interface Props {
  username: string;
  active: string;
}

export function WalletMenu({ username, active }: Props) {
  const usePrivate = useGlobalStore((s) => s.usePrivate);

  return (
    <div className="wallet-menu">
      {usePrivate && (
        <Link
          className={`menu-item ecency ${active === "ecency" ? "active" : ""}`}
          href={`/@${username}/points`}
        >
          <span className="title">Ecency</span>
          <span className="sub-title">Points</span>
          <span className="platform-logo">
            <Image alt="ecency" width={100} height={100} src="/assets/logo-small-transparent.png" />
          </span>
        </Link>
      )}
      <Link
        className={`menu-item hive ${active === "hive" ? "active" : ""}`}
        href={`/@${username}/wallet`}
      >
        <span className="title">Hive</span>
        <span className="sub-title">Wallet</span>
        <span className="platform-logo">{hiveSvg}</span>
      </Link>
      <Link
        className={`menu-item hive-engine ${active === "engine" ? "active" : ""}`}
        href={`/@${username}/engine`}
      >
        <span className="title">Engine</span>
        <span className="sub-title">Tokens</span>
        <span className="platform-logo">{hiveEngineSvg}</span>
      </Link>
      <Link
        className={`menu-item spk ${active === "spk" ? "active" : ""}`}
        href={`/@${username}/spk`}
      >
        <span className="title">SPK</span>
        <span className="sub-title">Tokens</span>
        <span className="platform-logo">{spkSvg}</span>
      </Link>
    </div>
  );
}
