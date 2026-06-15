import React, { useEffect, useState } from 'react';
import './Home.css';
import { apibaseurl, callApi, isAdmin } from '../lib';
import ProgressBar from './ProgressBar';
import Profile from './Profile';
import Dashboard from './Dashboard';
import Students from './Students';
import Tasks from './Tasks';
import Assignments from './Assignments';
import Insights from './Insights';
import ErrorBoundary from './ErrorBoundary';

// Role-based navigation. Menu ids:
//   0 Dashboard · 1 Students (admin) · 2 Tasks · 3 Assignments · 4 Insights · 5 Profile
const ADMIN_NAV = [
    { mid: 0, menu: 'Dashboard',   icon: 'dashboard' },
    { mid: 1, menu: 'Students',    icon: 'school' },
    { mid: 2, menu: 'Tasks',       icon: 'task_alt' },
    { mid: 3, menu: 'Assignments', icon: 'assignment' },
    { mid: 4, menu: 'Insights',    icon: 'insights' },
    { mid: 5, menu: 'My Profile',  icon: 'person' },
];
const STUDENT_NAV = [
    { mid: 0, menu: 'Dashboard',   icon: 'dashboard' },
    { mid: 2, menu: 'My Tasks',    icon: 'task_alt' },
    { mid: 3, menu: 'Assignments', icon: 'assignment' },
    { mid: 4, menu: 'Insights',    icon: 'insights' },
    { mid: 5, menu: 'My Profile',  icon: 'person' },
];

const Home = () => {
    const [fullname, setFullname] = useState("");
    const [isProgress, setIsProgress] = useState(false);
    const [token] = useState(() => localStorage.getItem("token") || "");
    const [activeMenu, setActiveMenu] = useState(0);

    const admin = isAdmin();
    const nav = admin ? ADMIN_NAV : STUDENT_NAV;

    function loadUinfo(res) {
        setIsProgress(false);
        if (res.code != 200) return;
        setFullname(res.fullname || "");
    }

    function logout() {
        localStorage.clear();
        window.location.replace("/");
    }

    useEffect(() => {
        const storedtoken = localStorage.getItem("token");
        if (!storedtoken) {
            logout();
        } else {
            const timer = window.setTimeout(() => {
                setIsProgress(true);
                callApi("GET", apibaseurl + "/uinfo", null, null, loadUinfo, storedtoken);
            }, 0);
            return () => window.clearTimeout(timer);
        }
    }, []);

    // Resolve the component for the active menu. Falls back to the Dashboard so
    // the content pane is never empty.
    function renderActive() {
        switch (activeMenu) {
            case 1: return admin ? <Students /> : <Dashboard fullname={fullname} token={token} />;
            case 2: return <Tasks />;
            case 3: return <Assignments />;
            case 4: return <Insights />;
            case 5: return <Profile logout={logout} />;
            case 0:
            default:
                return <Dashboard fullname={fullname} token={token} />;
        }
    }

    const initials = (fullname || "U")
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();

    return (
        <div className='home'>
            <div className='home-header'>
                <div className='brand'>
                    <img src="/logo.png" alt='Micro-Task Hub' onError={(e) => { e.target.style.display = 'none'; }} />
                </div>
                <div className='info'>
                    <span className='hi'>Hi, {fullname || "there"} {admin ? "· Admin" : "· Student"}</span>
                    <div className='avatar' title={fullname}>{initials}</div>
                    <button className='logout-btn' onClick={logout} title='Sign out'>
                        <span className="material-symbols-outlined">logout</span>
                    </button>
                </div>
            </div>

            <div className='home-workspace'>
                <div className='home-menus'>
                    <ul>
                        {nav.map((m) => (
                            <li
                                key={m.mid}
                                className={activeMenu == m.mid ? 'active' : ''}
                                onClick={() => setActiveMenu(m.mid)}
                            >
                                <span className="material-symbols-outlined">{m.icon || 'chevron_right'}</span>
                                <span className='label'>{m.menu}</span>
                            </li>
                        ))}
                    </ul>
                    <div className='menus-foot'>
                        <span className="material-symbols-outlined">verified_user</span>
                        Signed in securely
                    </div>
                </div>

                <div className='home-content'>
                    <ErrorBoundary resetKey={activeMenu}>
                        {renderActive()}
                    </ErrorBoundary>
                </div>
            </div>

            <div className='home-footer'>Copyright @ 2026 · Micro-Task Hub. All rights reserved.</div>

            <ProgressBar isProgress={isProgress} />
        </div>
    );
}

export default Home;
