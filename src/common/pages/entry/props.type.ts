import { PageProps } from "../common";
import { match } from "react-router";

export interface Props extends PageProps {
  match: match<{
    category: string;
    permlink: string;
    username: string;
  }>;
  account: Account;
  updateWalletValues: () => void;
}
