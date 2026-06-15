import React, { useEffect, useState } from 'react';
import './Crud.css';
import { api, insighturl, isAdmin } from '../lib';

// Insights. Admin has full CRUD; a student may only VIEW their own insights
// (enforced by the backend, reflected in the UI by hiding write controls).
const EMPTY = { studentId: '', type: 'Performance', content: '' };

const Insights = () => {
    const admin = isAdmin();
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null);

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await api('GET', `${insighturl}/getall`);
            if (res.code !== 200) {
                setRows([]);
                setError(res.message || 'Could not load insights. Is the task service (port 8002) running?');
            } else {
                setRows(Array.isArray(res.insights) ? res.insights : []);
            }
        } catch {
            setRows([]);
            setError('Could not reach the server. Ensure the gateway (8000) and task service (8002) are running.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => { load(); }, []);

    function openCreate() { setModal({ mode: 'create', data: { ...EMPTY } }); }
    function openEdit(r)  { setModal({ mode: 'edit', data: { ...r } }); }

    async function save() {
        const d = modal.data;
        const body = { studentId: Number(d.studentId), type: d.type, content: d.content };
        const res = modal.mode === 'create'
            ? await api('POST', `${insighturl}/create`, body)
            : await api('PUT', `${insighturl}/update/${d._id}`, body);
        alert(res.message || 'Done');
        if (res.code === 200) { setModal(null); load(); }
    }

    async function remove(r) {
        if (!window.confirm('Delete this insight?')) return;
        const res = await api('DELETE', `${insighturl}/delete/${r._id}`);
        alert(res.message || 'Done');
        if (res.code === 200) load();
    }

    const filtered = rows.filter(r =>
        !search || `${r.type} ${r.content}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className='crud'>
            <div className='crud-head'>
                <div>
                    <h2><span className="material-symbols-outlined">insights</span> Insights <span className="role-badge">{admin ? 'ADMIN' : 'STUDENT · VIEW'}</span></h2>
                    <div className='sub'>{admin ? 'All insights · full CRUD' : 'Your insights (read-only)'} · {rows.length} total</div>
                </div>
                <div className='crud-actions'>
                    <input className='search' placeholder='Search…' value={search} onChange={e => setSearch(e.target.value)} />
                    {admin && <button className='btn btn-primary' onClick={openCreate}><span className="material-symbols-outlined">add</span> New</button>}
                </div>
            </div>

            {loading ? <div className='loading'>Loading…</div> :
             error ? <div className='empty' style={{ color: '#b91c1c' }}>{error}</div> :
             filtered.length === 0 ? <div className='empty'>No insights found.</div> :
            <table className='crud-table'>
                <thead><tr>
                    <th>Type</th><th>Content</th><th>Generated</th>{admin && <th>Owner</th>}{admin && <th></th>}
                </tr></thead>
                <tbody>
                    {filtered.map(r => (
                        <tr key={r._id}>
                            <td><span className='pill pill-blue'>{r.type}</span></td>
                            <td>{r.content}</td>
                            <td>{(r.generatedAt || '').slice(0, 10) || '—'}</td>
                            {admin && <td>{r.studentId}</td>}
                            {admin && <td style={{ whiteSpace: 'nowrap' }}>
                                <button className='btn btn-light btn-sm' onClick={() => openEdit(r)}>Edit</button>{' '}
                                <button className='btn btn-danger btn-sm' onClick={() => remove(r)}>Delete</button>
                            </td>}
                        </tr>
                    ))}
                </tbody>
            </table>}

            {modal && (
                <div className='modal-overlay' onClick={e => e.target.className === 'modal-overlay' && setModal(null)}>
                    <div className='modal'>
                        <h3>{modal.mode === 'create' ? 'New Insight' : 'Edit Insight'}</h3>
                        <div className='field'><label>Owner (user id)</label><input type='number' value={modal.data.studentId} onChange={e => setModal({ ...modal, data: { ...modal.data, studentId: e.target.value } })} /></div>
                        <div className='field'><label>Type</label>
                            <select value={modal.data.type} onChange={e => setModal({ ...modal, data: { ...modal.data, type: e.target.value } })}>
                                <option>Performance</option><option>Attendance</option><option>Engagement</option><option>Improvement</option>
                            </select>
                        </div>
                        <div className='field'><label>Content</label><textarea value={modal.data.content} onChange={e => setModal({ ...modal, data: { ...modal.data, content: e.target.value } })} /></div>
                        <div className='modal-foot'>
                            <button className='btn btn-light' onClick={() => setModal(null)}>Cancel</button>
                            <button className='btn btn-primary' onClick={save}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Insights;
