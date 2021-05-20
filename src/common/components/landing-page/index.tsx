import React from "react";

import { scrollDown } from "../../img/svg";

const EarnMoney = require("../../img/illustration_earn_money.jpg");
const WhaleCatchsFish = require("../../img/illustration_true_ownership.png");
const Decentralization = require("../../img/illustration_decentralization.png");
const MechanicFish = require("../../img/illustration_open_source.png");

const LandingPage = (props: any) => {
//   console.log("props", props);
  return (
    <div className="landing-wrapper">
      <div className="top-bg" />
      <div className="sections first-section">
        <h1>Welcome to Ecency!</h1>
        <div>
          <p>Blockchain-based social network</p>
          <p>powered by Hive</p>
        </div>
        <button
          className="get-started"
          onClick={() => props.changeState({ step: 2 })}
        >
          Get started
        </button>
        <button className="scroll-down">{scrollDown}</button>
      </div>
      <div className="sections second-section">
        <div className="part-top">
          <div className="inner">
            <img src={EarnMoney} alt="earn-money" />
            <div className="text-group visible">
              <h2>Earn money</h2>
              <p>
                Blockchain-based social network,{" "}
                <span>
                  <a href="#">join us</a>
                </span>{" "}
                and earn various digital tokens, reward others and build a
                rewarding community.
              </p>
              <a className="link-read-more" href="#">
                Read more
              </a>
            </div>
          </div>
        </div>
        <img
          className="landing-floating-image"
          src={WhaleCatchsFish}
          alt="whale"
        />

        <div className="part-bottom">
          <div className="inner">
            <div className="text-group">
              <h2>True ownership</h2>
              <p>
                Ecency is the next generation social network for Web 3.0.
                Blockchain technology gives you a real free speech experience,
                without any censorship or banning. Only you control your own
                account, content, communities.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="sections third-section">
        <div className="part-top">
          <div className="inner">
            <img
              className="decentralization-img"
              src={Decentralization}
              alt="decentralization"
            />
            <div className="text-group visible">
              <h2>Decentralization</h2>
              <p>
                <span>
                  <a href="#">Hive blockchain</a>
                </span>{" "}
                has many social and gaming apps that you can access with a
                single account you own. Access your social network account and
                content from any other 3rd party apps.
              </p>
            </div>
          </div>
        </div>
        <img
          className="landing-floating-image mechanic"
          src={MechanicFish}
          alt="mechanic"
        />
        <div className="part-bottom">
          <div className="inner">
            <div className="text-group">
              <h2>Open source</h2>
              <p>
                Join and be part of the building team on Web 3.0. Everything
                that we build is blockchain-based and open source. We welcome
                tech talents, developers, creators, entrepreneurs{" "}
                <span>
                  <a className="no-break" href="#">
                    feel free to join us!
                  </a>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="sections fourth-section">
        <div className="part-top">
            <div className="inner">asdasda</div>
        </div>
        <div className="part-bottom">
            <div className="inner">
                asdasdasdasdasda
            </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
