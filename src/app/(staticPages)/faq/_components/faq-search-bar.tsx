"use client";

import { FormControl, InputGroup } from "@ui/input";
import { Button } from "@ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { success } from "@/features/shared";
import i18next from "i18next";
import { clipboard } from "@/utils/clipboard";
import { useGlobalStore } from "@/core/global-store";
import { copyContent } from "@ui/svg";

export function FaqSearchBar() {
  const params = useSearchParams();
  const router = useRouter();

  const lang = useGlobalStore((state) => state.lang);
  const search = useMemo(() => params.get("q") ?? "", [params]);

  const copyToClipboard = useCallback((text: string) => {
    success(i18next.t("static.faq.search-link-copied"));
    clipboard(text);
  }, []);

  return (
    <>
      <InputGroup
        append={
          <Button
            size="sm"
            className="copy-to-clipboard"
            disabled={search.length === 0}
            onClick={() => {
              copyToClipboard(`https://ecency.com/faq?q=${search}&lang=${lang.split("-")[0]}`);
            }}
            icon={copyContent}
          />
        }
        className="mb-3 w-[75%]"
      >
        <FormControl
          type="text"
          placeholder={`${i18next.t("static.faq.search-placeholder")}`}
          className="w-[75%]"
          onChange={(e) => router.push(`?q=${e.target.value}`)}
          value={search}
          autoFocus={true}
        />
      </InputGroup>
    </>
  );
}
