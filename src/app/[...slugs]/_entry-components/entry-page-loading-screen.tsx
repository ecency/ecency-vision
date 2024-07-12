"use client";

import React from "react";
import { LinearProgress } from "@/features/shared";
import { EcencyClientServerBridge } from "@/core/bridge";
import { EntryPageContext } from "@/app/[...slugs]/_entry-components/context";

export const EntryPageLoadingScreen = () => {
  const { loading } = EcencyClientServerBridge.useSafeContext(EntryPageContext);

  return (
    <>
      {loading && (
        <div className="mt-5">
          <div className="pt-2">
            <div className="mt-1">
              <LinearProgress />
            </div>
          </div>
        </div>
      )}
    </>
  );
};
