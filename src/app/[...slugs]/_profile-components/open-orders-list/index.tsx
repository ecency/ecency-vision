import React, { useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { Table, Td, Th, Tr } from "@ui/table";
import { Account } from "@/entities";
import i18next from "i18next";
import { Tooltip } from "@ui/tooltip";
import { dateToFormatted, dateToFullRelative, formattedNumber } from "@/utils";
import { Pagination } from "@/features/ui";
import { LinearProgress } from "@/features/shared";
import { getOpenOrdersQuery } from "@/api/queries";
import { useRouter } from "next/navigation";
import { AssetSymbol } from "@hiveio/dhive";

interface Props {
  account: Account;
  tokenType: AssetSymbol;
  onHide: () => void;
}

export function OpenOrdersList({ account, onHide, tokenType }: Props) {
  const { data: openOrders, isLoading } = getOpenOrdersQuery(account.name).useClientQuery();

  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  const sliced = useMemo(
    () => openOrders?.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize) ?? [],
    [openOrders, page, pageSize]
  );

  const router = useRouter();

  return (
    <Modal onHide={onHide} show={true} centered={true}>
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("open-orders-list.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        {isLoading && <LinearProgress />}
        {!isLoading && (
          <div className="open-orders-content">
            <div className="list-body">
              {sliced.length === 0 && <div className="empty-list">{i18next.t("g.empty-list")}</div>}
              <Table full={true}>
                <thead>
                  <Tr>
                    <Th>{i18next.t("open-orders-list.order-id")}</Th>
                    <Th>{i18next.t("conversion-requests.amount")}</Th>
                    <Th>{i18next.t("open-orders-list.created")}</Th>
                    <Th>{i18next.t("open-orders-list.expires")}</Th>
                  </Tr>
                </thead>
                <tbody>
                  {sliced.map((x) => {
                    const { orderid } = x;
                    if (x.sell_price.base.includes(tokenType)) {
                      return (
                        <Tr
                          key={orderid}
                          onClick={(e) => {
                            e.preventDefault();
                            router.push(`/market#limit`);
                          }}
                        >
                          <Td>{orderid}</Td>
                          <Td>
                            <Tooltip content={x.sell_price.quote}>
                              <span>
                                {tokenType == "HBD"
                                  ? formattedNumber(x.sell_price.base, { prefix: "$" })
                                  : formattedNumber(x.sell_price.base, { suffix: tokenType })}
                              </span>
                            </Tooltip>
                          </Td>
                          <Td>
                            <div className="date" title={dateToFormatted(x.created)}>
                              {dateToFullRelative(x.created)}
                            </div>
                          </Td>
                          <Td>
                            <div className="date" title={dateToFormatted(x.expiration)}>
                              {dateToFullRelative(x.expiration)}
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
              dataLength={openOrders?.length ?? 0}
              pageSize={pageSize}
              maxItems={4}
              page={page}
              onPageChange={(page) => setPage(page)}
            />
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
