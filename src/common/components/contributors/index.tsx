import React, { Component } from "react";
import contributors from "../../constants/contributors.json";
import ProfileLink from "../profile-link";
import UserAvatar from "../user-avatar";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import { _t } from "../../i18n";
import { Tsx } from "../../i18n/helper";
import _ from "lodash";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
  addAccount: (data: Account) => void;
}

interface State {
  mounted: boolean;
  contributors: { name: string; contributes: string[] }[];
}

export class Contributors extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      mounted: false,
      contributors: []
    };
  }

  componentDidMount() {
    this.setState({
      mounted: true,
      contributors: _.shuffle(contributors)
    });
  }

  render() {
    const { mounted, contributors } = this.state;
    return mounted ? (
      <div className="contributors">
        <div className="contributors-list">
          <div className="list-header">
            <h1 className="list-title">{_t("contributors.title")}</h1>
            <Tsx k="contributors.description">
              <div className="list-description" />
            </Tsx>
          </div>
          <div className="list-body">
            {contributors.map((c) => {
              const username = c.name;
              return (
                <div className="list-item" key={username}>
                  <div className="item-main">
                    {ProfileLink({
                      ...this.props,
                      username,
                      children: <UserAvatar username={username} size="small" />
                    })}

                    <div className="item-info">
                      {ProfileLink({
                        ...this.props,
                        username,
                        children: <span className="item-name notranslate">{username}</span>
                      })}
                    </div>
                  </div>
                  <div className="item-extra">{c.contributes.join(", ")}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    ) : null;
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global,
    addAccount: p.addAccount
  };

  return <Contributors {...props} />;
};
