import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SupplierDashboard = () => {
    const [requirements, setRequirements] = useState([]);
    const [offers, setOffers] = useState([]);
    const [selectedReq, setSelectedReq] = useState(null);
    const [offerForm, setOfferForm] = useState({ price: '', deliveryDays: '', notes: '' });

    useEffect(() => {
        // Mock fetch for now, we'll need backend endpoints for these if they don't exist
        // api.get('/api/supplier/requirements').then(res => setRequirements(res.data));
        // api.get('/api/supplier/my-offers').then(res => setOffers(res.data));
    }, []);

    const handleOfferSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/api/supplier/requirements/${selectedReq.id}/offers`, offerForm);
            toast.success('Offer submitted');
            setSelectedReq(null);
            setOfferForm({ price: '', deliveryDays: '', notes: '' });
        } catch (err) {
            toast.error('Failed to submit offer');
        }
    };

    return (
        <div className="container" style={{ color: 'var(--text-color)' }}>
            <h1 style={{ marginBottom: '20px' }}>Supplier Dashboard</h1>
            
            <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
                <h2>Material Requirements</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th>Quantity Needed</th>
                            <th>Deadline</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requirements.map(req => (
                            <tr key={req.id}>
                                <td>{req.rawMaterial?.name}</td>
                                <td>{req.quantityNeeded}</td>
                                <td>{req.deadline}</td>
                                <td>
                                    <button className="btn btn-sm btn-primary" onClick={() => setSelectedReq(req)}>Submit Offer</button>
                                </td>
                            </tr>
                        ))}
                        {requirements.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No open requirements found</td></tr>}
                    </tbody>
                </table>
            </div>

            {selectedReq && (
                <div className="glass-card" style={{ padding: '20px', marginBottom: '30px' }}>
                    <h2>Submit Offer for {selectedReq.rawMaterial?.name}</h2>
                    <form onSubmit={handleOfferSubmit}>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label>Price</label>
                            <input type="number" step="0.01" className="form-control" value={offerForm.price} onChange={(e) => setOfferForm({...offerForm, price: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label>Delivery Days</label>
                            <input type="number" className="form-control" value={offerForm.deliveryDays} onChange={(e) => setOfferForm({...offerForm, deliveryDays: e.target.value})} required />
                        </div>
                        <div className="form-group" style={{ marginBottom: '15px' }}>
                            <label>Notes</label>
                            <textarea className="form-control" value={offerForm.notes} onChange={(e) => setOfferForm({...offerForm, notes: e.target.value})}></textarea>
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ marginRight: '10px' }}>Submit</button>
                        <button type="button" className="btn btn-secondary" onClick={() => setSelectedReq(null)}>Cancel</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default SupplierDashboard;
