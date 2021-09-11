import React from 'react';
import { useState } from 'react';
import { useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAccount } from '../../api/hive';

interface Props {
    username: string;
}

export const ProfilePreview = ({username}:Props) => {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(()=>{
        setLoading(true)
        getAccount(username).then(profile=>{setProfile(profile);setLoading(false)}).catch(err=>setLoading(false))
    },[username])
    
    debugger
    return <div className="position-relative shadow border bg-white rounded">
        {loading ? "Loading" : profile && 
        <><img src={profile.profile.cover_image} className="w-100 cover-img" loading="lazy"/>
        <div className="p-3">
            <div className="d-flex align-items-center">
                <img src={profile.profile.profile_image} alt="profile-image" className="rounded-circle profile-img mr-3" loading="lazy"/>
                <div>
                    <Link to={profile.profile.website}>
                        <div>{profile.profile.name}</div>
                        <div>@{username}</div>
                    </Link>
                    <div className="d-flex mt-3">
                        <Button variant="outline-primary" className="mr-2" size="sm">Follow</Button>
                        <Button variant="outline-danger" size="sm">Mute</Button>
                    </div>
                </div>
            </div>
            <div className="d-flex justify-content-between">
                <div className="p-3">
                    <div>Joined</div>
                    <div>{profile.created}</div>
                </div>

                <div className="p-3">
                    <div>Location</div>
                    <div>{profile.profile.location}</div>
                </div>

                <div className="p-3">
                    <div>Posts</div>
                    <div>{profile.post_count}</div>
                </div>
                
                <div className="p-3">
                    <div>Balance</div>
                    <div>{profile.balance}</div>
                </div>

                <div className="p-3">
                    <div>HBD</div>
                    <div>{profile.reward_hbd_balance}</div>
                </div>

                <div className="p-3">
                    <div>Voting power</div>
                    <div>{profile.voting_power}</div>
                </div>
            </div>
            <div>{profile.profile.about}</div>
        </div>
        </>}
    </div>
    }