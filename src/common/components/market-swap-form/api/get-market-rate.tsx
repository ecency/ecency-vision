import { MarketAsset } from "../market-pair";
import { getMarketStatistics, getOrderBook, OrdersDataItem } from "../../../api/hive";
import React, { useEffect, useState } from "react";
import { error } from "../../feedback";

export const getMarketRate = async (asset: MarketAsset): Promise<number> => {
  if (asset === MarketAsset.HIVE) {
    const market = await getMarketStatistics();
    return +market.lowest_ask;
  } else if (asset === MarketAsset.HBD) {
    const market = await getMarketStatistics();
    return 1 / +market.lowest_ask;
  }
  return 0;
};

interface Props {
  asset: MarketAsset;
  amount: string;
  setToAmount: (amount: string) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  setInvalidAmount: (v: boolean) => void;
  setTooMuchSlippage: (v: boolean) => void;
}

export const MarketRateListener = ({
  asset,
  amount,
  setToAmount,
  setLoading,
  setInvalidAmount,
  setTooMuchSlippage
}: Props) => {
  const [hiveOrderBook, setHiveOrderBook] = useState<OrdersDataItem[]>([]);
  const [hbdOrderBook, setHbdOrderBook] = useState<OrdersDataItem[]>([]);

  useEffect(() => {
    fetchHiveOrderBook().then(() => processHiveOrderBook());
  }, []);

  useEffect(() => {
    fetchHiveOrderBook().then(() => processHiveOrderBook());
  }, [asset]);

  useEffect(() => {
    processHiveOrderBook();
  }, [amount]);

  const calculatePrice = (intAmount: number, book: OrdersDataItem[], asset: "hive" | "hbd") => {
    let available = 0;
    let index = 0;
    while (available < intAmount && book.length > index + 1) {
      available += book[index][asset] / 1000;
      index++;
    }
    return +book[index].real_price;
  };

  const processHiveOrderBook = async () => {
    if (hiveOrderBook.length > 0 && hbdOrderBook.length > 0) {
      const intAmount = +amount.replace(/,/gm, "");

      let availableInOrderBook = 0;
      let firstPrice = Infinity;
      let price = 0;
      let toAmount = "";

      if (asset === MarketAsset.HIVE) {
        availableInOrderBook =
          hbdOrderBook.map((item) => item.hive).reduce((acc, item) => acc + item, 0) / 1000;
        price = calculatePrice(intAmount, hbdOrderBook, "hive");
        toAmount = intAmount * price + "";
        firstPrice = +hbdOrderBook[0].real_price;
      } else if (asset === MarketAsset.HBD) {
        availableInOrderBook =
          hiveOrderBook.map((item) => item.hbd).reduce((acc, item) => acc + item, 0) / 1000;
        price = calculatePrice(intAmount, hiveOrderBook, "hbd");
        toAmount = intAmount / price + "";
        firstPrice = +hiveOrderBook[0].real_price;
      }

      if (!availableInOrderBook) return null;

      const slippage = Math.abs(price - firstPrice);
      setTooMuchSlippage(slippage > 0.001);

      if (intAmount > availableInOrderBook) {
        setInvalidAmount(true);
      } else if (toAmount) {
        setToAmount(toAmount);
        setInvalidAmount(false);
      }
    }

    return null;
  };

  const fetchHiveOrderBook = async () => {
    setLoading(true);
    try {
      const book = await getOrderBook();
      setHiveOrderBook(book.bids);
      setHbdOrderBook(book.asks);
    } catch (e) {
      error("Order book is empty.");
    } finally {
      setLoading(false);
    }
    return null;
  };

  return <></>;
};
