import moment from 'moment';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getAccount } from '../../api/hive';
import accountReputation from '../../helper/account-reputation';
import { closeSvg } from '../../img/svg';
import { Account } from '../../store/accounts/types';
import { ActiveUser } from '../../store/active-user/types';
import { Global } from '../../store/global/types';
import { ToggleType, UI } from '../../store/ui/types';
import { User } from '../../store/users/types';
import { FavoriteBtn } from '../favorite-btn';
import FollowControls from '../follow-controls';
import { Skeleton } from '../skeleton';

interface Props {
    username: string;
    global: Global;
    users: User[];
    activeUser: ActiveUser | null;
    ui: UI;
    setActiveUser: (username: string | null) => void;
    updateActiveUser: (data?: Account) => void;
    deleteUser: (username: string) => void;
    toggleUIProp: (what: ToggleType) => void;
    onClose: () => void;
    top: boolean;
}

export const ProfilePreview = ({username, global, onClose, top, ...props}:Props) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        setLoading(true)
    },[])

    useEffect(()=>{
        setLoading(true)
        getAccount(username).then(profile=>{setProfile(profile);setLoading(false)}).catch(err=>setLoading(false))
    },[username])

    const noImage = global.isElectron ? "./img/noimage.svg" : require("../../img/noimage.svg");
    const coverFallbackDay = global.isElectron ? "./img/cover-fallback-day.png" : require("../../img/cover-fallback-day.png");
    const coverFallbackNight = global.isElectron ? "./img/cover-fallback-night.png" : require("../../img/cover-fallback-night.png");
    const reputation = profile && accountReputation(profile.reputation)

return <div className="profile-parent">
                <div 
                    className={`position-absolute shadow border bg-white profile-container-${top?"top":"bottom"} rounded ${global.theme === "day" ? "" : "border-dark"}`}
                >
                <div className="close-icon rounded" onClick={onClose}>
                    {closeSvg}
                </div>
                <>
                {loading ? <Skeleton className="cover-img-placeholder rounded-top"/> : profile && <img 
                    src={profile.profile.cover_image ? `https://images.ecency.com/webp/u/${username}/cover` :  global.theme === "day" ? coverFallbackDay : coverFallbackNight}
                    className="w-100 cover-img rounded-top"
                    loading="lazy"
                />}
                <div className="p-3">
                    <div className="d-flex align-items-center info-container flex-column text-center">
                        <div className={`rounded-circle mb-3 profile-img-container ${profile && profile.profile.profile_image ? "" : "no-image"}`}>
                            {loading ? <Skeleton className="profile-img rounded-circle" /> : profile && <img src={profile.profile.profile_image ? `https://images.ecency.com/u/${username}/avatar/medium` : noImage} alt="profile-image" className="profile-img rounded-circle" loading="lazy"/>}
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <Link to={profile && `/@${username}`} onClick={onClose}>
                                <div >{loading ? <Skeleton className="loading-md" /> : profile && profile.profile.name}</div>
                                <div>{loading ? <Skeleton className="loading-md my-3" /> : `@${username}`}</div>
                                <div>{loading ? <Skeleton className="loading-md" /> : `Reputation: ${reputation}`}</div>
                            </Link>
                            <div className="d-flex mt-3">
                                <>
                                    <FollowControls {...props} targetUsername={username}/>
                                    {global.usePrivate && <FavoriteBtn {...props} targetUsername={username}/>}
                                </>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex justify-content-between flex-wrap">
                        <div className="flex-grow-1 d-flex border-bottom">
                            <div className="p-3 flex-grow-1">
                                <b>Joined</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && moment(profile.created, "YYYY-MM-DD").fromNow()}</div>
                            </div>

                            <div className="p-3 flex-grow-1 ">
                                <b>Location</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.profile.location || "---"}</div>
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex border-bottom">
                            <div className="p-3 flex-grow-1">
                                <b>Posts</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && <Link to={`/@${username}/posts`} onClick={onClose}>{profile.post_count}</Link>}</div>
                            </div>

                            <div className="p-3 flex-grow-1">
                                <b>Voting power</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.voting_power/100}</div>
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex border-bottom">
                            <div className="p-3 flex-grow-1">
                                <b>HBD</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && <Link to={`/@${username}/wallet`} onClick={onClose}>{profile.reward_hbd_balance}</Link>}</div>
                            </div>
                            
                            <div className="p-3 flex-grow-1">
                                <b>Balance</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && <Link to={`/@${username}/wallet`} onClick={onClose}>{profile.balance}</Link>}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <b>About</b>
                        <div className="limited-about-text">{loading ? <Skeleton className="loading-md" /> : profile && profile.profile.about ? profile.profile.about.length > 55 ? <Link to={`/@${username}`} onClick={onClose}>{profile.profile.about}</Link>: profile.profile.about : "---"}</div>
                    </div>
                </div>
                </>
                
                </div>
            </div>
    }