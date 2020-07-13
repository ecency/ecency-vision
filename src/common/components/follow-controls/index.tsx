import React, {Component} from "react";

import {Button} from "react-bootstrap";

import {Account} from "../../store/accounts/types";
import {User} from "../../store/users/types";
import {ActiveUser} from "../../store/active-user/types";

import LoginRequired from "../login-required";
import {error} from "../feedback";

import {getFollowing} from "../../api/hive";
import {follow, unFollow, ignore, formatError} from "../../api/operations";

import {_t} from "../../i18n";


interface Props {
    users: User[];
    activeUser: ActiveUser | null;
    targetUsername: string;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data: Account) => void;
    deleteUser: (username: string) => void;
}

interface State {
    fetching: boolean,
    processing: boolean,
    following: boolean,
    muted: boolean
}

export default class FollowControls extends Component<Props, State> {
    state: State = {
        fetching: false,
        processing: false,
        following: false,
        muted: false
    }

    _mounted: boolean = true;

    componentDidMount() {
        this.fetch().then();
    }

    componentWillUnmount() {
        this._mounted = false;
    }

    componentDidUpdate(prevProps: Readonly<Props>) {
        if (
            // active user changed
            (prevProps.activeUser?.username !== this.props.activeUser?.username) ||
            // or target account username changed
            (prevProps.targetUsername !== this.props.targetUsername)
        ) {
            this.fetch().then()
        }
    }

    stateSet = (obj: {}, cb: () => void = () => {
    }) => {
        if (this._mounted) {
            this.setState(obj, cb);
        }
    };

    fetch = async () => {
        this.stateSet({
            fetching: true,
            processing: false,
            following: false,
            muted: false
        })

        const {activeUser} = this.props;

        if (!activeUser) {
            this.stateSet({fetching: false});
            return;
        }

        await this.fetchStatus();

        this.stateSet({fetching: false});
    }

    fetchStatus = async () => {
        const following = await this.isFollowing();

        // No need to check if muted when already following
        const muted = following ? false : await this.isMuted();

        this.stateSet({following, muted});
    };

    isFollowing = async () => {
        const {activeUser, targetUsername} = this.props;
        const {username} = activeUser!;

        let resp;
        try {
            resp = await getFollowing(username, targetUsername, 'blog', 1);
        } catch (err) {
            return false;
        }

        if (resp && resp.length > 0) {
            if (
                resp[0].follower === username &&
                resp[0].following === targetUsername
            ) {
                return true;
            }
        }

        return false;
    };

    isMuted = async () => {
        const {activeUser, targetUsername} = this.props;
        const {username} = activeUser!;

        let resp;
        try {
            resp = await getFollowing(username, targetUsername, 'ignore', 1);
        } catch (err) {
            return false;
        }

        if (resp && resp.length > 0) {
            if (
                resp[0].follower === username &&
                resp[0].following === targetUsername
            ) {
                return true;
            }
        }

        return false;
    };

    follow = async () => {
        const {activeUser, users, targetUsername} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        this.stateSet({processing: true});
        try {
            await follow(user, targetUsername);
            this.stateSet({following: true, muted: false});
        } catch (err) {
            error(formatError(err));
        } finally {
            this.stateSet({processing: false});
        }
    };

    unFollow = async () => {
        const {activeUser, users, targetUsername} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        this.stateSet({processing: true});
        try {
            await unFollow(user, targetUsername);
            this.stateSet({following: false, muted: false});
        } catch (err) {
            error(formatError(err));
        } finally {
            this.stateSet({processing: false});
        }
    };

    mute = async () => {
        const {activeUser, users, targetUsername} = this.props;
        const user = users.find((x) => x.username === activeUser?.username)!;

        this.stateSet({processing: true});
        try {
            await ignore(user, targetUsername);
            this.stateSet({following: false, muted: true});
        } catch (err) {
            error(formatError(err));
        } finally {
            this.stateSet({processing: false});
        }
    };

    render() {
        const {following, muted, fetching, processing} = this.state;

        const followMsg = _t('follow-controls.follow');
        const unFollowMsg = _t('follow-controls.unFollow');
        const muteMsg = _t('follow-controls.mute');
        const unMuteMsg = _t('follow-controls.unMute');

        const btnFollow = (
            <LoginRequired {...this.props}>
                <Button
                    variant="primary"
                    style={{marginRight: '5px'}}
                    disabled={processing}
                    onClick={this.follow}
                >
                    {followMsg}
                </Button>
            </LoginRequired>
        );

        const btnUnfollow = (
            <LoginRequired {...this.props}>
                <Button
                    variant="primary"
                    style={{marginRight: '5px'}}
                    disabled={processing}
                    onClick={this.unFollow}
                >
                    {unFollowMsg}
                </Button>
            </LoginRequired>
        );

        const btnMute = (
            <LoginRequired {...this.props}>
                <Button disabled={processing} onClick={this.mute}>
                    {muteMsg}
                </Button>
            </LoginRequired>
        );

        const btnUnMute = (
            <LoginRequired {...this.props} >
                <Button disabled={processing} onClick={this.unFollow}>
                    {unMuteMsg}
                </Button>
            </LoginRequired>
        );

        if (fetching) {
            return (
                <div>
                    <Button variant="primary" disabled={true} style={{marginRight: '5px'}}>
                        {followMsg}
                    </Button>
                    <Button disabled={true}>{muteMsg}</Button>
                </div>
            );
        }

        if (following) {
            return (
                <div>
                    {btnUnfollow}
                    {btnMute}
                </div>
            );
        }

        if (muted) {
            return (
                <div>
                    {btnFollow}
                    {btnUnMute}
                </div>
            );
        }

        return (
            <div>
                {btnFollow}
                {btnMute}
            </div>
        );
    }
}
