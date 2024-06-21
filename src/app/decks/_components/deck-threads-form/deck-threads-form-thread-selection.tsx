import React from "react";
import { AVAILABLE_THREAD_HOSTS } from "../consts";
import { Dropdown, DropdownItem, DropdownMenu, DropdownToggle } from "@ui/dropdown";
import { Button } from "@ui/button";
import { downArrowSvg } from "@ui/svg";
import i18next from "i18next";
import { UserAvatar } from "@/features/shared";

interface Props {
  host: string | undefined;
  setHost: (v: string) => void;
}

export const DeckThreadsFormThreadSelection = ({ host, setHost }: Props) => {
  return (
    <div className="deck-threads-form-thread-selection mb-3">
      <Dropdown>
        <div className="mb-2">{i18next.t("decks.threads-form.thread-host")}:</div>
        <DropdownToggle>
          <Button size="sm" outline={true} icon={downArrowSvg}>
            @{host ? host : i18next.t("decks.threads-form.select-thread-host")}
          </Button>
        </DropdownToggle>
        <DropdownMenu>
          {AVAILABLE_THREAD_HOSTS.filter((v) => v !== "leothreads").map((v) => (
            <DropdownItem key={v} onClick={() => setHost(v)} className="thread-host-item">
              <UserAvatar size="small" username={v} />
              {v}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};
