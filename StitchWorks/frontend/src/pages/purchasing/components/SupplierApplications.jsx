import React, { useState, useEffect } from 'react';
import api from '../../../services/api';
import { toast } from 'react-toastify';

const SupplierApplications = () => {
    const [applications, setApplications] = useState([]);
    
    useEffect(() => {
        fetchApplications();
    }, []);

    const fetchApplications = async () => {
        try {
            const res = await api.get('/admin/supplier-applications');
            setApplications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleApprove = async (id) => {
        try {
            await api.put(`/admin/supplier-applications/${id}/approve`);
            toast.success('Supplier approved successfully');
            fetchApplications();
        } catch (err) {
            toast.error('Error approving supplier');
        }
    };

    const handleReject = async (id) => {
        try {
            await api.put(`/admin/supplier-applications/${id}/reject`);
            toast.success('Supplier rejected');
            fetchApplications();
        } catch (err) {
            toast.error('Error rejecting supplier');
        }
    };

    return (
        <div>
            <h2>Supplier Applications</h2>
            <div className="glass-card" style={{ padding: '20px', marginTop: '20px' }}>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Company Name</th>
                            <th>Contact Person</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {applications.map(app => (
                            <tr key={app.id}>
                                <td>{app.companyName}</td>
                                <td>{app.contactPerson}</td>
                                <td>{app.email}</td>
                                <td>
                                    <span className={`status-badge status-${app.status.toLowerCase()}`}>
                                        {app.status}
                                    </span>
                                </td>
                                <td>
                                    {app.status === 'PENDING' && (
                                        <>
                                            <button className="btn btn-sm btn-primary" style={{ marginRight: '10px' }} onClick={() => handleApprove(app.id)}>Approve</button>
                                            <button className="btn btn-sm btn-secondary" onClick={() => handleReject(app.id)}>Reject</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {applications.length === 0 && <tr><td colSpan="5" style={{ textAlign: 'center' }}>No applications found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default SupplierApplications;
