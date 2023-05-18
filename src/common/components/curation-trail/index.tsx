import React, { useState } from "react";
import { Entry, EntryGroup } from "../../store/entries/types";
import { getAccountVotesTrail } from "../../api/hive";
import useAsyncEffect from "use-async-effect";
import { PageProps } from "../../pages/common";
import EntryListContent from "../entry-list";
import EntryListLoadingItem from "../entry-list-loading-item";
import { Account } from "../../store/accounts/types";
import DetectBottom from "../detect-bottom";
import LinearProgress from "../linear-progress";

interface Props extends PageProps {
  username: string;
  section: string;
  pinEntry: (entry: Entry | null) => void;
  account: Account;
}

const CurationTrail = (props: Props) => {
  const [dataTrail, setDataTrail] = useState<EntryGroup>({
    entries: [],
    sid: "",
    loading: false,
    error: null,
    hasMore: false
  });

  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(20);

  useAsyncEffect(async () => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    setDataTrail({ ...dataTrail, ...{ loading: true } });
    setLoading(true);

    let username = props.username.replace("@", "");
    let data = await getAccountVotesTrail(username, -1, limit);
    data = data.filter(
      (value, index, self) => index === self.findIndex((t) => t.post_id === value.post_id)
    );

    setDataTrail((trail) => ({
      ...trail,
      ...{ entries: trail.entries.concat(data.reverse()), loading: false }
    }));
    setLoading(false);

    if (data.length < 20) {
      await fetchMoreEntries(false, data.slice(-1)[0].num);
    } else {
      setLoading(false);
    }
  };

  const fetchMoreEntries = async (bottom: boolean = false, index: number = -1) => {
    setLoading(true);
    let prevLastEntry: Entry | null = bottom === true ? dataTrail.entries.slice(-1)[0] : null;
    let username = props.username.replace("@", "");

    let newData: Entry[] = [];

    while (newData.length < 20) {
      var start: number = index;
      if (newData.length) {
        //this function already fetching data due to some condition
        start = newData.slice(-1)[0].num! - 1; //start from last entry of the current data being fetched
      } else if (bottom && prevLastEntry) {
        //if bottom has reaced then take last entry number from state
        start = prevLastEntry.num! - 1;
      } else {
        //it is the start and still fetching entries at init
        start = index;
      }

      let moreData = await getAccountVotesTrail(username, start, limit);
      newData = [...newData, ...moreData];
    }
    setLoading(false);
    setDataTrail((trail) => ({
      ...trail,
      ...{ entries: trail.entries.concat(newData.reverse()), loading: false }
    }));
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
      <DetectBottom onBottom={() => !loading && fetchMoreEntries(true)} />
    </>
  );
};

export default CurationTrail;
