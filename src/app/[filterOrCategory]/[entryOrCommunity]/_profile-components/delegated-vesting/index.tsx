import React, { useEffect, useMemo, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl } from "@ui/input";
import { Account } from "@/entities";
import i18next from "i18next";
import { Pagination, Tooltip } from "@/features/ui";
import { formattedNumber, parseAsset, vestsToHp } from "@/utils";
import { KeyOrHotDialog, LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import { getDynamicPropsQuery, getVestingDelegationsQuery } from "@/api/queries";
import { useGlobalStore } from "@/core/global-store";
import { useDelegateVestingSharesByKey, useDelegateVestingSharesByKeychain } from "@/api/mutations";
import { delegateVestingSharesHot } from "@/api/operations";

interface Props {
  account: Account;
  onHide: () => void;
  totalDelegated: string;
}

export function DelegatedVesting({ onHide, account, totalDelegated }: Props) {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const { data: dynamicProps } = getDynamicPropsQuery().useClientQuery();

  const [subtitle, setSubtitle] = useState("");
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);
  const [hideList, setHideList] = useState(false);

  const { data: delegations, isLoading } = getVestingDelegationsQuery(
    account.name,
    "",
    1000
  ).useClientQuery();

  const { mutateAsync: delegateByKey } = useDelegateVestingSharesByKey(account.name);
  const { mutateAsync: delegateByKeychain } = useDelegateVestingSharesByKeychain(account.name);

  const data = useMemo(
    () =>
      delegations
        ?.sort((a, b) => parseAsset(b.vesting_shares).amount - parseAsset(a.vesting_shares).amount)
        ?.filter((item) =>
          item.delegatee.toLocaleLowerCase().includes(searchText.toLocaleLowerCase())
        ) ?? [],
    [delegations, searchText]
  );
  const sliced = useMemo(
    () => data.slice((page - 1) * pageSize, (page - 1) * pageSize + pageSize),
    [data, page, pageSize]
  );

  useEffect(() => {
    const totalDelegatedValue = data.reduce((n, item) => {
      let parsedValue: any = parseAsset(item.vesting_shares).amount;
      parsedValue = vestsToHp(parsedValue, dynamicProps!.hivePerMVests);
      parsedValue = formattedNumber(parsedValue);
      parsedValue = parsedValue.replace(/,/g, "");
      parsedValue = parseFloat(parsedValue);
      parsedValue = n + parsedValue;
      return parsedValue;
    }, 0);

    const totalDelegatedNumbered = parseFloat(totalDelegated.replace(" HP", "").replace(",", ""));
    const toBeReturned = totalDelegatedNumbered - totalDelegatedValue;
    setSubtitle(toBeReturned.toFixed(3));
  }, [data, dynamicProps, totalDelegated]);

  return (
    <Modal onHide={onHide} show={true} centered={true} animation={false}>
      <ModalHeader closeButton={true}>
        <ModalTitle>
          <div>
            <div>{i18next.t("delegated-vesting.title")}</div>
            <div className="text-gray-600 mt-3 text-small">{subtitle}</div>
          </div>
        </ModalTitle>
      </ModalHeader>

      <div className="w-full mb-4 px-3">
        <FormControl
          type="text"
          placeholder={i18next.t("friends.search-placeholder")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <ModalBody>
        {isLoading && <LinearProgress />}
        {!isLoading && (
          <div
            className={`delegated-vesting-content ${isLoading ? "in-progress" : ""} ${
              hideList ? "hidden" : ""
            }`}
          >
            <div className="user-list">
              <div className="list-body">
                {sliced.length === 0 && (
                  <div className="empty-list">{i18next.t("g.empty-list")}</div>
                )}
                {sliced.map((x) => {
                  const vestingShares = parseAsset(x.vesting_shares).amount;
                  const { delegatee: username } = x;
                  return (
                    <div className="list-item" key={username}>
                      <div className="item-main">
                        <ProfileLink username={username}>
                          <UserAvatar username={x.delegatee} size="small" />
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
                            {formattedNumber(
                              vestsToHp(vestingShares, dynamicProps!.hivePerMVests),
                              { suffix: "HP" }
                            )}
                          </span>
                        </Tooltip>
                        {activeUser && activeUser.username === account.name && (
                          <KeyOrHotDialog
                            popOver={true}
                            onToggle={() => setHideList(!hideList)}
                            onKey={(key) => delegateByKey({ key, value: "0.000000 VESTS" })}
                            onHot={() =>
                              delegateVestingSharesHot(
                                activeUser.username,
                                username,
                                "0.000000 VESTS"
                              )
                            }
                            onKc={() => delegateByKeychain({ value: "0.000000 VESTS" })}
                          >
                            <a href="#" className="undelegate">
                              {i18next.t("delegated-vesting.undelegate")}
                            </a>
                          </KeyOrHotDialog>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <Pagination
                className="mt-4"
                dataLength={data.length}
                pageSize={pageSize}
                maxItems={4}
                page={page}
                onPageChange={(page: number) => setPage(page)}
              />
            </div>
          </div>
        )}
      </ModalBody>
    </Modal>
  );
}
