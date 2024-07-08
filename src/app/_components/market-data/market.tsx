import moment from "moment";
import React, { useEffect, useMemo, useRef } from "react";
import numeral from "numeral";
import ReactHighcharts from "react-highcharts";
import { Theme } from "@/enums";
import { useGlobalStore } from "@/core/global-store";
import { getMarketDataQuery } from "@/api/queries";
import i18next from "i18next";

interface Price {
  time: number;
  price: number;
}

interface Props {
  label: string;
  coin: string;
  vsCurrency: string;
  fromTs: string;
  toTs: string;
  formatter: string;
}

export function Market({ label, formatter, coin, vsCurrency, fromTs, toTs }: Props) {
  const theme = useGlobalStore((s) => s.theme);
  const nodeRef = useRef<HTMLDivElement>(null);

  const { data } = getMarketDataQuery(coin, vsCurrency, fromTs, toTs).useClientQuery();
  const prices = useMemo(
    () => (data?.prices?.map((x: any) => ({ time: x[0], price: x[1] })) as Price[]) ?? [],
    [data]
  );

  let strPrice = "...";
  if (prices.length) {
    const price = prices[prices.length - 1].price;
    strPrice = numeral(price).format(formatter);
  }

  const config: any = {
    title: {
      text: null
    },
    credits: { enabled: false },
    legend: {
      enabled: false
    },
    chart: {
      height: 140,
      zoomType: "x",
      backgroundColor: theme === Theme.night ? "#161d26" : ""
    },
    plotOptions: {
      area: {
        fillColor: theme === Theme.night ? "#2e3d51" : "#f3f7fb",
        lineColor: "#81acef",
        lineWidth: 3
      }
    },
    tooltip: {
      valueDecimals: 2,
      useHTML: true,
      shadow: false,
      formatter: (({ chart }: any) => {
        let date = moment(chart.hoverPoint.options.x).calendar();
        let rate = chart.hoverPoint.options.y;
        return `<div><div>${i18next.t("g.when")}: <b>${date}</b></div><div>${i18next.t(
          "g.price"
        )}:<b>${rate.toFixed(3)}</b></div></div>`;
      }) as any,
      enabled: true
    },
    xAxis: {
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: "transparent",
      labels: {
        enabled: false
      },
      title: {
        text: null
      },
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 0
    },
    yAxis: {
      lineWidth: 0,
      minorGridLineWidth: 0,
      lineColor: "transparent",
      title: {
        text: null
      },
      labels: {
        enabled: false
      },
      minorTickLength: 0,
      tickLength: 0,
      gridLineWidth: 0
    },
    series: [
      {
        name: " ",
        data: prices.map((item) => [item.time, item.price]),
        type: "line",
        enableMouseTracking: true
      }
    ]
  };

  const attachEvents = () => {
    const node = nodeRef.current;
    if (!node) return;

    const graph = node.querySelector(".graph")!;

    node.querySelectorAll(".ct-point").forEach((el) => {
      const left = el.getAttribute("x1");

      const graphBar = document.createElement("span");
      graphBar.setAttribute("class", "graph-bar");
      graphBar.style.left = `${left}px`;

      graphBar.addEventListener("mouseover", pointMouseMove);
      graphBar.addEventListener("mouseout", pointMouseOut);

      graph.appendChild(graphBar);
    });
  };

  const detachEvents = () => {
    const node = nodeRef.current;
    if (!node) return;

    node.querySelectorAll(".graph-bar").forEach((el) => {
      el.removeEventListener("mouseover", pointMouseMove);
      el.removeEventListener("mouseout", pointMouseOut);
    });
  };

  const pointMouseMove = (e: Event) => {
    const node = nodeRef.current;
    if (!node) return;

    const circle = e.currentTarget;
    const circles = node.querySelectorAll(".graph-bar");
    const index = Array.prototype.indexOf.call(circles, circle);
    const item = prices[index];

    const strPrice = numeral(item.price).format(formatter);
    const strDate = moment(item.time).format("YYYY-MM-DD HH:mm:ss");
    const html = `<strong>${strPrice}</strong> ${strDate}`;

    const tooltip = node.querySelector(".tooltip") as HTMLElement;
    tooltip.style.visibility = "visible";
    tooltip!.innerHTML = html;
  };

  const pointMouseOut = () => {
    const node = nodeRef.current;
    if (!node) return;

    const tooltip = node.querySelector(".tooltip") as HTMLElement;
    tooltip.style.visibility = "hidden";
    tooltip!.innerHTML = "";
  };

  useEffect(() => {
    attachEvents();

    return () => {
      detachEvents();
    };
  }, [attachEvents, detachEvents, prices]);

  return (
    <div className="market-graph" ref={nodeRef}>
      <div className="graph">
        <ReactHighcharts config={config} />
      </div>
      <div className="info">
        <div className="price">
          <span className="coin">{label}</span> <span className="value">{strPrice}</span>
        </div>
        <div className="tooltip" />
      </div>
    </div>
  );
}
