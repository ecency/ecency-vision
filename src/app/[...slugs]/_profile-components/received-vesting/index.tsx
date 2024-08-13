import React, { useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import i18next from "i18next";
import { formattedNumber, parseAsset, vestsToHp } from "@/utils";
import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import { getDynamicPropsQuery, getReceivedVestingSharesQuery } from "@/api/queries";
import { Pagination } from "@/features/ui";
import { Account } from "@/entities";

interface Props {
  account: Account;
  onHide: () => void;
}

export function ReceivedVesting({ onHide, account }: Props) {
  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  const { data: vestingShares, isLoading } = getReceivedVestingSharesQuery(
    account.name
  ).useClientQuery();

  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const sliced = useMemo(
    () =>
      vestingShares
        ?.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize)
        ?.filter((item) =>
          item.delegator.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
        ) ?? [],
    [vestingShares, page, pageSize, searchText]
  );

  return (
    <Modal onHide={onHide} show={true} centered={true}>
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("received-vesting.title")}</ModalTitle>
      </ModalHeader>
      <div className="w-full px-3 pb-4">
        <FormControl
          type="text"
          placeholder={i18next.t("friends.search-placeholder")}
          value={searchText}
          onChange={(e) => {
            let text = e.target.value;
            setSearchText(text);
          }}
        />
      </div>
      <ModalBody>
        <div className="received-vesting-content">
          {isLoading && <LinearProgress />}
          <div className="user-list">
            <div className="list-body">
              {sliced.length === 0 && <div className="empty-list">{i18next.t("g.empty-list")}</div>}
              {sliced.map((x) => {
                const vestingShares = parseAsset(x.vesting_shares).amount;
                const { delegator: username } = x;

                return (
                  <div className="list-item" key={username}>
                    <div className="item-main">
                      <ProfileLink username={username}>
                        <UserAvatar username={username} size="small" />
                      </ProfileLink>
                      <div className="item-info">
                        <ProfileLink username={username}>
                          <span className="item-name notranslate">{username}</span>
                        </ProfileLink>
                      </div>
                    </div>
                    <div className="item-extra">
                      <Tooltip content={x.vesting_shares}>
                        <span>
                          {formattedNumber(vestsToHp(vestingShares, dynamicProps?.hivePerMVests!), {
                            suffix: "HP"
                          })}
                        </span>
                      </Tooltip>
                    </div>
                  </div>
                );
              })}
            </div>

            <Pagination
              className="mt-4"
              dataLength={vestingShares?.length ?? 0}
              pageSize={pageSize}
              maxItems={4}
              page={page}
              onPageChange={(page: number) => setPage(page)}
            />
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
}
