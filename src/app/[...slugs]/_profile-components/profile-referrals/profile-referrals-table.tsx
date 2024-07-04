import { Table, Td, Th, Tr } from "@ui/table";
import moment from "moment/moment";
import React, { useCallback, useMemo, useState } from "react";
import i18next from "i18next";
import { ProfileLink, Transfer, TransferAsset, TransferMode, UserAvatar } from "@/features/shared";
import { getReferralsQuery } from "@/api/queries";
import { Account } from "@/entities";

interface Props {
  account: Account;
  page: number;
  pageSize: number;
}

export function ProfileReferralsTable({ account, pageSize, page }: Props) {
  const [transfer, setTransfer] = useState(false);
  const [transferMode, setTransferMode] = useState<TransferMode>();
  const [transferAsset, setTransferAsset] = useState<TransferAsset>();
  const [referred, setReferred] = useState<string>();

  const { data } = getReferralsQuery(account.name).useClientQuery();
  const referrals = useMemo(
    () => data?.pages?.reduce((acc, item) => [...acc, ...item], []) ?? [],
    [data?.pages]
  );
  const openTransferDialog = useCallback(
    (mode: TransferMode, asset: TransferAsset, user: string) => {
      setTransfer(true);
      setTransferMode(mode);
      setTransferAsset(asset);
      setReferred(user);
    },
    []
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;

  const sliced = referrals.slice(start, end);

  return (
    <div className="flex">
      <Table>
        <thead>
          <Tr>
            <Th className="border p-3 col-rank">{i18next.t("referral.created")}</Th>
            <Th>{i18next.t("referral.list-referral")}</Th>
            <Th className="border p-3 col-version">{i18next.t("referral.rewarded")}</Th>
            <Th className="border p-3 col-version" />
          </Tr>
        </thead>
        <tbody>
          {sliced.map((row, i) => (
            <Tr key={i}>
              <Td className="border p-3">
                <div className="witness-rank">
                  <span className="rank-number">
                    {moment(new Date(row.created)).format("YYYY/MM/DD")}
                  </span>
                </div>
              </Td>
              <Td className="border p-3">
                <ProfileLink username={row.username}>
                  <span className="flex items-center gap-3">
                    <UserAvatar size="medium" username={row.username} />
                    <span className="block align-self-center ml-2">{row.username}</span>
                  </span>
                </ProfileLink>
              </Td>

              <Td className="border p-3">
                <span className="bg-blue-dark-sky text-white py-1 px-3 rounded-2xl">
                  {row.rewarded === 0 ? i18next.t("g.no") : i18next.t("g.yes")}
                </span>
              </Td>
              <Td className="border p-3 delegate-button">
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => openTransferDialog("delegate", "HP", row.username)}
                >
                  {i18next.t("referral.delegate-hp")}
                </button>
              </Td>
            </Tr>
          ))}
        </tbody>
      </Table>

      {transfer && (
        <Transfer
          to={referred}
          mode={transferMode!}
          asset={transferAsset!}
          onHide={() => setTransfer(false)}
        />
      )}
    </div>
  );
}
