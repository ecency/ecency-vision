import React, {Component} from 'react';

interface Props {
    user: string,
    size: string,
    onClick?: () => void
}

export default class UserAvatar extends Component<Props> {
    public static defaultProps = {
        onClick: () => {
        }
    };

    render() {
        const {user, size, onClick} = this.props;
        const imgSize = size === 'xLarge' ? 'large' : 'medium';
        const cls = `user-avatar ${size}`;

        return (
            <span onClick={onClick}
                  role="none"
                  key="user-avatar-image"
                  className={cls}
                  style={{
                      backgroundImage: `url('https://images.esteem.app/u/${user}/avatar/${imgSize}')`
                  }}
            />
        );
    }
}
