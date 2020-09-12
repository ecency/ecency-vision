import React, {Component} from "react";

import {History} from "history";

import {Button} from "react-bootstrap";

import {Community} from "../../store/communities/types";

import {_t} from "../../i18n";

interface Props {
    history: History;
    community: Community;
}

export class CommunityPostBtn extends Component<Props> {
    clicked = () => {
        const {community, history} = this.props;
        history.push(`/submit?com=${community.name}`);
    }

    render() {
        return <Button onClick={this.clicked}>{_t("community.post")}</Button>
    }
}

export default (p: Props) => {
    const props: Props = {
        history: p.history,
        community: p.community
    }

    return <CommunityPostBtn {...props} />
}
