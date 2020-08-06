import React, {Component} from 'react';

import {Global} from "../../store/global/types";

import defaults from '../../constants/defaults.json';

interface Props {
    global: Global;
    username: string,
    size: string,
    onClick?: (e: React.MouseEvent<HTMLElement>) => void
}

export class UserAvatar extends Component<Props> {
    public static defaultProps = {
        onClick: () => {
        }
    };

    render() {
        const {username, size, global, onClick} = this.props;
        const imgSize = size === 'xLarge' ? 'large' : ((size === 'normal' || size === 'small') ? 'small' : 'medium');
        const cls = `user-avatar ${size}`;
        const imageSrc = `${defaults.imageServer}${global.canUseWebp ? "/webp" : ""}/u/${username}/avatar/${imgSize}`;

        return (
            <span onClick={onClick}
                  role="none"
                  key="user-avatar-image"
                  className={cls}
                  style={{
                      backgroundImage: `url(${imageSrc})`
                  }}
            />
        );
    }
}

export default (p: Props) => {
    const props = {
        global: p.global,
        username: p.username,
        size: p.size,
        onClick: p.onClick
    }

    return <UserAvatar {...props} />
}
