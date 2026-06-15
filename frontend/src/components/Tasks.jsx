import React, { useEffect, useState } from 'react';
import './Crud.css';
import { api, taskurl, isAdmin } from '../lib';

// Tasks CRUD. The backend scopes by role: admin sees all tasks, a student sees
// and edits only their own. Both roles can create/update/delete their tasks.
const EMPTY = { title: '', description: '', priority: 2, deadline: '', status: 0, assignedto: 0 };
const PRIORITY = { 1: ['High', 'pill-yellow'], 2: ['Medium', 'pill-blue'], 3: ['Low', 'pill-gray'] };

const Tasks = () => {
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
            const res = await api('GET', `${taskurl}/getalltasks/1/200`);
            if (res.code !== 200) {
                setRows([]);
                setError(res.message || 'Could not load tasks. Is the task service (port 8002) running?');
            } else {
                setRows(Array.isArray(res.tasks) ? res.tasks : []);
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
        const title = d.title.trim();
        const description = d.description.trim();

        if (!title) {
            alert('Title is required.');
            return;
        }

        const body = {
            title, description,
            priority: Number(d.priority) || 2, deadline: d.deadline || '2026-12-31',
            status: Number(d.status) || 0, assignedto: Number(d.assignedto) || 0
        };
        const res = modal.mode === 'create'
            ? await api('POST', `${taskurl}/createtask`, body)
            : await api('PUT', `${taskurl}/updatetask/${d._id}`, body);
        alert(res.message || 'Done');
        if (res.code === 200) { setModal(null); load(); }
    }

    async function remove(r) {
        if (!window.confirm(`Delete task "${r.title}"?`)) return;
        const res = await api('DELETE', `${taskurl}/deletetask/${r._id}`);
        alert(res.message || 'Done');
        if (res.code === 200) load();
    }

    const filtered = rows.filter(r =>
        !search || `${r.title} ${r.description}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className='crud'>
            <div className='crud-head'>
                <div>
                    <h2><span className="material-symbols-outlined">task_alt</span> Tasks <span className="role-badge">{admin ? 'ADMIN' : 'STUDENT'}</span></h2>
                    <div className='sub'>{admin ? 'All tasks across users' : 'Your tasks'} · {rows.length} total</div>
                </div>
                <div className='crud-actions'>
                    <input className='search' placeholder='Search tasks…' value={search} onChange={e => setSearch(e.target.value)} />
                    <button className='btn btn-primary' onClick={openCreate}><span className="material-symbols-outlined">add</span> New</button>
                </div>
            </div>

            {loading ? <div className='loading'>Loading…</div> :
             error ? <div className='empty' style={{ color: '#b91c1c' }}>{error}</div> :
             filtered.length === 0 ? <div className='empty'>No tasks found.</div> :
            <table className='crud-table'>
                <thead><tr>
                    <th>Title</th><th>Description</th><th>Priority</th><th>Deadline</th><th>Status</th>{admin && <th>Owner</th>}<th></th>
                </tr></thead>
                <tbody>
                    {filtered.map(r => {
                        const [plabel, pcls] = PRIORITY[r.priority] || PRIORITY[2];
                        return (
                            <tr key={r._id}>
                                <td>{r.title}</td>
                                <td>{r.description}</td>
                                <td><span className={`pill ${pcls}`}>{plabel}</span></td>
                                <td>{r.deadline}</td>
                                <td><span className={`pill ${r.status === 1 ? 'pill-green' : 'pill-yellow'}`}>{r.status === 1 ? 'Done' : 'Open'}</span></td>
                                {admin && <td>{r.createdby}</td>}
                                <td style={{ whiteSpace: 'nowrap' }}>
                                    <button className='btn btn-light btn-sm' onClick={() => openEdit(r)}>Edit</button>{' '}
                                    <button className='btn btn-danger btn-sm' onClick={() => remove(r)}>Delete</button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>}

            {modal && (
                <div className='modal-overlay' onClick={e => e.target.className === 'modal-overlay' && setModal(null)}>
                    <div className='modal'>
                        <h3>{modal.mode === 'create' ? 'New Task' : 'Edit Task'}</h3>
                        <div className='field'><label>Title</label><input value={modal.data.title} onChange={e => setModal({ ...modal, data: { ...modal.data, title: e.target.value } })} /></div>
                        <div className='field'><label>Description</label><textarea value={modal.data.description} onChange={e => setModal({ ...modal, data: { ...modal.data, description: e.target.value } })} /></div>
                        <div className='field'><label>Priority</label>
                            <select value={modal.data.priority} onChange={e => setModal({ ...modal, data: { ...modal.data, priority: e.target.value } })}>
                                <option value={1}>High</option><option value={2}>Medium</option><option value={3}>Low</option>
                            </select>
                        </div>
                        <div className='field'><label>Deadline</label><input type='date' value={modal.data.deadline} onChange={e => setModal({ ...modal, data: { ...modal.data, deadline: e.target.value } })} /></div>
                        <div className='field'><label>Status</label>
                            <select value={modal.data.status} onChange={e => setModal({ ...modal, data: { ...modal.data, status: e.target.value } })}>
                                <option value={0}>Open</option><option value={1}>Done</option>
                            </select>
                        </div>
                        {admin && modal.mode === 'create' && (
                            <div className='field'><label>Assign to (user id, optional)</label><input type='number' value={modal.data.assignedto} onChange={e => setModal({ ...modal, data: { ...modal.data, assignedto: e.target.value } })} /></div>
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

export default Tasks;
