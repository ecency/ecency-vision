import React, { useMemo, useState } from "react";
import { AssetSymbol } from "@hiveio/dhive";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Table, Td, Th, Tr } from "@ui/table";
import { Account } from "@/entities";
import i18next from "i18next";
import { Pagination, Tooltip } from "@/features/ui";
import { dateToFormatted, dateToFullRelative, formattedNumber } from "@/utils";
import { getSavingsWithdrawFromQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";

interface Props {
  tokenType: AssetSymbol;
  account: Account;
  onHide: () => void;
}

export function SavingsWithdraw({ onHide, tokenType, account }: Props) {
  const { data: savingWithdraw, isLoading } = getSavingsWithdrawFromQuery(
    account.name
  ).useClientQuery();

  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  const sliced = useMemo(
    () => savingWithdraw?.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) ?? [],
    [page, pageSize, savingWithdraw]
  );

  return (
    <Modal onHide={onHide} show={true} centered={true} animation={false}>
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("savings-withdraw.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {isLoading && <LinearProgress />}
        {!isLoading && (
          <div className="savings-withdraw-content">
            <div className="list-body">
              {sliced.length === 0 && <div className="empty-list">{i18next.t("g.empty-list")}</div>}
              <Table full={true}>
                <thead>
                  <Tr>
                    <Th>{i18next.t("conversion-requests.request-id")}</Th>
                    <Th>{i18next.t("conversion-requests.amount")}</Th>
                    <Th>{i18next.t("savings-withdraw.to")}</Th>
                    <Th>{i18next.t("conversion-requests.pending")}</Th>
                  </Tr>
                </thead>
                <tbody>
                  {sliced.map((x) => {
                    const { request_id } = x;
                    const publishedT = dateToFormatted(x.complete);
                    const published = dateToFullRelative(x.complete);
                    if (x.amount.includes(tokenType)) {
                      return (
                        <Tr key={request_id}>
                          <Td>{request_id}</Td>
                          <Td>
                            <Tooltip content={x.amount}>
                              <span>
                                {tokenType == "HBD"
                                  ? formattedNumber(x.amount, { prefix: "$" })
                                  : formattedNumber(x.amount, { suffix: tokenType })}
                              </span>
                            </Tooltip>
                          </Td>
                          <Td>
                            <Tooltip content={x.to}>
                              <span>{`@${x.to}`}</span>
                            </Tooltip>
                          </Td>
                          <Td>
                            <div className="date" title={publishedT}>
                              {published}
                            </div>
                          </Td>
                        </Tr>
                      );
                    } else {
                      return null;
                    }
                  })}
                </tbody>
              </Table>
            </div>

            <Pagination
              className="mt-4"
              dataLength={savingWithdraw?.length ?? 0}
              pageSize={pageSize}
              maxItems={4}
              page={page}
              onPageChange={(page: number) => setPage(page)}
            />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
