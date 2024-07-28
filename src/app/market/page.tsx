import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function MarketPage() {
  return redirect("/market/swap");
}
