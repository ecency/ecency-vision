import React from "react";

import {_t} from "./index";

interface Props {
    k: string,
    args: {},
    children: JSX.Element
}

export class Tsx extends React.Component<Props> {
    render() {
        const {k, args} = this.props;
        const {children} = this.props;
        return React.cloneElement(children, {dangerouslySetInnerHTML: {__html: _t(k, args)}});
    }
}
