import React, { ReactNode } from "react";
import { Button } from "@ui/button";

interface Props {
  title: string;
  subtitle: string;
  actionText: string;
  img: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function MajorPerkCard({ title, img, subtitle, actionText, icon, onClick }: Props) {
  return (
    <div className="bg-white relative overflow-hidden rounded-3xl cursor-pointer min-h-[14rem] flex p-6">
      <div className="flex flex-col justify-between">
        <div className="flex flex-col">
          <h3 className="text-xl font-semibold mb-4">{title}</h3>
          <h4>{subtitle}</h4>
        </div>
        <Button onClick={onClick} className="min-w-[10rem]" size="display" icon={icon}>
          {actionText}
        </Button>
      </div>
      <img src={img} alt="" className="absolute -bottom-4 -right-4 w-[150px]" />
    </div>
  );
}
