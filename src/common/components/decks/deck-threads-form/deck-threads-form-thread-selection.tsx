import React from "react";
import { _t } from "../../../i18n";
import { UserAvatar } from "../../user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";
import { AVAILABLE_THREAD_HOSTS } from "../consts";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { downArrowSvg } from "../../../img/svg";

interface Props {
  host: string | undefined;
  setHost: (v: string) => void;
}

export const DeckThreadsFormThreadSelection = ({ host, setHost }: Props) => {
  const { global } = useMappedStore();

  return (
    <div className="deck-threads-form-thread-selection mb-3">
      <Dropdown>
        <div className="mb-2">{_t("decks.threads-form.thread-host")}:</div>
        <DropdownToggle>
          <Button size="sm" outline={true} icon={downArrowSvg}>
            @{host ? host : _t("decks.threads-form.select-thread-host")}
          </Button>
        </DropdownToggle>
        <DropdownMenu>
          {AVAILABLE_THREAD_HOSTS.filter((v) => v !== "leothreads").map((v) => (
            <DropdownItem key={v} onClick={() => setHost(v)} className="thread-host-item">
              <UserAvatar size="small" global={global} username={v} />
              {v}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
