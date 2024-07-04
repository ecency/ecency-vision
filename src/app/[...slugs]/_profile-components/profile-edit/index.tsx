import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./index.scss";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Account, FullAccount } from "@/entities";
import i18next from "i18next";
import { useGlobalStore } from "@/core/global-store";
import usePrevious from "react-use/lib/usePrevious";
import { useUpdateProfile } from "@/api/mutations";
import { getAccountFullQuery } from "@/api/queries";
import { ImageUploadButton } from "@/features/shared";
import { Spinner } from "@ui/spinner";

interface Props {
  account: Account;
}

export function ProfileEdit() {
  const activeUser = useGlobalStore((s) => s.activeUser);
  const updateActiveUser = useGlobalStore((s) => s.updateActiveUser);
  const previousActiveUser = usePrevious(activeUser);

  const { refetch, isPending: inProgress } = getAccountFullQuery(
    activeUser?.username
  ).useClientQuery();

  const profile = useMemo(
    () => (activeUser?.data.__loaded && activeUser.data.profile ? activeUser.data.profile : {}),
    [activeUser]
  );

  const [name, setName] = useState(profile.name ?? "");
  const [about, setAbout] = useState(profile.about ?? "");
  const [profileImage, setProfileImage] = useState(profile.profile_image ?? "");
  const [coverImage, setCoverImage] = useState(profile.cover_image ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [changed, setChanged] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (activeUser?.username !== previousActiveUser?.username && activeUser) {
      setName(profile.name ?? "");
      setAbout(profile.about ?? "");
      setProfileImage(profile.profile_image ?? "");
      setCoverImage(profile.cover_image ?? "");
      setWebsite(profile.website ?? "");
      setLocation(profile.location ?? "");
    }
  }, [activeUser, previousActiveUser, profile]);

  const { mutateAsync: updateProfile, isPending } = useUpdateProfile(
    activeUser?.data as FullAccount
  );
  const update = useCallback(async () => {
    await updateProfile({
      nextProfile: {
        name,
        about,
        cover_image: coverImage,
        profile_image: profileImage,
        website,
        location,
        pinned: profile.pinned
      }
    });
    const { data } = await refetch();
    await updateActiveUser(data);
  }, [
    about,
    coverImage,
    location,
    name,
    profile.pinned,
    profileImage,
    refetch,
    updateActiveUser,
    updateProfile,
    website
  ]);

  return (
    <div className="profile-edit">
      <div className="profile-edit-header">{i18next.t("profile-edit.title")}</div>
      <div className="grid grid-cols-12 gap-3">
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.name")}</label>
            <FormControl
              type="text"
              disabled={inProgress}
              value={name}
              maxLength={30}
              data-var="name"
              onChange={(e) => {
                setName(e.target.value);
                setChanged(true);
              }}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.about")}</label>
            <FormControl
              type="text"
              disabled={inProgress}
              value={about}
              maxLength={160}
              data-var="about"
              onChange={(e) => {
                setAbout(e.target.value);
                setChanged(true);
              }}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.profile-image")}</label>
            <InputGroup
              className="mb-3"
              append={
                <ImageUploadButton
                  onBegin={() => setUploading(true)}
                  onEnd={(url) => {
                    setProfileImage(url);
                    setUploading(false);
                    setChanged(true);
                  }}
                />
              }
            >
              <FormControl
                type="text"
                disabled={inProgress}
                placeholder="https://"
                value={profileImage}
                maxLength={500}
                data-var="profileImage"
                onChange={(e) => {
                  setProfileImage(e.target.value);
                  setChanged(true);
                }}
              />
            </InputGroup>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.cover-image")}</label>
            <InputGroup
              className="mb-3"
              append={
                <ImageUploadButton
                  onBegin={() => setUploading(true)}
                  onEnd={(url) => {
                    setCoverImage(url);
                    setUploading(false);
                    setChanged(true);
                  }}
                />
              }
            >
              <FormControl
                type="text"
                disabled={inProgress}
                placeholder="https://"
                value={coverImage}
                maxLength={500}
                data-var="coverImage"
                onChange={(e) => {
                  setCoverImage(e.target.value);
                  setChanged(true);
                }}
              />
            </InputGroup>
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.website")}</label>
            <FormControl
              type="text"
              disabled={inProgress}
              placeholder="https://"
              value={website}
              maxLength={100}
              data-var="website"
              onChange={(e) => {
                setWebsite(e.target.value);
                setChanged(true);
              }}
            />
          </div>
        </div>
        <div className="col-span-12 lg:col-span-6 xl:col-span-4">
          <div className="mb-4">
            <label>{i18next.t("profile-edit.location")}</label>
            <FormControl
              type="text"
              disabled={inProgress}
              value={location}
              maxLength={30}
              data-var="location"
              onChange={(e) => {
                setLocation(e.target.value);
                setChanged(true);
              }}
            />
          </div>
        </div>
      </div>
      {changed && (
        <Button
          icon={inProgress && <Spinner className="w-3.5 h-3.5" />}
          onClick={update}
          disabled={inProgress || uploading || isPending}
        >
          {i18next.t("g.update")}
        </Button>
      )}
    </div>
  );
}
