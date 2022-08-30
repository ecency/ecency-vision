import { isEqual } from "lodash";
import moment from "moment";
import React from "react";
import ReactHighcharts from "react-highcharts";
import { getMarketData } from "../../api/misc";
import BaseComponent from "../base";

import numeral from "numeral";
import { _t } from "../../i18n";
import { Theme } from "../../store/global/types";

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
  theme: Theme;
}

interface State {
  prices: Price[];
}

class Market extends BaseComponent<Props, State> {
  state: State = {
    prices: []
  };

  node = React.createRef<HTMLDivElement>();

  componentDidMount() {
    const { coin, vsCurrency, fromTs, toTs } = this.props;
    this._mounted = true;

    getMarketData(coin, vsCurrency, fromTs, toTs)
      .then((r) => {
        if (r && r.prices && this._mounted) {
          const prices: Price[] = r.prices.map((x: any) => ({ time: x[0], price: x[1] }));
          this.stateSet({ prices }, () => {
            this.attachEvents();
          });
        }
      })
      .catch((err) => console.log("market_data_error", err));
  }

  componentWillUnmount() {
    this._mounted = false;

    this.detachEvents();
  }

  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    return !isEqual(this.state, nextState);
  }

  attachEvents = () => {
    const node = this.node.current;
    if (!node) return;

    const graph = node.querySelector(".graph")!;

    node.querySelectorAll(".ct-point").forEach((el) => {
      const left = el.getAttribute("x1");

      const graphBar = document.createElement("span");
      graphBar.setAttribute("class", "graph-bar");
      graphBar.style.left = `${left}px`;

      graphBar.addEventListener("mouseover", this.pointMouseMove);
      graphBar.addEventListener("mouseout", this.pointMouseOut);

      graph.appendChild(graphBar);
    });
  };

  detachEvents = () => {
    const node = this.node.current;
    if (!node) return;

    node.querySelectorAll(".graph-bar").forEach((el) => {
      el.removeEventListener("mouseover", this.pointMouseMove);
      el.removeEventListener("mouseout", this.pointMouseOut);
    });
  };

  pointMouseMove = (e: Event) => {
    const node = this.node.current;
    if (!node) return;

    const { formatter } = this.props;

    const circle = e.currentTarget;
    const circles = node.querySelectorAll(".graph-bar");
    const index = Array.prototype.indexOf.call(circles, circle);
    const item = this.state.prices[index];

    const strPrice = numeral(item.price).format(formatter);
    const strDate = moment(item.time).format("YYYY-MM-DD HH:mm:ss");
    const html = `<strong>${strPrice}</strong> ${strDate}`;

    const tooltip = node.querySelector(".tooltip") as HTMLElement;
    tooltip.style.visibility = "visible";
    tooltip!.innerHTML = html;
  };

  pointMouseOut = () => {
    const node = this.node.current;
    if (!node) return;

    const tooltip = node.querySelector(".tooltip") as HTMLElement;
    tooltip.style.visibility = "hidden";
    tooltip!.innerHTML = "";
  };

  componentDidUpdate(prevProps: Props) {
    if (prevProps.theme !== this.props.theme) {
      this.forceUpdate();
    }
  }

  render() {
    const { label, formatter, theme } = this.props;
    const { prices } = this.state;
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
          return `<div><div>${_t("g.when")}: <b>${date}</b></div><div>${_t(
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

    return (
      <div className="market-graph" ref={this.node}>
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
}

export default Market;
