import { Navbar, UserAvatar } from "@/features/shared";
import { FormControl } from "@ui/input";

export default function TestPage() {
  return (
    <div>
      <Navbar />
      <UserAvatar size="64" username="demo.com" />
      <FormControl type="text" />
    </div>
  );
}
