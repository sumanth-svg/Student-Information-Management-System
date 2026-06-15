import React, { useCallback, useEffect, useState } from 'react';
import './Profile.css';
import { apibaseurl, callApi } from '../lib';

const Profile = ({ logout }) => {
    const [data, setData] = useState(null);
    const [status, setStatus] = useState("loading"); // loading | ready | error

    const loadData = useCallback((res) => {
        // Backend returns { code, user: [ userObj, roleObj ] }. Guard every shape
        // so a missing role or unexpected payload never blanks the screen.
        if (!res || res.code != 200 || !res.user) {
            setStatus("error");
            return;
        }
        const user = Array.isArray(res.user) ? res.user[0] : res.user;
        const role = Array.isArray(res.user) ? res.user[1] : null;
        setData({ user: user || {}, role: role || {} });
        setStatus("ready");
    }, []);

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (storedtoken == undefined || storedtoken == "")
            return logout();

        callApi("GET", apibaseurl + "/profile", null, null, loadData, storedtoken);
    }, [loadData, logout]);

    if (status === "loading") {
        return (
            <div className='profile'>
                <div className='profile-msg'>
                    <span className="material-symbols-outlined spin">progress_activity</span>
                    Loading your profile…
                </div>
            </div>
        );
    }

    if (status === "error" || !data) {
        return (
            <div className='profile'>
                <div className='profile-msg error'>
                    <span className="material-symbols-outlined">error</span>
                    <div>
                        <h4>Couldn&rsquo;t load your profile</h4>
                        <p>The account service didn&rsquo;t return your details. Please try again.</p>
                    </div>
                </div>
            </div>
        );
    }

    const u = data.user;
    const rolename = data.role?.rolename || "Member";
    const initials = (u.fullname || "U")
        .split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

    return (
        <div className='profile'>
            <div className='container'>
                <div className='info'>
                    <div className='avatar-lg'>{initials}</div>
                    <div className='info-data'>
                        <label>{u.fullname || "—"}</label>
                        <span>{rolename}</span>
                    </div>
                </div>
                <div className='details'>
                    <div className='grid'>
                        <span>Name</span>
                        <span>{u.fullname || "—"}</span>
                    </div>
                    <div className='grid'>
                        <span>Phone Number</span>
                        <span>{u.phone || "—"}</span>
                    </div>
                    <div className='grid'>
                        <span>Email</span>
                        <span>{u.email || "—"}</span>
                    </div>
                    <div className='grid'>
                        <span>Role</span>
                        <span>{rolename}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Profile;
