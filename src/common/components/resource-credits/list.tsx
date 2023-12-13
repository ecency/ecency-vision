import React, { useEffect, useState } from "react";
import { getAccount, getIncomingRc, getOutgoingRc } from "../../api/hive";
import { delegateRC } from "../../api/operations";
import { _t } from "../../i18n";
import LinearProgress from "../linear-progress";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { useParams } from "react-router";
import { Account } from "../../store/accounts/types";
import Tooltip from "../tooltip";
import "./list.scss";
import { Global } from "../../store/global/types";
import { Button, FormControl } from "react-bootstrap";

interface Props {
  addAccount: (data: Account) => void;
  global: Global
}

export const RcDelegationsList = (props: any) => {
  const params: any = useParams();

  const {
    activeUser,
    rcFormatter,
    showDelegation,
    listMode,
    setToFromList,
    setAmountFromList,
    confirmDelete,
    setDelegateeData,
    setShowDelegationsList
  } = props;

  const [outGoingList, setOutGoingList]: any = useState([]);
  const [otherUser, setOtherUser]: any = useState(params.username.substring(1));
  const [incoming, setIncoming]: any = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setsearch] = useState("");
  const [loadList, setLoadList] = useState(21);

  useEffect(() => {
    getOutGoingRcList();
    getIncomingRcList();
  }, []);

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

  const getToData = async (data: any) => {
    const toData = await getAccount(data);
    return toData;
  };

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
              <div className="parent-wrap">
                {outGoingList
                  ?.slice(0, loadList)
                  .filter(
                    (list: any) =>
                      list.to.toLowerCase().startsWith(search) ||
                      list.to.toLowerCase().includes(search)
                  )
                  .map((list: any, i: any) => (
                    <div className="wrap-lists" key={list.to}>
                      <div className="d-flex items-center gap-2 mt-3">
                        {/* {ProfileLink({
                          ...props,
                          username: list.to,
                          children: <UserAvatar username={list.to} size="small"/>
                        })} */}
                        <UserAvatar username={list.to} size="small"/>
                        <div className="item-info ml-2">
                          {ProfileLink({
                            ...props,
                            username: list.to,
                            children: <span className="item-name notranslate">{list.to}</span>
                          })}
                        </div>
                      </div>
                      <div className="d-flex items-center gap-3 mt-3">
                        <Tooltip content={list.delegated_rc}>
                          <span>{rcFormatter(list.delegated_rc)}</span>
                        </Tooltip>
                        {activeUser && otherUser == activeUser.username && (
                          <>
                            <a
                            className="ml-2"
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
                              {_t("rc-info.update")}
                            </a>
                            <a
                             className="ml-2"
                              href="#"
                              onClick={() => {
                                confirmDelete();
                                setToFromList(list.to);
                              }}
                            >
                              {_t("rc-info.delete")}
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p>{_t("rc-info.no-outgoing")}</p>
            )}
          </>
        )}

        {listMode === "in" && (
          <>
            {incoming.length > 0 ? (
              <div className="list-body parent-wrap">
                {incoming
                  ?.slice(0, loadList)
                  .filter(
                    (list: any) =>
                      list.sender.toLowerCase().startsWith(search) ||
                      list.sender.toLowerCase().includes(search)
                  )
                  .map((list: any, i: any) => (
                    <div className="list-item wrap-lists" key={list.sender}>
                      <div className="item-main">
                        {/* {ProfileLink({
                          ...props,
                          username: list.sender,
                          children: <UserAvatar username={list.sender} size="small" />
                        })} */}
                        <div className="d-flex mb-2">
                          <UserAvatar username={list.sender} size="small" />
                          <div className="item-info ml-2">
                            {ProfileLink({
                              ...props,
                              username: list.sender,
                              children: <span className="item-name notranslate">{list.sender}</span>
                            })}
                          </div>
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
              <p>{_t("rc-info.no-incoming")}</p>
            )}
          </>
        )}

        {((listMode === "in" && incoming.length >= loadList) ||
          (listMode === "out" && outGoingList.length >= loadList)) && (
          <div className="load-more-btn">
            <Button onClick={loadMore}>{_t("g.load-more")}</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export const ConfirmDelete = (props: any) => {
  const { to, activeUser, hideConfirmDelete } = props;
  return (
    <>
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "25%",
          flexDirection: "column"
        }}
      >
        <h5 className="text" style={{ width: "350px", alignSelf: "center" }}>
          {_t("rc-info.confirm-delete")}
        </h5>
        <div className="d-flex justify-content-center p-3">
          <Button
            className="mr-2"
            onClick={hideConfirmDelete}
          >
            {_t("rc-info.cancel")}
          </Button>
          <Button
            className="ml-2"
            onClick={() => {
              delegateRC(activeUser.username, to, 0);
              hideConfirmDelete();
            }}
          >
            {_t("rc-info.confirm")}
          </Button>
        </div>
      </div>
    </>
  );
};

export default (p: Props) => {
  const props: Props = {
    addAccount: p.addAccount,
    global: p.global
  };

  return <RcDelegationsList {...props} />;
};
