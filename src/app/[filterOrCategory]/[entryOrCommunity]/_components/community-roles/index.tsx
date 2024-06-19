"use client";

import React, { useCallback, useMemo, useState } from "react";
import "./_index.scss";
import { Button } from "@ui/button";
import { Table, Td, Th, Tr } from "@ui/table";
import { Community, roleMap } from "@/entities";
import i18next from "i18next";
import { ProfileLink, UserAvatar } from "@/features/shared";
import { useGlobalStore } from "@/core/global-store";
import { CommunityRoleEditDialog } from "@/app/[filterOrCategory]/[entryOrCommunity]/_components/community-role-edit";

interface Props {
  community: Community;
}

export function CommunityRoles({ community }: Props) {
  const activeUser = useGlobalStore((state) => state.activeUser);

  const [dialog, setDialog] = useState(false);
  const [dialogUser, setDialogUser] = useState<string>("");
  const [dialogRole, setDialogRole] = useState<string>("");

  const role = useMemo(
    () => community.team.find((x) => x[0] === activeUser?.username),
    [community]
  );
  const roleInTeam = useMemo(() => (role ? role[1] : null), [role]);
  const roles = useMemo(() => (roleInTeam ? roleMap[roleInTeam] : []), [roleInTeam]);

  const showDialog = useCallback((user = "", role = "") => {
    setDialog(true);
    setDialogUser(user);
    setDialogRole(role);
  }, []);

  return (
    <div className="community-roles">
      <h2>{i18next.t("community.roles-title")}</h2>
      <Table full={true}>
        <thead>
          <Tr>
            <Th style={{ width: "200px" }}>{i18next.t("community.roles-account")}</Th>
            <Th style={{ width: "74px" }}>{i18next.t("community.roles-role")}</Th>
            <Th className="border p-3">{i18next.t("community.roles-account-title")}</Th>
          </Tr>
        </thead>
        <tbody>
          {community.team.map((t, i) => {
            const [username, role, title] = t;
            const canEdit = roles && roles.includes(role);
            return (
              <Tr key={i}>
                <Td>
                  <ProfileLink username={username}>
                    <span className="user flex gap-3 items-center">
                      <UserAvatar username={username} size="medium" />{" "}
                      <span className="username">{username}</span>
                    </span>
                  </ProfileLink>
                </Td>
                <Td>
                  {canEdit ? (
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        showDialog(username, role);
                      }}
                    >
                      {role}
                    </a>
                  ) : (
                    role
                  )}
                </Td>
                <Td>{title}</Td>
              </Tr>
            );
          })}
        </tbody>
      </Table>
      {roles.length > 0 && (
        <Button onClick={() => showDialog()}>{i18next.t("community.roles-add")}</Button>
      )}

      {dialog && (
        <CommunityRoleEditDialog
          community={community}
          user={dialogUser}
          role={dialogRole}
          roles={roles}
          onHide={() => setDialog(false)}
        />
      )}
    </div>
  );
}
