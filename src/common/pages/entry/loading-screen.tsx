import React from "react";
import { Props } from "./props.type";
import NavBar from "../../components/navbar/index";
import NavBarElectron from "../../../desktop/app/components/navbar";
import LinearProgress from "../../components/linear-progress";
import { StaticNavbar } from "../../components/static";

interface LoadingProps {
  loading: boolean;
  reload: () => void;
  staticNav?: boolean;
}

export const LoadingScreen = (props: Props & LoadingProps) => {
  const nav = props.global.isElectron ? (
    NavBarElectron({
      ...props,
      reloadFn: props.reload,
      reloading: props.loading
    })
  ) : (
    <NavBar history={props.history} match={props.match} />
  );
  const staticNav = <StaticNavbar fullVersionUrl="" />;

  return (
    <>
      {props.staticNav ? staticNav : nav}
      <div className="mt-5">
        <div className="pt-2">
          <div className="mt-1">
            <LinearProgress />
          </div>
        </div>
      </div>
    </>
  );
};
