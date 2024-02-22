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
    <div className="bg-white h-full rounded-3xl cursor-pointer p-6 relative overflow-hidden">
      <img src={img} alt="" className="absolute top-0 left-0 w-full h-full blur-lg opacity-[15%]" />
      <div className="flex flex-col text-center justify-between h-full relative items-center">
        <img src={img} alt="" className="w-[150px] mb-8" />
        <div className="flex flex-col items-center">
          <div className="flex flex-col mb-6">
            <h3 className="font-semibold text-blue-dark-sky mb-2">{title}</h3>
            <h4 className="text-sm">{subtitle}</h4>
          </div>
          <Button onClick={onClick} className="min-w-[10rem]" size="display" icon={icon}>
            {actionText}
          </Button>
        </div>
      </div>
    </div>
  );
}
