import React, { useEffect, useState } from 'react';
import './Crud.css';
import { api, studenturl } from '../lib';

// Admin-only CRUD over the PostgreSQL students domain (via /academicservice).
const EMPTY = { rollno: '', name: '', email: '', department: '', semester: 1, status: 1 };

function normalizeStudent(row = {}, index = 0) {
    return {
        id: row.id ?? row._id ?? `row-${index}`,
        rollno: row.rollno ?? '',
        name: row.name ?? '',
        email: row.email ?? '',
        department: row.department ?? '',
        semester: row.semester ?? '',
        status: Number(row.status ?? 0),
    };
}

const Students = () => {
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [modal, setModal] = useState(null); // { mode:'create'|'edit', data }

    async function load() {
        setLoading(true);
        setError('');
        try {
            const res = await api('GET', `${studenturl}/getallstudents/1/200`);
            if (res.code === 200 && Array.isArray(res.students)) {
                setRows(res.students.map(normalizeStudent));
            } else {
                setRows([]);
                setError(res.message || 'Unable to load students.');
            }
        } catch {
            setRows([]);
            setError('Unable to load students. Please check that the gateway and academic service are running.');
        } finally {
            setLoading(false);
        }
    }
    useEffect(() => {
        const timer = window.setTimeout(load, 0);
        return () => window.clearTimeout(timer);
    }, []);

    function openCreate() { setModal({ mode: 'create', data: { ...EMPTY } }); }
    function openEdit(r)  { setModal({ mode: 'edit', data: { ...r } }); }

    async function save() {
        const d = modal.data || {};
        const body = {
            rollno: d.rollno, name: d.name, email: d.email,
            department: d.department, semester: Number(d.semester), status: Number(d.status) || 1
        };
        const res = modal.mode === 'create'
            ? await api('POST', `${studenturl}/savestudent`, body)
            : await api('PUT', `${studenturl}/updatestudent/${d.id}`, body);
        if (res.code !== 200) {
            alert(res.message || 'Unable to save student.');
            return;
        }
        alert(res.message || 'Done');
        if (res.code === 200) { setModal(null); load(); }
    }

    async function remove(r) {
        if (!window.confirm(`Delete student ${r.name}?`)) return;
        const res = await api('DELETE', `${studenturl}/deletestudent/${r.id}`);
        if (res.code !== 200) {
            alert(res.message || 'Unable to delete student.');
            return;
        }
        alert(res.message || 'Done');
        if (res.code === 200) load();
    }

    const filtered = rows.filter(r =>
        !search || `${r.name || ''} ${r.rollno || ''} ${r.email || ''} ${r.department || ''}`.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className='crud'>
            <div className='crud-head'>
                <div>
                    <h2><span className="material-symbols-outlined">school</span> Students <span className="role-badge">ADMIN</span></h2>
                    <div className='sub'>{rows.length} student records · full CRUD</div>
                </div>
                <div className='crud-actions'>
                    <input className='search' placeholder='Search students…' value={search} onChange={e => setSearch(e.target.value)} />
                    <button className='btn btn-primary' onClick={openCreate}><span className="material-symbols-outlined">add</span> New</button>
                </div>
            </div>

            {loading ? <div className='loading'>Loading...</div> :
             error ? <div className='empty'>{error}</div> :
             filtered.length === 0 ? <div className='empty'>No students found.</div> :
            <table className='crud-table'>
                <thead><tr>
                    <th>ID</th><th>Roll No</th><th>Name</th><th>Email</th><th>Department</th><th>Sem</th><th>Status</th><th></th>
                </tr></thead>
                <tbody>
                    {filtered.map(r => (
                        <tr key={r.id}>
                            <td>{r.id}</td>
                            <td>{r.rollno}</td>
                            <td>{r.name}</td>
                            <td>{r.email}</td>
                            <td>{r.department}</td>
                            <td>{r.semester}</td>
                            <td><span className={`pill ${r.status === 1 ? 'pill-green' : 'pill-gray'}`}>{r.status === 1 ? 'Active' : 'Inactive'}</span></td>
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
                        <h3>{modal.mode === 'create' ? 'New Student' : 'Edit Student'}</h3>
                        <div className='field'><label>Roll No</label><input value={modal.data.rollno} onChange={e => setModal({ ...modal, data: { ...modal.data, rollno: e.target.value } })} /></div>
                        <div className='field'><label>Name</label><input value={modal.data.name} onChange={e => setModal({ ...modal, data: { ...modal.data, name: e.target.value } })} /></div>
                        <div className='field'><label>Email</label><input value={modal.data.email} onChange={e => setModal({ ...modal, data: { ...modal.data, email: e.target.value } })} /></div>
                        <div className='field'><label>Department</label><input value={modal.data.department} onChange={e => setModal({ ...modal, data: { ...modal.data, department: e.target.value } })} /></div>
                        <div className='field'><label>Semester</label><input type='number' min='1' max='8' value={modal.data.semester} onChange={e => setModal({ ...modal, data: { ...modal.data, semester: e.target.value } })} /></div>
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

export default Students;
