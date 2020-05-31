import React, { Component } from "react";

import { History } from "history";

import isEqual from "react-fast-compare";

import numeral from "numeral";

import { Button } from "react-bootstrap";

import { State as GlobalState } from "../../store/global/types";
import { Community } from "../../store/communities/types";

import AccountLink from "../account-link";
import DownloadTrigger from "../download-trigger";

import ln2list from "../../util/nl2list";

import { accountGroupSvg } from "../../img/svg";

interface Props {
  history: History;
  global: GlobalState;
  community: Community;
}

export default class CommunityCard extends Component<Props> {
  shouldComponentUpdate(nextProps: Readonly<Props>): boolean {
    return !isEqual(this.props.community, nextProps.community);
  }

  render() {
    const { community } = this.props;

    const subscribers = numeral(community.subscribers).format();
    const rewards = numeral(community.sum_pending).format();
    const authors = numeral(community.num_authors).format();

    return (
      <div className="community-card">
        <h2 className="community-title">
          {accountGroupSvg} {community.title}
        </h2>
        <div className="community-panel">
          <div className="section-about">{community.about}</div>
          <div className="section-stats">
            <div className="stat">{subscribers} subscribers</div>
            <div className="stat">{`$${rewards}`} pending rewards</div>
            <div className="stat">{authors} active posters</div>
          </div>
          <div className="section-controls">
            <DownloadTrigger>
              <Button variant="primary" block={true}>
                Subscribe
              </Button>
            </DownloadTrigger>
            <DownloadTrigger>
              <Button variant="primary" block={true}>
                New Post
              </Button>
            </DownloadTrigger>
          </div>
          <div className="section-team">
            <h4 className="section-header">Leadership</h4>
            {community.team.map((m, i) => {
              if (m[0].startsWith("hive-")) {
                return null;
              }
              return (
                <div className="team-member" key={i}>
                  <AccountLink {...this.props} username={m[0]}>
                    <a className="username">{`@${m[0]}`}</a>
                  </AccountLink>
                  <span className="role">{m[1]}</span>
                  {m[2] !== "" && <span className="extra">{m[2]}</span>}
                </div>
              );
            })}
          </div>
        </div>
        <div className="community-panel">
          <div className="section-description">
            <h4 className="section-header">Description</h4>
            {ln2list(community.description).map((x, i) => (
              <p key={i}>{x}</p>
            ))}
          </div>
          <div className="section-rules">
            <h4 className="section-header">Rules</h4>
            <ol>
              {ln2list(community.flag_text).map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ol>
          </div>
          <div className="section-lang">
            <h4 className="section-header">Language</h4>
            {community.lang}
          </div>
        </div>
      </div>
    );
  }
}
