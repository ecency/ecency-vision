import React from "react";
import { Button } from "@ui/button";
import { Community } from "@/entities";
import i18next from "i18next";

interface Props {
  community: Community;
}

export function CommunityPostBtn({ community }: Props) {
  return <Button href={`/submit?com=${community.name}`}>{i18next.t("community.post")}</Button>;
}
