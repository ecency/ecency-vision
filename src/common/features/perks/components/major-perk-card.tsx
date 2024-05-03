import React, { ReactNode } from "react";
import { Button } from "@ui/button";
import LoginRequired from "../../../components/login-required";
import { useMappedStore } from "../../../store/use-mapped-store";

interface Props {
  title: string;
  subtitle: string;
  actionText: string;
  img: string;
  icon?: ReactNode;
  onClick?: () => void;
}

export function MajorPerkCard({ title, img, subtitle, actionText, icon, onClick }: Props) {
  const { users, activeUser, setActiveUser, updateActiveUser, deleteUser, ui, toggleUIProp } =
    useMappedStore();

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
          <LoginRequired
            ui={ui}
            toggleUIProp={toggleUIProp}
            users={users}
            activeUser={activeUser}
            setActiveUser={setActiveUser}
            updateActiveUser={updateActiveUser}
            deleteUser={deleteUser}
          >
            <Button onClick={onClick} className="min-w-[10rem]" size="display" icon={icon}>
              {actionText}
            </Button>
          </LoginRequired>
        </div>
      </div>
    </div>
  );
}
