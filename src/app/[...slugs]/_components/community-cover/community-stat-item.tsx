import { ReactNode } from "react";

interface Props {
  value: ReactNode;
  label: ReactNode;
}

export function CommunityStatItem({ value, label }: Props) {
  return (
    <div className="text-white backdrop-blur rounded-xl bg-gray-600 bg-opacity-25 flex flex-col p-4 items-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="capitalize">{label}</div>
    </div>
  );
}
