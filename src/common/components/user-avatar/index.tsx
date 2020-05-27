import React, {Component} from 'react';

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

        return (
            <span onClick={onClick}
                  role="none"
                  key="user-avatar-image"
                  className={cls}
                  style={{
                      backgroundImage: `url('https://images.esteem.app/u/${username}/avatar/${imgSize}')`
                  }}
            />
        );
    }
}
