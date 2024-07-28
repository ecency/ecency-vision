import { Feedback, Navbar } from "@/features/shared";
import { ChatsScreen } from "@/app/chats/_screens";

export const dynamic = "force-dynamic";

export default function Chats() {
  return (
    <>
      <Feedback />
      <Navbar />
      <ChatsScreen />
    </>
  );
}
