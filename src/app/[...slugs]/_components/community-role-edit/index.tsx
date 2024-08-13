import React, { useCallback, useRef, useState } from "react";
import "./_index.scss";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "@ui/modal";
import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { Account, Community } from "@/entities";
import i18next from "i18next";
import { Tsx } from "@/features/i18n/helper";
import { LinearProgress } from "@/features/shared";
import { useCommunitySetUserRole } from "@/api/mutations";
import { getAccount } from "@/api/hive";

interface Props {
  community: Community;
  user: string;
  role: string;
  roles: string[];
  onHide: () => void;
}

export function CommunityRoleEditDialog({
  onHide,
  roles,
  role: propsRole,
  community,
  user: propsUser
}: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState(propsUser);
  const [role, setRole] = useState(propsRole);
  const [userError, setUserError] = useState("");

  const { mutateAsync: setUserRole, isPending } = useCommunitySetUserRole(community, () =>
    onHide()
  );

  const userChanged = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { value: user } = e.target;
    setUser(user);
  }, []);

  const roleChanged = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value: role } = e.target;
    setRole(role);
  }, []);
  const submit = useCallback(async () => {
    if (user.trim() === "") {
      inputRef.current?.focus();
      return false;
    }

    setUserError("");
    let userData: Account | null | undefined;

    try {
      userData = await getAccount(user);
    } catch (e) {
      userData = null;
    }

    if (!userData) {
      setUserError(i18next.t("community-role-edit.user-not-found"));
    }

    await setUserRole({ user, role });
  }, [role, setUserRole, user]);

  return (
    <Modal
      show={true}
      centered={true}
      onHide={onHide}
      className="community-role-edit-dialog"
      size="lg"
    >
      <ModalHeader closeButton={true}>
        <ModalTitle>{i18next.t("community-role-edit.title")}</ModalTitle>
      </ModalHeader>
      <ModalBody>
        <div className="community-role-edit-dialog-content">
          {isPending && <LinearProgress />}
          <div className={`user-role-form ${isPending ? "in-progress" : ""}`}>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-role-edit.username")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <InputGroup prepend="@">
                  <FormControl
                    type="text"
                    autoFocus={user === ""}
                    placeholder={i18next.t("community-role-edit.username").toLowerCase()}
                    value={user}
                    onChange={userChanged}
                    className={userError ? "is-invalid" : ""}
                    ref={inputRef}
                  />
                </InputGroup>
                {userError && <small className="text-red">{userError}</small>}
              </div>
            </div>
            <div className="flex mb-4">
              <div className="w-full sm:w-2/12">
                <label>{i18next.t("community-role-edit.role")}</label>
              </div>
              <div className="w-full sm:w-10/12">
                <FormControl type="select" value={role} onChange={roleChanged}>
                  {roles.map((r, i) => (
                    <option key={i} value={r}>
                      {r}
                    </option>
                  ))}
                </FormControl>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" onClick={submit} disabled={isPending}>
                {i18next.t("g.save")}
              </Button>
            </div>
          </div>
          <Tsx k="community-role-edit.explanations">
            <div className="explanations" />
          </Tsx>
        </div>
      </ModalBody>
    </Modal>
  );
}
