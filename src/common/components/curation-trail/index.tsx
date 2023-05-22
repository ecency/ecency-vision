import React, { useEffect, useState } from "react";
import { Entry, EntryGroup } from "../../store/entries/types";
import { getAccountHistory } from "../../api/hive";
import useAsyncEffect from "use-async-effect";
import { PageProps } from "../../pages/common";
import EntryListContent from "../entry-list";
import EntryListLoadingItem from "../entry-list-loading-item";
import { Account } from "../../store/accounts/types";
import DetectBottom from "../detect-bottom";
import LinearProgress from "../linear-progress";
import { utils } from "@hiveio/dhive";
import { getPost } from "../../api/bridge";
import moment from "moment";
import { last } from "lodash";
interface Props extends PageProps {
  username: string;
  section: string;
  pinEntry: (entry: Entry | null) => void;
  account: Account;
}

const limit = 20;
const days = 7.0;

const CurationTrail = (props: Props) => {
  const [dataTrail, setDataTrail] = useState<EntryGroup>({
    entries: [],
    sid: "",
    loading: false,
    error: null,
    hasMore: false
  });

  const [loading, setLoading] = useState(true);
  const [lastHistoryItemDays, setLastHistoryItemDays] = useState<number>(-1);
  const [lastHistoryItem, setLastHistoryItem] = useState(-1);

  useAsyncEffect(async () => {
    //Fetch entries at time of first load
    fetchEntries(-1);
  }, []);

  const fetchAccountVoteHistory = async (start: number) => {
    let username = props.username.replace("@", "");

    let r = await getAccountHistory(
      username,
      utils.makeBitMaskFilter([utils.operationOrders.vote]),
      start,
      20
    ).then(async (data) => {
      let result = data
        .map((historyObj: any) => {
          return { ...historyObj[1].op[1], num: historyObj[0], timestamp: historyObj[1].timestamp };
        })
        .filter(
          (filtered: any) =>
            filtered.voter === username &&
            filtered.weight != 0 &&
            getDays(filtered.timestamp) <= days
        );
      const p = Promise.all(
        result.map((obj: any) => getPost(obj.author, obj.permlink, username, obj.num))
      );
      var entries: Entry[] = await p;
      return {
        lastDate: getDays(data[0][1].timestamp),
        lastItemFetched: data[0][0],
        newData: entries
      };
    });

    return r;
  };

  /**
   * Fetch entries from account hsitory. Pass -1 if fetching from start. Pass post number from last history item if fetching later on.
   * @param index
   */

  const fetchEntries = async (index: number = -1) => {
    setLoading(true);
    let data: Entry[] = [];
    // loop until paginated data length is reached
    while (data.length < limit) {
      let { lastDate, newData, lastItemFetched } = await fetchAccountVoteHistory(index);
      setLastHistoryItem(lastItemFetched);
      setLastHistoryItemDays(lastDate);
      if (lastDate > days || newData.length === 0) {
        break;
      }
      console.log(newData);
      newData = newData.reverse();
      index = newData.slice(-1)[0].num! + 1;
      index = lastItemFetched;
      data = makeUnique(data.concat(newData));
    }

    setDataTrail((trail) => ({
      ...trail,
      ...{ entries: makeUnique(trail.entries.concat(data)), loading: false }
    }));

    setLoading(false);
  };

  const getDays = (createdDate: string): number => {
    const past = moment(createdDate);
    const now = moment(new Date());
    const duration = moment.duration(now.diff(past));
    const days = duration.asDays();
    return days;
  };

  const makeUnique = (data: Entry[]): Entry[] => {
    return (data = data.filter(
      (value, index, self) => index === self.findIndex((t) => t.post_id === value.post_id)
    ));
  };

  return (
    <>
      {EntryListContent({
        ...props,
        entries: dataTrail.entries as Entry[],
        promotedEntries: [],
        loading,
        account: props.account
      })}
      {loading && (
        <>
          <EntryListLoadingItem />
          <LinearProgress />
        </>
      )}
      <DetectBottom
        onBottom={() => {
          if (!loading && lastHistoryItemDays <= days) {
            if (dataTrail.entries.length) {
              var index: number = dataTrail.entries.slice(-1)[0].num! - 1;
              fetchEntries(lastHistoryItem);
            }
          }
        }}
      />
    </>
  );
};

export default CurationTrail;
