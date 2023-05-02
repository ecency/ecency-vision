import React from "react";
import { Dropdown } from "react-bootstrap";
import { _t } from "../../../i18n";
import { UserAvatar } from "../../user-avatar";
import { useMappedStore } from "../../../store/use-mapped-store";

interface Props {
  host: string | undefined;
  setHost: (v: string) => void;
}

export const DeckThreadsFormThreadSelection = ({ host, setHost }: Props) => {
  const availableThreadHosts: string[] = [
    ...(process.env.NODE_ENV === "development" ? ["testhreads"] : []),
    "leothreads"
  ];

  const { global } = useMappedStore();

  return (
    <div className="deck-threads-form-thread-selection mb-3">
      <Dropdown>
        <span>{_t("decks.threads-form.thread-host")}:</span>
        <Dropdown.Toggle variant="link">
          {host ? host : _t("decks.threads-form.select-thread-host")}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {availableThreadHosts.map((v) => (
            <Dropdown.Item key={v} onClick={() => setHost(v)} className="thread-host-item">
              <UserAvatar size="small" global={global} username={v} />
              {v}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
};
