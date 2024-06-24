"use client";

import {
  Feedback,
  Navbar,
  PurchaseQrBuilder,
  PurchaseTypes,
  ScrollToTop,
  Theme
} from "@/features/shared";
import { useEffect, useState } from "react";
import Head from "next/head";
import { useGlobalStore } from "@/core/global-store";
import { FullAccount } from "@/entities";
import { useSearchParams } from "next/navigation";

export default function Purchase() {
  const params = useSearchParams();
  const account = useGlobalStore((s) => s.activeUser);

  const [username, setUsername] = useState("");
  const [type, setType] = useState(PurchaseTypes.BOOST);
  const [productId, setProductId] = useState("999points");

  useEffect(() => {
    if (params.get("username")) {
      setUsername(params.get("username") as string);
    }
    if (params.get("type")) {
      setType(params.get("type") as PurchaseTypes);
    }
    if (params.get("product_id")) {
      setProductId(params.get("product_id") as string);
    }
  }, [params]);

  return (
    <>
      <Head>
        <title>{`Boost ${
          (account as FullAccount | null)?.profile?.name || account?.username
        }`}</title>
        <meta
          name="description"
          content={`Boost ${(account as FullAccount | null)?.profile?.name || account?.username}`}
        />
        <meta
          property="og:title"
          content={`Boost ${(account as FullAccount | null)?.profile?.name || account?.username}`}
        />
        <meta
          property="og:description"
          content={`Boost ${(account as FullAccount | null)?.profile?.name || account?.username}`}
        />
        <meta property="og:url" content={`/purchase?username=${account?.username}&type=boost`} />
        <link rel="canonical" href={`/purchase?username=${account?.username}&type=boost`} />
      </Head>
      <ScrollToTop />
      <Theme />
      <Feedback />
      <Navbar />

      <div className="app-content container">
        <div className="flex items-center w-full justify-center">
          <div className="w-[50%] border border-[--border-color] rounded-2xl p-4">
            <PurchaseQrBuilder username={username} queryType={type} queryProductId={productId} />
          </div>
        </div>
      </div>
    </>
  );
}
