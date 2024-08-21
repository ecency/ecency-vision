import "./index.scss";
import { FaqCategoryStateless } from "@/app/(staticPages)/faq/_components/faq-category/faq-category-stateless";
import { FaqCategoryClient } from "@/app/(staticPages)/faq/_components/faq-category/faq-category-client";
import { SSRSafe } from "@/utils/no-ssr";

interface Props {
  categoryTitle: string;
  contentList: string[];
}

export function FaqCategory({ contentList, categoryTitle }: Props) {
  return (
    <SSRSafe
      fallback={
        <FaqCategoryStateless
          categoryTitle={categoryTitle}
          contentList={contentList}
          expanded={false}
        />
      }
    >
      <FaqCategoryClient categoryTitle={categoryTitle} contentList={contentList} />
    </SSRSafe>
  );
}
