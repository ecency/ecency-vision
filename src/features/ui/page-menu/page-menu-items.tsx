import { PropsWithChildren } from "react";

export function PageMenuItems(props: PropsWithChildren) {
  return (
    <div className="hidden lg:flex bg-gray-100 gap-2 md:gap-4 items-center dark:bg-gray-900 rounded-3xl p-2 lg:px-4">
      {props.children}
    </div>
  );
}
