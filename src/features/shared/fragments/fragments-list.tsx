// LIST
import React, { useEffect, useMemo, useRef, useState } from "react";
import { LinearProgress } from "@/features/shared";
import { FormControl } from "@ui/input";
import { Button } from "@ui/button";
import { postBodySummary } from "@ecency/render-helper";
import { Fragment } from "@/entities";
import { AddFragment } from "@/features/shared/fragments/add-fragment";
import { EditFragment } from "@/features/shared/fragments/edit-fragment";
import i18next from "i18next";
import { useFragmentsQuery } from "@/api/queries/fragments-query";
import useMount from "react-use/lib/useMount";

interface Props {
  onHide: () => void;
  onPick?: (body: string) => void;
}

export function Fragments(props: Props) {
  const innerRef = useRef<HTMLInputElement | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [mode, setMode] = useState<"" | "add" | "edit">("");
  const [editingItem, setEditingItem] = useState<Fragment | undefined>();

  const { data, refetch, isLoading } = useFragmentsQuery();

  const items = useMemo(
    () =>
      data
        .filter((x) => x.title.toLowerCase().indexOf(searchQuery.toLowerCase()) !== -1)
        .sort((a, b) => (new Date(b.created).getTime() > new Date(a.created).getTime() ? 1 : -1)),
    [data, searchQuery]
  );

  useMount(() => {
    refetch();
  });

  useEffect(() => {
    if (!isLoading && data.length > 0) {
      innerRef.current && innerRef.current.focus();
    }
  }, [isLoading, data]);

  const filterChanged = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  if (mode === "add") {
    return <AddFragment onAdd={() => setMode("")} onCancel={() => setMode("")} />;
  }

  if (mode === "edit" && editingItem) {
    return (
      <EditFragment item={editingItem} onUpdate={() => setMode("")} onCancel={() => setMode("")} />
    );
  }

  return (
    <div className="dialog-content">
      {isLoading && <LinearProgress />}
      {!isLoading && data.length === 0 && (
        <div className="fragments-list flex items-center flex-col gap-4">
          <p>{i18next.t("g.empty-list")}</p>
          <p>
            <Button onClick={() => setMode("add")}>{i18next.t("fragments.create-first")}</Button>
          </p>
        </div>
      )}
      {data.length > 0 && (
        <>
          <div className="flex gap-3">
            <FormControl
              ref={innerRef}
              type="text"
              placeholder={i18next.t("fragments.filter")}
              value={searchQuery}
              onChange={filterChanged}
              style={{ marginRight: "6px" }}
            />
            <div>
              <Button className="h-full" onClick={() => setMode("add")}>
                {i18next.t("g.add")}
              </Button>
            </div>
          </div>

          {items.length === 0 && <span className="text-gray-600">{i18next.t("g.no-matches")}</span>}

          {items.length > 0 && (
            <div className="flex flex-col gap-3 my-4">
              {items.map((item) => (
                <div
                  className="flex flex-col border dark:border-dark-400 rounded-3xl overflow-hidden cursor-pointer hover:opacity-75 duration-300"
                  key={item.id}
                  onClick={() => {
                    if (props.onPick) {
                      props.onPick(item.body);
                      return;
                    }

                    setEditingItem(item);
                    setMode("edit");
                  }}
                >
                  <div className="flex items-center gap-3 border-b dark:border-dark-300 px-3 py-2 bg-gray-100 dark:bg-dark-500">
                    {item.title}
                  </div>
                  <div className="text-gray-steel dark:text-white-075 px-3 py-2">
                    {postBodySummary(item.body, 200)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
