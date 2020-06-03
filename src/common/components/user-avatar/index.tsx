import React, {Component} from 'react';

import defaults from '../../constants/defaults.json';

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
        const imgSize = size === 'xLarge' ? 'large' : 'medium';
        const cls = `user-avatar ${size}`;
        const imageSrc = `${defaults.imageServer}/u/${username}/avatar/${imgSize}`;

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
