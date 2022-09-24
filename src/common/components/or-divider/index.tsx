import React, {Component} from "react";
import {_t} from "../../i18n";

export default class OrDivider extends Component {
    render() {

        return (
            <>
                <div className="or-divider">{_t("g.or")}</div>
            </>
        );
    }
}
