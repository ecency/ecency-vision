import React from "react";

export const AdvancedModeToolbar = () => {
  return (
    <div className="advanced-mode-toolbar d-flex border-bottom border-top px-3 py-2">
      <div className="trading-pair pr-3 py-2">
        <b>HBD/HIVE</b>
      </div>
      <div className="pair-info d-flex border-left px-3">
        <div className="price">
          <div className="amount text-success">21.234</div>
          <div className="usd-value">$10</div>
        </div>
        <div className="day-change-price change-price px-3">
          <label>24h change</label>
          <div>8.123 +24%</div>
        </div>
        <div className="day-high-price change-price px-3">
          <label>24h high</label>
          <div>123.23</div>
        </div>
        <div className="day-low-price change-price px-3">
          <label>24h low</label>
          <div>123.23</div>
        </div>
        <div className="day-1-total change-price px-3">
          <label>24h volume(HBD)</label>
          <div>123.23</div>
        </div>
        <div className="day-2-total change-price px-3">
          <label>24h volume(HIVE)</label>
          <div>123.23</div>
        </div>
      </div>
    </div>
  );
};
