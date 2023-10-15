import React from "react";
import UserAvatar from "../user-avatar";
import { useMappedStore } from "../../store/use-mapped-store";

interface Props {
  name: string | null;
  title: string;
  onSelect: (value: string | null) => void;
  onHide: () => void;
}

export function CommunitySelectorItem({ name, title, onSelect, onHide }: Props) {
  const { activeUser } = useMappedStore();

  return (
    <a
      href="#"
      className="flex"
      onClick={(e) => {
        e.preventDefault();
        onSelect(name);
        onHide();
      }}
    >
      <div className="flex bg-light-600 hover:bg-blue-dark-sky-040 dark:bg-blue-metallic-20 dark:hover:bg-blue-metallic-10 rounded-md px-2 py-1.5 text-sm items-center gap-2 hover:text-blue-dark-sky dark:hover:text-white cursor-pointer">
        <UserAvatar username={name ?? activeUser?.username ?? ""} size="small" />
        <div className="item-info">
          <span className="item-name notranslate">{title}</span>
        </div>
      </div>
    </a>
  );
}
