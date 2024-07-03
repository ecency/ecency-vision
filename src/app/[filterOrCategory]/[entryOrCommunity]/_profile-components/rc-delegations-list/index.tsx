import React, { useState } from "react";
import "./index.scss";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { List, ListItem } from "@ui/list";
import { getAccount, getIncomingRc, getOutgoingRc } from "@/api/hive";
import { LinearProgress, ProfileLink, UserAvatar } from "@/features/shared";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { delegateRC } from "@/api/operations";
import { useParams } from "next/navigation";
import { useGlobalStore } from "@/core/global-store";
import { rcFormatter } from "@/utils";
import useMount from "react-use/lib/useMount";

interface Props {
  showDelegation: () => void;
  listMode: string;
  setToFromList: (value: string) => void;
  setAmountFromList: (value: string) => void;
  confirmDelete: () => void;
  setDelegateeData: (value: any) => void;
  setShowDelegationsList: (value: boolean) => void;
}

export const RcDelegationsList = ({
  showDelegation,
  listMode,
  setToFromList,
  setAmountFromList,
  confirmDelete,
  setDelegateeData,
  setShowDelegationsList
}: Props) => {
  const activeUser = useGlobalStore((s) => s.activeUser);

  const params: any = useParams();

  const [outGoingList, setOutGoingList]: any = useState([]);
  const [otherUser, setOtherUser]: any = useState(params.username.substring(1));
  const [incoming, setIncoming]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setsearch] = useState("");
  const [loadList, setLoadList] = useState(21);

  useMount(() => {
    getOutGoingRcList();
    getIncomingRcList();
  });

  const getOutGoingRcList = async () => {
    setLoading(true);
    const delegationsOutList: any = await getOutgoingRc(otherUser, "");
    const delegationsOutInfo = delegationsOutList.rc_direct_delegations;
    setOutGoingList(delegationsOutInfo);
    setLoading(false);
  };

  const getIncomingRcList = async () => {
    setLoading(true);
    const delegationsIn: any = await getIncomingRc(otherUser);
    const incomingInfo = delegationsIn.list;
    setIncoming(incomingInfo);
    setLoading(false);
  };

  const loadMore = () => {
    const moreList = loadList + 7;
    setLoadList(moreList);
  };

  const getToData = async (data: any) => getAccount(data);

  return (
    <div className="delgations-list">
      {loading && (
        <div className="delegation-loading">
          <LinearProgress />
        </div>
      )}
      <div className="list-container">
        <div className="search-box mb-4">
          <FormControl
            type="text"
            value={search}
            placeholder="search list"
            onChange={(e) => setsearch(e.target.value)}
          />
        </div>

        {listMode === "out" && (
          <>
            {outGoingList.length > 0 ? (
              <List defer={true} inline={true}>
                {outGoingList
                  ?.slice(0, loadList)
                  .filter(
                    (list: any) =>
                      list.to.toLowerCase().startsWith(search) ||
                      list.to.toLowerCase().includes(search)
                  )
                  .map((list: any, i: any) => (
                    <ListItem styledDefer={true} key={list.to}>
                      <div className="flex items-center gap-2">
                        <ProfileLink username={list.to}>
                          <UserAvatar username={list.to} size="small" />
                        </ProfileLink>
                        <div className="item-info">
                          <ProfileLink username={list.to}>
                            <span className="item-name notranslate">{list.to}</span>
                          </ProfileLink>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 mt-3">
                        <Tooltip content={list.delegated_rc}>
                          <span>{rcFormatter(list.delegated_rc)}</span>
                        </Tooltip>
                        {activeUser && otherUser == activeUser.username && (
                          <>
                            <a
                              href="#"
                              onClick={async () => {
                                showDelegation();
                                setShowDelegationsList(false);
                                setAmountFromList(list.delegated_rc);
                                setToFromList(list.to);
                                const data = await getToData(list.to);
                                setDelegateeData(data);
                              }}
                            >
                              {i18next.t("rc-info.update")}
                            </a>
                            <a
                              href="#"
                              onClick={() => {
                                confirmDelete();
                                setToFromList(list.to);
                              }}
                            >
                              {i18next.t("rc-info.delete")}
                            </a>
                          </>
                        )}
                      </div>
                    </ListItem>
                  ))}
              </List>
            ) : (
              <p>{i18next.t("rc-info.no-outgoing")}</p>
            )}
          </>
        )}

        {listMode === "in" && (
          <>
            {incoming.length > 0 ? (
              <div className="list-body">
                {incoming
                  ?.slice(0, loadList)
                  .filter(
                    (list: any) =>
                      list.sender.toLowerCase().startsWith(search) ||
                      list.sender.toLowerCase().includes(search)
                  )
                  .map((list: any, i: any) => (
                    <div className="list-item" key={list.sender}>
                      <div className="item-main">
                        <ProfileLink username={list.sender}>
                          <UserAvatar username={list.sender} size="small" />
                        </ProfileLink>
                        <div className="item-info">
                          <ProfileLink username={list.sender}>
                            <span className="item-name notranslate">{list.sender}</span>
                          </ProfileLink>
                        </div>
                        <div className="item-extra">
                          <Tooltip content={list.amount}>
                            <span>{rcFormatter(list.amount)}</span>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>{i18next.t("rc-info.no-incoming")}</p>
            )}
          </>
        )}

        {((listMode === "in" && incoming.length >= loadList) ||
          (listMode === "out" && outGoingList.length >= loadList)) && (
          <div className="load-more-btn">
            <Button onClick={loadMore}>{i18next.t("g.load-more")}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmDeleteProps {
  to: string;
  hideConfirmDelete: () => void;
}

export const ConfirmDelete = ({ to, hideConfirmDelete }: ConfirmDeleteProps) => {
  const activeUser = useGlobalStore((s) => s.activeUser);
  return (
    <>
      <div className="container">
        <h5 className="text" style={{ width: "350px", alignSelf: "center" }}>
          {i18next.t("rc-info.confirm-delete")}
        </h5>
        <div className="flex justify-center p-3">
          <Button
            className="mr-2"
            appearance="secondary"
            outline={true}
            onClick={hideConfirmDelete}
          >
            {i18next.t("rc-info.cancel")}
          </Button>
          <Button
            className="ml-2"
            onClick={() => {
              delegateRC(activeUser!.username, to, 0);
              hideConfirmDelete();
            }}
          >
            {i18next.t("rc-info.confirm")}
          </Button>
        </div>
      </div>
    </>
  );
};
