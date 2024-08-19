import React, { PropsWithChildren } from "react";

interface Props {
  title: string;
  isLoading: boolean;
}

export function ProfilePreviewCellLayout({ title, isLoading, children }: PropsWithChildren<Props>) {
  return (
    <div className="p-2 md:px-4 flex-grow-1">
      <div className="opacity-50 font-bold text-xs uppercase">{title}</div>
      <div className="text-break-wrap">
        {isLoading ? (
          <div className="animate-pulse h-[48px] rounded-lg w-full bg-blue-dark-sky-040" />
        ) : (
          children
        )}
      </div>
    </div>
  );
}
