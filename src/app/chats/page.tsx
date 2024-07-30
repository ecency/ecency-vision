import { Feedback, Navbar } from "@/features/shared";
import { ChatsScreen } from "@/app/chats/_screens";
import { Metadata, ResolvingMetadata } from "next";
import { PagesMetadataGenerator } from "@/features/metadata";

export const dynamic = "force-dynamic";

export async function generateMetadata(
  props: unknown,
  parent: ResolvingMetadata
): Promise<Metadata> {
  return PagesMetadataGenerator.getForPage("chats");
}

export default function Chats() {
  return (
    <>
      <Feedback />
      <Navbar />
      <ChatsScreen />
    </>
  );
}
