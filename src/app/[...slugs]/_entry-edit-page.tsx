import { SubmitWithProvidersPage } from "@/app/submit/_page";

interface Props {
  username: string;
  permlink: string;
}

export function EntryEditPage({ username, permlink }: Props) {
  return (
    <SubmitWithProvidersPage
      path={`@${username}/${permlink}/edit`}
      permlink={permlink}
      username={username}
    />
  );
}
