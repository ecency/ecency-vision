import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCommunity } from "../../api/bridge";
import defaults from "../../constants/defaults.json";
import { _t } from "../../i18n";

const LandingPage = (props: any) => {
  const { global } = props;
  const [community, setCommunity] = useState("");

  useEffect(() => {
    getCommunity(global.hive_id).then((community) => {
      if (community) {
        setCommunity(community.title);
      }
    });
  }, []);

  return (
    <div
      className={global.isElectron ? "landing-wrapper pt-5" : "landing-wrapper"}
      id="landing-wrapper"
    >
      <div className="top-bg" />
      <div className="tob-bg-algae" />
      <div className="sections first-section">
        <div className="text-container text-center">
          <img
            src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
            className="logo"
            alt="Logo"
          />
          <h1>Welcome to {community}</h1>
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <p className="mb-3 w-88">{_t("landing-page.what-is-ecency")}</p>
          </div>
          <Link to={`/trending/${global.hive_id}`}>
            <button className="get-started mx-auto">Go to site</button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
