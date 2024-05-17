import { Feedback, Navbar } from "@/features/shared";
import { ChatsScreen } from "@/features/chats/screens";

export default function Chats() {
  return (
    <>
      <Feedback />
      <Navbar />
      <ChatsScreen />
    </>
  );
}
