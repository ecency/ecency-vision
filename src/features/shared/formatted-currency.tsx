import { useGlobalStore } from "@/core/global-store";
import { formattedNumber } from "@/utils";

interface Props {
  value: number;
  fixAt?: number;
}
export function FormattedCurrency({ value, fixAt = 2 }: Props) {
  const currencyRate = useGlobalStore((state) => state.currencyRate);
  const currencySymbol = useGlobalStore((state) => state.currencySymbol);

  return (
    <>{formattedNumber(value * currencyRate, { fractionDigits: fixAt, prefix: currencySymbol })}</>
  );
}
