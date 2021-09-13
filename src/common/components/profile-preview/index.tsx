import moment from 'moment';
import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAccount } from '../../api/hive';
import { Global } from '../../store/global/types';
import { Skeleton } from '../skeleton';

interface Props {
    username: string;
    global: Global;
}

export const ProfilePreview = ({username, global}:Props) => {
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
    
    return <div className="profile-parent">
                <div 
                    className={`position-absolute shadow border bg-white profile-container rounded ${global.theme === "day" ? "" : "border-dark"}`}
                    >
                <>
                {loading ? <Skeleton className="cover-img-placeholder rounded-top"/> : profile && <img 
                    src={profile.profile.cover_image || global.theme === "day" ? coverFallbackDay : coverFallbackNight}
                    className="w-100 cover-img rounded-top"
                    loading="lazy"
                />}
                <div className="p-3">
                    <div className="d-flex align-items-center info-container flex-column text-center">
                        <div className={`rounded-circle mb-3 profile-img-container ${profile && profile.profile.profile_image ? "" : "no-image"}`}>
                            {loading ? <Skeleton className="profile-img rounded-circle" /> : profile && <img src={profile.profile.profile_image ? `https://images.ecency.com/u/${username}/avatar/medium` : noImage} alt="profile-image" className="profile-img rounded-circle" loading="lazy"/>}
                        </div>
                        <div className="d-flex flex-column align-items-center">
                            <Link to={profile && `/@${username}`}>
                                <div >{loading ? <Skeleton className="loading-md mb-3" /> : profile && profile.profile.name}</div>
                                <div>{loading ? <Skeleton className="loading-md" /> : `@${username}`}</div>
                            </Link>
                            <div className="d-flex mt-3">
                                <Button variant="outline-primary" className="mr-2" size="sm" disabled={loading}>Follow</Button>
                                <Button variant="outline-danger" size="sm" disabled={loading}>Mute</Button>
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
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.post_count}</div>
                            </div>
                            
                            <div className="p-3 flex-grow-1">
                                <b>Balance</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.balance}</div>
                            </div>
                        </div>

                        <div className="flex-grow-1 d-flex border-bottom">
                            <div className="p-3 flex-grow-1">
                                <b>HBD</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.reward_hbd_balance}</div>
                            </div>

                            <div className="p-3 flex-grow-1">
                                <b>Voting power</b>
                                <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.voting_power}</div>
                            </div>
                        </div>
                    </div>
                    <div className="p-3">
                        <b>About</b>
                        <div>{loading ? <Skeleton className="loading-md" /> : profile && profile.profile.about}</div>
                    </div>
                </div>
                </>
                
                </div>
            </div>
    }