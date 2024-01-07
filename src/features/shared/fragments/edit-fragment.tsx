import React, { useRef, useState } from "react";
import { Fragment } from "@/entities";
import { FormControl } from "@ui/input";
import PopoverConfirm from "@ui/popover-confirm";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import { Form } from "@ui/form";
import { handleInvalid, handleOnInput } from "@/utils/input-util";
import { useDeleteFragment, useUpdateFragment } from "@/api/mutations";
import i18next from "i18next";

interface Props {
  item: Fragment;
  onUpdate: () => void;
  onCancel: () => void;
}

export function EditFragment({ item, onUpdate, onCancel }: Props) {
  const [title, setTitle] = useState(item.title);
  const [body, setBody] = useState(item.body);

  const formRef = useRef<HTMLFormElement>(null);

  const { mutateAsync: updateFragment, isPending: isUpdateLoading } = useUpdateFragment(
    item.id,
    onUpdate
  );
  const { mutateAsync: deleteFragment, isPending: isDeleteLoading } = useDeleteFragment(
    item.id,
    onUpdate
  );

  return (
    <Form
      ref={formRef}
      onSubmit={(e: React.FormEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!formRef.current?.checkValidity()) {
          return;
        }

        updateFragment({ title, body });
      }}
    >
      <div className="mb-4">
        <label>{i18next.t("fragments.form-title")}</label>
        <FormControl
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required={true}
          type="text"
          maxLength={255}
          disabled={isUpdateLoading || isDeleteLoading}
          autoFocus={true}
          onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-title")}
          onInput={handleOnInput}
        />
      </div>
      <div className="mb-4">
        <label>{i18next.t("fragments.form-body")}</label>
        <FormControl
          type="textarea"
          style={{ height: "300px" }}
          value={body}
          onChange={(e: any) => setBody(e.target.value)}
          required={true}
          maxLength={5000}
          disabled={isUpdateLoading || isDeleteLoading}
          onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-body")}
          onInput={handleOnInput}
        />
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2">
          <PopoverConfirm onConfirm={() => deleteFragment()}>
            <Button
              appearance="danger"
              outline={true}
              type="button"
              icon={isDeleteLoading && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
              disabled={isDeleteLoading || isUpdateLoading}
              style={{ marginRight: "6px" }}
            >
              {i18next.t("g.delete")}
            </Button>
          </PopoverConfirm>
          <Button
            outline={true}
            type="button"
            disabled={isDeleteLoading || isUpdateLoading}
            onClick={() => onCancel()}
          >
            {i18next.t("g.back")}
          </Button>
        </div>
        <Button
          type="submit"
          disabled={isDeleteLoading || isUpdateLoading}
          icon={isUpdateLoading && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
          iconPlacement="left"
        >
          {i18next.t("g.update")}
        </Button>
      </div>
    </Form>
  );
}
