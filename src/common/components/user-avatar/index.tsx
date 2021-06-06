import React, {Component} from 'react';

import {Global} from "../../store/global/types";

import defaults from '../../constants/defaults.json';

interface Props {
    global: Global;
    username: string,
    size?: string,
    src?: string
}

export class UserAvatar extends Component<Props> {
    render() {
        const {username, size, global, src} = this.props;
        const imgSize = size === 'xLarge' ? 'large' : ((size === 'normal' || size === 'small') ? 'small' : 'medium');
        const cls = `user-avatar ${size}`;
        const imageSrc = src || `${defaults.imageServer}${global?.canUseWebp ? "/webp" : ""}/u/${username}/avatar/${imgSize}`;

        return (
            <span className={cls} style={{backgroundImage: `url(${imageSrc})`}}/>
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        username: p.username,
        size: p.size,
        src: p.src
    }

    return <UserAvatar {...props} />
}
