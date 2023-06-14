import React, { useEffect, useState } from "react";
import { History } from "history";
import { Global } from "../../store/global/types";
import { Account } from "../../store/accounts/types";
import LinearProgress from "../linear-progress";
import UserAvatar from "../user-avatar";
import ProfileLink from "../profile-link";
import _c from "../../util/fix-class-names";
import { _t } from "../../i18n";
import { syncSvg } from "../../img/svg";
import contributors from "../../constants/contributors.json";
import "./_index.scss";

interface Props {
  global: Global;
  history: History;
  addAccount: (data: Account) => void;
}

export const DiscoverContributors = (props: Props)=> {

    const [list, setList] = useState<{name: string; contributes: string[]; }[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(()=> {
        shuffleContributors(contributors)
    },[])

  const shuffleContributors = (contributors: { name: string; contributes: string[]; }[]) => {
    setLoading(true)
    const shuffledArray = [...contributors];

    for (let i = shuffledArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
    };
    setList(shuffledArray)
    setLoading(false)
    return shuffledArray;
  };

    return (
      <div className={_c(`discover-contributors-list ${loading ? "loading" : ""}`)}>
        <div className="list-header">
          <h1>
            <div className="list-title">{_t("contributors.title")}</div>
          </h1>
          <div 
          className={_c(`list-refresh ${loading ? "disabled" : ""}`)} 
          onClick={()=>shuffleContributors(list)}
          >
            {syncSvg}
          </div>
        </div>
        {loading && <LinearProgress />}

        {list.length > 0 && (
          <div className="list-body">
            {list?.map((c, i) => {
              return (
                <div className="list-item" key={i}>
                  {ProfileLink({
                    ...props,
                    username: c.name,
                    children: (
                      <span>
                        <UserAvatar username={c.name} size="medium" />
                      </span>
                    )
                  })}
                  <div className="user-info">
                    {ProfileLink({
                      ...props,
                      username: c.name,
                      children: <span className="display-name">{c.name}</span>
                    })}
                    {ProfileLink({
                      ...props,
                      username: c.name,
                      children: (
                        <span className="name notranslate">
                          {" "}
                          {"@"}
                          {c.name}
                        </span>
                      )
                    })}
                    <div className="about">{c.contributes.join(", ")}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };
