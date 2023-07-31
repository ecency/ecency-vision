import React, {
  ButtonHTMLAttributes,
  DetailedHTMLProps,
  ReactNode,
  useEffect,
  useState
} from "react";
import { isMobile } from "../../util/is-mobile";
import { classNameObject } from "../../helper/class-name-object";
import { arrowLeftSvg, arrowRightSvg } from "../../img/svg";
import "./index.css";
import { _t } from "../../i18n";

function PageButton(
  props: Omit<DetailedHTMLProps<ButtonHTMLAttributes<HTMLButtonElement>, any>, "className"> & {
    active?: boolean;
    children: ReactNode;
  }
) {
  return (
    <button
      {...props}
      className={classNameObject({
        "pagination border-r border-t border-b first:border-l first:rounded-l-xl last:rounded-r-xl last:border-l-0 disabled:hover:bg-white p-2.5 disabled:text-gray-600":
          true,
        "text-blue-dark-sky bg-white hover:bg-gray-100 dark:hover:bg-gray-800": !props.active,
        "border-blue-dark-sky bg-blue-dark-sky text-white": props.active
      })}
    >
      {props.children}
    </button>
  );
}

interface Props {
  dataLength: number;
  pageSize: number;
  maxItems: number;
  page?: number;
  onPageChange: (num: number) => void;
  className?: string;
  showLastNo?: boolean;
}

const MyPagination = ({
  dataLength,
  maxItems,
  onPageChange,
  pageSize,
  className,
  page: pageFromProps,
  showLastNo = true
}: Props) => {
  const [page, setPage] = useState<number>(pageFromProps || 1);

  const changePage = (num: number) => {
    setPage(num);
    onPageChange(num);
  };

  useEffect(() => {
    if (pageFromProps) {
      setPage(pageFromProps);
    }
  }, [pageFromProps]);

  const pages = Math.ceil(dataLength / pageSize);

  const records = [...Array(pages).keys()];
  let responsiveMaxItems = isMobile() ? 3 : 4;

  let sliceStart = page - responsiveMaxItems / 2;
  if (sliceStart < 0) sliceStart = 0;
  let sliceEnd = sliceStart + responsiveMaxItems;

  const allItems = records.map((i, x) => {
    const num = i + 1;
    return (
      <PageButton active={page === num} onClick={() => changePage(num)} key={num}>
        {num}
      </PageButton>
    );
  });

  const items = allItems.slice(sliceStart, sliceEnd);

  return (
    <div className={className}>
      <PageButton disabled={!(sliceStart > 0)} onClick={() => changePage(1)}>
        {_t("g.first")}
      </PageButton>
      <PageButton disabled={!(page > 1)} onClick={() => changePage(page - 1)}>
        {arrowLeftSvg}
      </PageButton>
      {items}
      <PageButton disabled={page >= pages} onClick={() => changePage(page + 1)}>
        {arrowRightSvg}
      </PageButton>
      {showLastNo && (
        <PageButton disabled={page >= pages} onClick={() => changePage(pages)}>
          {_t("g.last")}
        </PageButton>
      )}
    </div>
  );
};

export default MyPagination;
