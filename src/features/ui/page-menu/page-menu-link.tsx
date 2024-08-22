import Link from "next/link";
import { classNameObject } from "@ui/util";
import React from "react";

interface Props {
  href: string;
  label: string;
  isSelected: boolean;
}

export function PageMenuLink({ isSelected, href, label }: Props) {
  return (
    <Link
      className={classNameObject({
        "text-gray-steel py-1 px-2 text-sm items-center hover:text-blue-dark-sky flex": true,
        "bg-blue-dark-sky text-white rounded-full hover:text-white": isSelected
      })}
      href={href!}
    >
      {label}
    </Link>
  );
}
