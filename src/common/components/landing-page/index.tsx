import React, { useEffect, useState } from "react";
import { Link, Redirect } from "react-router-dom";
import { getCommunity } from "../../api/bridge";
import defaults from "../../constants/defaults.json";
import { _t } from "../../i18n";
import { Spinner } from "react-bootstrap";

const LandingPage = (props: any) => {
  const { global, activeUser } = props;
  const [community, setCommunity] = useState("");
  const [time, setTime] = useState(6);

  useEffect(() => {
    const updateTimer = setInterval(() => {
      setTime((prev) => prev - 1);
    }, 1000);

    getCommunity(global.hive_id).then((community) => {
      if (community) {
        setCommunity(community.title);
      }
    });

    return () => clearInterval(updateTimer);
  }, []);

  return activeUser || (community && time <= 0) ? (
    <Redirect to={`/trending/${global.hive_id}`} />
  ) : (
    <div
      className={global.isElectron ? "landing-wrapper pt-5" : "landing-wrapper"}
      id="landing-wrapper"
    >
      <div className="top-bg" />
      <div className="sections first-section">
        <div className="text-container text-center">
          <img
            src={`${defaults.imageServer}/u/${global.hive_id}/avatar/lardge`}
            style={{ marginBottom: "2rem" }}
            alt="Logo"
          />
          <h1>Welcome to {community}</h1>
          <div className="d-flex flex-wrap justify-content-center align-items-center">
            <p className="mb-5 w-88">{_t("landing-page.what-is-ecency")}</p>
          </div>
          <Link to={`/trending/${global.hive_id}`}>
            <button className="get-started mx-auto">
              Go to site{" "}
              <div className="loader">
                <Spinner animation="border" />
                <div className="center-text">{time}</div>
              </div>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
