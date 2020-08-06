import React, {Component} from 'react';
import {canUseWebP} from "react-img-webp";

import defaults from '../../constants/defaults.json';
const isBrowserSupportWebP = canUseWebP();

interface Props {
    username: string,
    size: string,
    onClick: (e: React.MouseEvent<HTMLElement>) => void
}

export default class UserAvatar extends Component<Props> {
    public static defaultProps = {
        onClick: () => {
        }
    };

    render() {
        const {username, size, onClick} = this.props;
        const imgSize = size === 'xLarge' ? 'large' : ((size === 'normal' || size === 'small') ? 'small' : 'medium');
        const cls = `user-avatar ${size}`;
        const imageSrc = `${defaults.imageServer}/u/${username}/avatar/${imgSize}`;
        const imageSrcWebp = `${defaults.imageServer}/webp/u/${username}/avatar/${imgSize}`;

        return (
            <span onClick={onClick}
                role="none"
                key="user-avatar-image"
                className={cls}
                style={{
                    backgroundImage: `url(${isBrowserSupportWebP ? imageSrcWebp : imageSrc})`,
                }}
            />
        );
    }
}
