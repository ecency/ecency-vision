import i18next from "i18next";

interface Props {
  categoryTitle: string;
  contentList: string[];
  expanded?: boolean;
  setExpanded?: (expanded: boolean) => void;
}

export function FaqCategoryStateless({ contentList, categoryTitle, expanded, setExpanded }: Props) {
  return (
    <div className="faq-container section-container">
      <div
        className="section flex flex-col border-b border-[--border-color]"
        onClick={() => setExpanded?.(!expanded)}
      >
        <div className="flex justify-between items-center section-card relative">
          <div className="flex items-center">
            <div className="flex items-center ml-3">
              <div className="section-title ml-1">{categoryTitle}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="p-0">
        <div className="section-body">
          {contentList.map((x) => (
            <a key={x} className="section-content" href={`#${x}`}>
              {i18next.t(`static.faq.${x}-header`)}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
