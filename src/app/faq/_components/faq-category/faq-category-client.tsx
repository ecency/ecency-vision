"use client";

import { useState } from "react";
import { FaqCategoryStateless } from "@/app/faq/_components/faq-category/faq-category-stateless";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

export function FaqCategoryClient({ contentList, categoryTitle }: Props) {
  const [expanded, setExpanded] = useState(false);

  return (
    <FaqCategoryStateless
      categoryTitle={categoryTitle}
      contentList={contentList}
      expanded={expanded}
      setExpanded={setExpanded}
    />
  );
}
