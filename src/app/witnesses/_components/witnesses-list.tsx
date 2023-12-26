"use client";

import { Table, Td, Th, Tr } from "@ui/table";
import i18next from "i18next";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { linkSvg, openInNewSvg } from "@ui/svg";
import { dateToRelative } from "@/utils";
import React from "react";

export function WitnessesList() {
  return (
    <>
      <Table full={true}>
        <thead>
          <Tr>
            <Th className="border p-2 col-rank">{i18next.t("witnesses.list-rank")}</Th>
            <Th className="border p-2 ">{i18next.t("witnesses.list-witness")}</Th>
            <Th className="border p-2 col-miss">{i18next.t("witnesses.list-miss")}</Th>
            <Th className="border p-2 col-url">{i18next.t("witnesses.list-url")}</Th>
            <Th className="border p-2 col-fee">{i18next.t("witnesses.list-fee")}</Th>
            <Th className="border p-2 col-feed">{i18next.t("witnesses.list-feed")}</Th>
            <Th className="border p-2 col-version">{i18next.t("witnesses.list-version")}</Th>
          </Tr>
        </thead>
        <tbody>
          {sliced.map((row, i) => {
            return (
              <Tr
                key={`${row.name}-${row.rank}${i}`}
                className={`${this.state.proxyVotes.includes(row.name) ? "voted-by-voter" : ""}`}
              >
                <Td className="border p-2">
                  <div className="witness-rank">
                    <span className="rank-number">{row.rank}</span>
                    {WitnessVoteBtn({
                      ...this.props,
                      voted: witnessVotes.includes(row.name),
                      witness: row.name,
                      onSuccess: (approve) => {
                        if (approve) {
                          this.addWitness(row.name);
                        } else {
                          this.deleteWitness(row.name);
                        }
                      }
                    })}
                  </div>
                </Td>
                <Td className="border p-2">
                  <ProfileLink username={row.name}>
                    <span className="witness-card notranslate">
                      {" "}
                      <UserAvatar username={row.name} size="medium" />
                      <div className={"witness-ctn"}>
                        {row.signingKey === "STM1111111111111111111111111111111114T1Anm" ? (
                          <s>{row.name}</s>
                        ) : (
                          row.name
                        )}
                        {row.witnessBy && (
                          <div className={"notranslate"}>
                            <small>by {row.witnessBy}</small>
                          </div>
                        )}
                      </div>
                    </span>
                  </ProfileLink>
                </Td>
                <Td className="border p-2">
                  <span className="witness-miss">{row.miss}</span>
                </Td>
                <Td className="border p-2">
                  {(() => {
                    const { parsedUrl } = row;
                    if (parsedUrl) {
                      return (
                        <EntryLink {...this.props} entry={parsedUrl}>
                          <span className="witness-link">{linkSvg}</span>
                        </EntryLink>
                      );
                    }
                    return (
                      <a target="_external" href={row.url} className="witness-link">
                        {openInNewSvg}
                      </a>
                    );
                  })()}
                </Td>
                <Td className="border p-2">
                  <span className="witness-fee">{row.fee}</span>
                </Td>
                <Td className="border p-2">
                  <div className="witness-feed">
                    <span className="inner">
                      ${row.feed.replace(" HBD", "")} | {dateToRelative(row.priceAge)}
                    </span>
                  </div>
                </Td>
                <Td className="border p-2">
                  <div className="witness-version">
                    <span className="inner">{row.version}</span>
                  </div>
                </Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      <div className="md:hidden">
        {witnesses.map((row, i) => {
          return (
            <span key={`${row.name}${i}`}>
              <div
                className={`${this.state.proxyVotes.includes(row.name) ? "voted-by-voter" : ""}`}
              >
                <WitnessCard
                  voted={witnessVotes.includes(row.name)}
                  witness={row.name}
                  row={row}
                  key={`${row.name}-${i}`}
                  onSuccess={(approve: any) => {
                    if (approve) {
                      this.addWitness(row.name);
                    } else {
                      this.deleteWitness(row.name);
                    }
                  }}
                  {...this.props}
                />
              </div>
            </span>
          );
        })}
      </div>
    </>
  );
}
