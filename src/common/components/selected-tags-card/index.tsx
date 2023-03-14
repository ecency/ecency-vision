import React, { Component } from "react";
import { Link } from "react-router-dom";
import { History } from "history";
import { Global } from "../../store/global/types";
import { makePath } from "../tag";
import _c from "../../util/fix-class-names";
import { _t } from "../../i18n";
import {
  paletteOutlineSvg,
  virusOutline,
  voteOutline,
  gamepadSquareOutline,
  financeSvg,
  accountTieSvg,
  cameraSvg,
  codeTags,
  televisionSvg,
  bullHornSvg,
  basketballSvg,
  reactSvg,
  spaSvg,
  walletTravelSvg
} from "../../img/svg";
import "./_index.scss";

interface Props {
  history: History;
  global: Global;
}

const tags = [
  {
    label: "Art & Design",
    tag: "hive-174301",
    icon: paletteOutlineSvg
  },
  {
    label: "Coronavirus",
    tag: "covid-19",
    icon: virusOutline
  },
  {
    label: "Election",
    tag: "election",
    icon: voteOutline
  },
  {
    label: "Gaming",
    tag: "hive-140217",
    icon: gamepadSquareOutline
  },
  {
    label: "Finance",
    tag: "finance",
    icon: financeSvg
  },
  {
    label: "Politics",
    tag: "hive-160545",
    icon: accountTieSvg
  },
  {
    label: "Photography",
    tag: "hive-194913",
    icon: cameraSvg
  },
  {
    label: "Programming",
    tag: "hive-169321",
    icon: codeTags
  },
  {
    label: "Movies & TV",
    tag: "hive-166847",
    icon: televisionSvg
  },
  {
    label: "Marketing",
    tag: "marketing",
    icon: bullHornSvg
  },
  {
    label: "Sport & Fitness",
    tag: "hive-176853",
    icon: basketballSvg
  },
  {
    label: "Science",
    tag: "science",
    icon: reactSvg
  },
  {
    label: "Spirituality",
    tag: "hive-183196",
    icon: spaSvg
  },
  {
    label: "Travel",
    tag: "hive-163772",
    icon: walletTravelSvg
  }
];

export class SelectedTagsCard extends Component<Props> {
  render() {
    const { global } = this.props;

    return (
      <div className="selected-tags-card">
        <h2 className="list-header">{_t("selected-tags.title")}</h2>
        {tags.map((t) => {
          const cls = _c(`tag-list-item ${global.tag === t.tag ? "selected-item" : ""}`);
          return (
            <Link key={t.tag} to={makePath(global.filter, t.tag)} className={cls}>
              <span>
                {t.icon && t.icon}
                {t.label}
              </span>
            </Link>
          );
        })}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    history: p.history,
    global: p.global
  };

  return <SelectedTagsCard {...props} />;
};
