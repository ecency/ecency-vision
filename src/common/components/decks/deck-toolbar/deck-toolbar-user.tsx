import { UserAvatar } from "../../user-avatar";
import { FullAccount } from "../../../store/accounts/types";
import React from "react";
import { useMappedStore } from "../../../store/use-mapped-store";
import { Dropdown } from "react-bootstrap";

interface Props {
  isExpanded: boolean;
  items: {
    label: string;
    onClick: () => void;
  }[];
}

export const DeckToolbarUser = ({ isExpanded, items }: Props) => {
  const { activeUser, global } = useMappedStore();

  return activeUser ? (
    <div
      className={
        "user d-flex align-items-center " +
        (isExpanded ? "justify-content-start" : "justify-content-center")
      }
    >
      <Dropdown>
        <Dropdown.Toggle variant="link">
          <UserAvatar size="medium" global={global} username={activeUser?.username} />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {items.map(({ label, onClick }) => (
            <Dropdown.Item onClick={() => onClick()} key={label}>
              {label}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>
      {isExpanded ? (
        <div className="content">
          <div className="name">{(activeUser.data as FullAccount).name}</div>
          <div className="username">@{activeUser.username}</div>
        </div>
      ) : (
        <></>
      )}
    </div>
  ) : (
    <></>
  );
};
