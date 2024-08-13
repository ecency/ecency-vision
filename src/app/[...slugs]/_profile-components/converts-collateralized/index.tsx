import React, { useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Table, Td, Th, Tr } from "@ui/table";
import { Account } from "@/entities";
import i18next from "i18next";
import { dateToFormatted, dateToFullRelative, formattedNumber } from "@/utils";
import { Tooltip } from "@ui/tooltip";
import { Pagination } from "@/features/ui";
import { getCollateralizedConversionRequestsQuery } from "@/api/queries";
import { LinearProgress } from "@/features/shared";

interface Props {
  account: Account;
  onHide: () => void;
}

export function CollateralizedConversionRequests({ account, onHide }: Props) {
  const { data: requests, isLoading } = getCollateralizedConversionRequestsQuery(
    account.name
  ).useClientQuery();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const sliced = useMemo(
    () => requests?.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) ?? [],
    [page, pageSize, requests]
  );

  return (
    <Modal onHide={onHide} show={true} centered={true}>
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("collateralized-conversion-requests.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {isLoading && <LinearProgress />}
        {!isLoading && (
          <div className="collateralized-conversion-content">
            <div className="list-body">
              {sliced.length === 0 && <div className="empty-list">{i18next.t("g.empty-list")}</div>}
              <Table>
                <thead>
                  <Tr>
                    <Th>{i18next.t("collateralized-conversion-requests.request-id")}</Th>
                    <Th>{i18next.t("collateralized-conversion-requests.collateral_amount")}</Th>
                    <Th>{i18next.t("collateralized-conversion-requests.converted_amount")}</Th>
                    <Th>{i18next.t("collateralized-conversion-requests.pending")}</Th>
                  </Tr>
                </thead>
                <tbody>
                  {sliced.map((x) => {
                    const { requestid } = x;
                    return (
                      <Tr key={requestid}>
                        <Td>{requestid}</Td>
                        <Td>
                          <Tooltip content={x.collateral_amount}>
                            <span>{formattedNumber(x.collateral_amount, { suffix: "HIVE" })}</span>
                          </Tooltip>
                        </Td>
                        <Td>
                          <Tooltip content={x.converted_amount}>
                            <span>{formattedNumber(x.converted_amount, { prefix: "$" })}</span>
                          </Tooltip>
                        </Td>
                        <Td>
                          <div className="date" title={dateToFormatted(x.conversion_date)}>
                            {dateToFullRelative(x.conversion_date)}
                          </div>
                        </Td>
                      </Tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>

            <Pagination
              className="mt-4"
              dataLength={requests?.length ?? 0}
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
