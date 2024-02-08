import { Alert } from "@ui/alert";
import { _t } from "../../../i18n";
import React, { useMemo } from "react";
import { useDirectContactsQuery, useOriginalJoinedChannelsQuery } from "@ecency/ns-query";
import usePrevious from "react-use/lib/usePrevious";

export function NetworkError() {
  const { data: channels, isError: isChannelsFailed } = useOriginalJoinedChannelsQuery();
  const { data: contacts, isError: isDirectContactsFailed } = useDirectContactsQuery();
  const previousChannels = usePrevious(channels);
  const previousContacts = usePrevious(contacts);

  const isFetchingFailed = useMemo(
    () =>
      isDirectContactsFailed ||
      isChannelsFailed ||
      (contacts?.length === 0 && (previousContacts ?? []).length > 0) ||
      (channels?.length === 0 && (previousChannels ?? []).length > 0),
    [
      isDirectContactsFailed,
      isChannelsFailed,
      contacts,
      previousContacts,
      channels,
      previousChannels
    ]
  );

  return isFetchingFailed ? <Alert className="m-3">{_t("chat.fetch-error")}</Alert> : <></>;
}
