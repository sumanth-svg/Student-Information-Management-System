import React, { useEffect, useState } from 'react';
import './Crud.css';
import { api, assignmenturl, isAdmin } from '../lib';

// Assignments CRUD. Backend scopes by role: admin sees/edits all, a student
// sees/edits only their own. Both roles can create/update/delete their own.
const EMPTY = { title: '', description: '', dueDate: '', status: 'PENDING', studentId: '' };
const STATUS_CLS = { PENDING: 'pill-yellow', IN_PROGRESS: 'pill-blue', COMPLETED: 'pill-green' };

const Assignments = () => {
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
            const res = await api('GET', `${assignmenturl}/getall`);
            if (res.code !== 200) {
                setRows([]);
                setError(res.message || 'Could not load assignments. Is the task service (port 8002) running?');
            } else {
                setRows(Array.isArray(res.assignments) ? res.assignments : []);
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
    function openEdit(r)  { setModal({ mode: 'edit', data: { ...r, dueDate: (r.dueDate || '').slice(0, 10) } }); }

    async function save() {
        const d = modal.data;
        const body = { title: d.title, description: d.description, dueDate: d.dueDate || null, status: d.status };
        if (admin && d.studentId) body.studentId = Number(d.studentId);
        const res = modal.mode === 'create'
            ? await api('POST', `${assignmenturl}/create`, body)
            : await api('PUT', `${assignmenturl}/update/${d._id}`, body);
        alert(res.message || 'Done');
        if (res.code === 200) { setModal(null); load(); }
    }

    async function remove(r) {
        if (!window.confirm(`Delete assignment "${r.title}"?`)) return;
        const res = await api('DELETE', `${assignmenturl}/delete/${r._id}`);
        alert(res.message || 'Done');
        if (res.code === 200) load();
    }

    const filtered = rows.filter(r =>
        !search || `${r.title} ${r.description}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className='crud'>
            <div className='crud-head'>
                <div>
                    <h2><span className="material-symbols-outlined">assignment</span> Assignments <span className="role-badge">{admin ? 'ADMIN' : 'STUDENT'}</span></h2>
                    <div className='sub'>{admin ? 'All assignments' : 'Your assignments'} · {rows.length} total</div>
                </div>
                <div className='crud-actions'>
                    <input className='search' placeholder='Search…' value={search} onChange={e => setSearch(e.target.value)} />
                    <button className='btn btn-primary' onClick={openCreate}><span className="material-symbols-outlined">add</span> New</button>
                </div>
            </div>

            {loading ? <div className='loading'>Loading…</div> :
             error ? <div className='empty' style={{ color: '#b91c1c' }}>{error}</div> :
             filtered.length === 0 ? <div className='empty'>No assignments found.</div> :
            <table className='crud-table'>
                <thead><tr>
                    <th>Title</th><th>Description</th><th>Due</th><th>Status</th>{admin && <th>Owner</th>}<th></th>
                </tr></thead>
                <tbody>
                    {filtered.map(r => (
                        <tr key={r._id}>
                            <td>{r.title}</td>
                            <td>{r.description}</td>
                            <td>{(r.dueDate || '').slice(0, 10) || '—'}</td>
                            <td><span className={`pill ${STATUS_CLS[r.status] || 'pill-gray'}`}>{r.status}</span></td>
                            {admin && <td>{r.studentId}</td>}
                            <td style={{ whiteSpace: 'nowrap' }}>
                                <button className='btn btn-light btn-sm' onClick={() => openEdit(r)}>Edit</button>{' '}
                                <button className='btn btn-danger btn-sm' onClick={() => remove(r)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>}

            {modal && (
                <div className='modal-overlay' onClick={e => e.target.className === 'modal-overlay' && setModal(null)}>
                    <div className='modal'>
                        <h3>{modal.mode === 'create' ? 'New Assignment' : 'Edit Assignment'}</h3>
                        <div className='field'><label>Title</label><input value={modal.data.title} onChange={e => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })} /></div>
                        <div className='field'><label>Description</label><textarea value={modal.data.description} onChange={e => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} /></div>
                        <div className='field'><label>Due date</label><input type='date' value={modal.data.dueDate} onChange={e => setModal({ ...modal, data: { ...modal.data, dueDate: e.target.value } })} /></div>
                        <div className='field'><label>Status</label>
                            <select value={modal.data.status} onChange={e => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })}>
                                <option value='PENDING'>Pending</option><option value='IN_PROGRESS'>In progress</option><option value='COMPLETED'>Completed</option>
                            </select>
                        </div>
                        {admin && modal.mode === 'create' && (
                            <div className='field'><label>Owner (user id, optional)</label><input type='number' value={modal.data.studentId} onChange={e => setModal({ ...modal, data: { ...modal.data, studentId: e.target.value } })} /></div>
                        )}
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

export default Assignments;
