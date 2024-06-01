import React, { useCallback, useState } from "react";
import { Tooltip } from "@ui/tooltip";
import i18next from "i18next";
import { pencilOutlineSvg } from "@ui/svg";
import { ImageUploadDialog } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-card/community-image-upload-dialog";
import { useUpdateProfile } from "@/api/mutations";
import { FullAccount } from "@/entities";

interface Props {
  account: FullAccount;
}

export function CommunityCoverEditImage({ account }: Props) {
  const [dialog, setDialog] = useState(false);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile(account);

  const save = useCallback(
    async (url: string) => {
      if (account.profile?.cover_image === url) {
        setDialog(false);
        return;
      }

      await updateProfile({
        nextProfile: {
          cover_image: url
        }
      });
    },
    [account.profile?.cover_image, updateProfile]
  );

  return (
    <>
      <Tooltip content={i18next.t("community-cover.cover-image-edit")}>
        <div className="btn-edit-cover-image" onClick={() => setDialog(true)}>
          {pencilOutlineSvg}
        </div>
      </Tooltip>
      {dialog && (
        <ImageUploadDialog
          title={i18next.t("community-cover.cover-image")}
          defImage={account.profile?.cover_image || ""}
          inProgress={isPending}
          onDone={save}
          onHide={() => setDialog(false)}
        />
      )}
    </>
  );
}
