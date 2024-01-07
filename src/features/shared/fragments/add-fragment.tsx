// ADD
import React, { useRef, useState } from "react";
import { Form } from "@ui/form";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { Spinner } from "@ui/spinner";
import i18next from "i18next";
import { handleInvalid, handleOnInput } from "@/utils/input-util";
import { useAddFragment } from "@/api/mutations";

interface Props {
  onAdd: () => void;
  onCancel: () => void;
}

export function AddFragment({ onAdd, onCancel }: Props) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const form = useRef<HTMLFormElement>(null);
  const { mutateAsync: addFragment, isPending } = useAddFragment(() => onAdd());

  return (
    <div className="">
      <Form
        ref={form}
        onSubmit={(e: React.FormEvent) => {
          e.preventDefault();
          e.stopPropagation();

          if (!form.current?.checkValidity()) {
            return;
          }
          addFragment({ title, body });
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
            autoFocus={true}
            onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-title")}
            onInput={handleOnInput}
          />
        </div>
        <div className="mb-4">
          <label>{i18next.t("fragments.form-body")}</label>
          <FormControl
            onInvalid={(e: any) => handleInvalid(e, "fragments.", "validation-value")}
            onInput={handleOnInput}
            type="textarea"
            style={{ height: "300px" }}
            value={body}
            onChange={(e: any) => setBody(e.target.value)}
            required={true}
            maxLength={5000}
          />
        </div>
        <div className="flex justify-between">
          <Button outline={true} disabled={isPending} onClick={onCancel}>
            {i18next.t("g.back")}
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            icon={isPending && <Spinner className="mr-[6px] w-3.5 h-3.5" />}
            iconPlacement="left"
          >
            {}
            {i18next.t("g.add")}
          </Button>
        </div>
      </Form>
    </div>
  );
}
