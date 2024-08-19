import { PropsWithChildren } from "react";

export function ProfilePreviewPropertiesRowLayout({ children }: PropsWithChildren) {
  return (
    <div className="grid grid-cols-2 text-sm border-b border-[--border-color]">{children}</div>
  );
}
