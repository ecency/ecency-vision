import React, { Component } from "react";
import { History } from "history";
import { Community } from "../../store/communities";
import { _t } from "../../i18n";
import { Button } from "@ui/button";

interface Props {
  history: History;
  community: Community;
}

export class CommunityPostBtn extends Component<Props> {
  clicked = () => {
    const { community, history } = this.props;
    history.push(`/submit?com=${community.name}`);
  };

  render() {
    return <Button onClick={this.clicked}>{_t("community.post")}</Button>;
  }
}

export default (p: Props) => {
  const props: Props = {
    history: p.history,
    community: p.community
  };

  return <CommunityPostBtn {...props} />;
};
