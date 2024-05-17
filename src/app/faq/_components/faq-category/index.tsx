import "./index.scss";
import { FaqCategoryStateless } from "@/app/faq/_components/faq-category/faq-category-stateless";
import { FaqCategoryClient } from "@/app/faq/_components/faq-category/faq-category-client";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

export function FaqCategory({ contentList, categoryTitle }: Props) {
  return typeof window !== "undefined" ? (
    <FaqCategoryClient categoryTitle={categoryTitle} contentList={contentList} />
  ) : (
    <FaqCategoryStateless
      categoryTitle={categoryTitle}
      contentList={contentList}
      expanded={false}
    />
  );
}
