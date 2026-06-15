import React from 'react';
import './Dashboard.css';

// Default landing view shown right after login. Previously the workspace had
// no default content, so a fresh user (empty role-menu) saw a blank pane.
const CARDS = [
    { key: 'tasks',   icon: 'task_alt',     color: 'blue',   title: 'My Tasks',      desc: 'Create, track and complete your micro-tasks.', stat: '—', statlabel: 'open tasks' },
    { key: 'profile', icon: 'badge',        color: 'green',  title: 'Profile',       desc: 'View and manage your account details.',        stat: '✓', statlabel: 'account active' },
    { key: 'team',    icon: 'groups',       color: 'yellow', title: 'Assignments',   desc: 'Work assigned to you across the workspace.',    stat: '—', statlabel: 'assigned' },
    { key: 'reports', icon: 'insights',     color: 'red',    title: 'Insights',      desc: 'Performance summaries and activity reports.',   stat: '—', statlabel: 'reports' },
];

const Dashboard = ({ fullname }) => {
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    const first = (fullname || 'there').split(' ')[0];

    return (
        <div className='dashboard'>
            <div className='dash-hero'>
                <div className='dash-dots'>
                    <i className='d-blue'></i><i className='d-red'></i><i className='d-yellow'></i><i className='d-green'></i>
                </div>
                <h1>{greet}, <b>{first}</b></h1>
                <p>Welcome back to your Micro-Task Hub workspace.</p>
            </div>

            <div className='dash-grid'>
                {CARDS.map((c, i) => (
                    <div className={`dash-card ${c.color}`} key={c.key} style={{ animationDelay: `${i * 0.07}s` }}>
                        <div className='dc-icon'><span className="material-symbols-outlined">{c.icon}</span></div>
                        <div className='dc-body'>
                            <h3>{c.title}</h3>
                            <p>{c.desc}</p>
                        </div>
                        <div className='dc-stat'>
                            <b>{c.stat}</b>
                            <span>{c.statlabel}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className='dash-banner'>
                <div className='db-text'>
                    <span className="material-symbols-outlined">rocket_launch</span>
                    <div>
                        <h4>You&rsquo;re all set</h4>
                        <p>Pick a section from the left to get started, or open your profile.</p>
                    </div>
                </div>
                <div className='db-chips'>
                    <span>Secure</span><span>Fast</span><span>Synced</span>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
