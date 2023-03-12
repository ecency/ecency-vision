import React, { Component } from "react";
import { KebabMenu } from "../../img/svg";
import "./index.scss";
import MyDropDown from "../dropdown";
import { _t } from "../../i18n";
import { actionType } from "../manage-authority/types";

interface Props {
  type: string;
  account: any;
}

export class ManageAuthIcon extends Component<Props> {
  dropDown = () => {
    if (this.props.type === actionType.Revoke) {
      let menuItems = [
        {
          label: _t("g.edit")
          // onClick: toggleEdit,
        }
      ];
      <MyDropDown items={menuItems} float="left" />;
      console.log("dropDown clicked", this.props.account, this.props.type);
    }
  };
  render() {
    return (
      <div className="kebab-icon" onClick={this.dropDown}>
        {KebabMenu}
      </div>
    );
  }
}

export default (p: Props) => {
  const props = {
    type: p.type,
    account: p.account
  };

  return <ManageAuthIcon {...props} />;
};
