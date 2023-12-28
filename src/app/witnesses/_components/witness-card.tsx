import React from "react";
import Link from "next/link";
import i18next from "i18next";
import { WitnessVoteBtn } from "@/app/witnesses/_components/witness-vote-btn";
import { openInNewSvg } from "@ui/svg";
import { dateToRelative } from "@/utils";
import { WitnessTransformed } from "@/entities";
import { useGlobalStore } from "@/core/global-store";

interface Props {
  voted: boolean;
  row: WitnessTransformed;
  witness: string;
  onSuccess: (approve: boolean) => void;
}

export const WitnessCard = ({ voted, row, witness, onSuccess }: Props) => {
  const canUseWebp = useGlobalStore((state) => state.canUseWebp);

  return (
    <div className="witnesses-card p-3 mb-3 border border-[--border-color] rounded">
      <div className="flex items-center justify-between">
        <div>
          <h3>
            <Link href={`/@${row.name}`}>
              <b>{row.name}</b>
            </Link>
            {row.witnessBy && (
              <div className="notranslate">
                <small>by {row.witnessBy}</small>
              </div>
            )}
          </h3>
        </div>
        <div>
          <img
            src={`https://images.ecency.com/${canUseWebp ? "webp/" : ""}u/${
              row.name
            }/avatar/medium`}
            alt=""
            className="rounded-[50%] avatar w-[60px] h-[60px] mr-3"
          />
        </div>
      </div>
      <div className="flex">
        <div className="mr-3 flex">
          <div className="mr-2">
            <b>{i18next.t("witnesses.list-rank")} :</b>
          </div>
          <div>{row.rank}</div>
        </div>

        <div>
          <WitnessVoteBtn voted={voted} witness={witness} onSuccess={onSuccess} />
        </div>
      </div>
      <div className="flex items-center">
        <b>{i18next.t("witnesses.list-miss")}: </b>
        <div className="ml-2">{row.miss}</div>{" "}
        <div>
          <a target="_external" href={row.url} className="witness-link ml-3">
            {openInNewSvg}
          </a>
        </div>
      </div>
      <div className="flex items-center">
        <b>{i18next.t("witnesses.list-miss")}: </b>
        <div className="ml-2">{row.fee}</div>
      </div>
      <div className="flex items-center my-2 justify-between">
        <div className="witness-feed">
          <span className="inner">
            ${row.feed.replace(" HBD", "")} | {dateToRelative(row.priceAge)}
          </span>
        </div>
        <div className="flex items-center">
          <div className="witness-version">
            <span className="inner">{row.version}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
