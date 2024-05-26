import { Feedback, Navbar } from "@/features/shared";
import { ChatsScreen } from "@/app/chats/_screens";

export default function Chats() {
  return (
    <>
      <Feedback />
      <Navbar />
      <ChatsScreen />
    </>
  );
}
