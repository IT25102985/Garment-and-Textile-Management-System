import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';

const CategoryMaterialsPage = () => {
    const { category } = useParams();
    const [materials, setMaterials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        api.get(`/public/materials?category=${category}`)
            .then(res => {
                setMaterials(res.data);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [category]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Loading {category} materials...
        </div>
    );

    return (
        <div className="px-4 sm:px-6 pt-10 sm:pt-16 pb-16 min-h-screen max-w-6xl mx-auto">
            {/* Breadcrumb */}
            <div className="flex items-center mb-8">
                <Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>&larr; Back home</Link>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2 capitalize">{category} Collection</h1>
            <p className="text-base sm:text-lg mb-10" style={{ color: 'var(--text-muted)' }}>Browse our premium selection of {category} materials.</p>

            {materials.length === 0 ? (
                <div className="glass-card text-center p-14 rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <h3 className="text-xl sm:text-2xl" style={{ color: 'var(--text-main)' }}>No materials listed under this category yet.</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {materials.map(m => (
                        <div key={m.id} className="glass-card flex flex-col p-5 rounded-2xl">
                            <div className="h-56 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                <img src={m.imageUrl} alt={m.name} loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x400?text=StitchWorks+Material"; }} />
                            </div>
                            <h3 className="text-xl font-bold mb-1">{m.name}</h3>
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--text-muted)' }}>{m.description || 'Premium material'}</p>

                            {m.customFields && Object.keys(m.customFields).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {Object.entries(m.customFields).slice(0, 3).map(([key, value]) => (
                                        <span key={key} className="text-xs px-2 py-0.5 rounded" style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#555' }}>
                                            <strong>{key}:</strong> {value}
                                        </span>
                                    ))}
                                    {Object.keys(m.customFields).length > 3 && (
                                        <span className="text-xs self-center" style={{ color: '#888' }}>+{Object.keys(m.customFields).length - 3} more</span>
                                    )}
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between pt-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                                <div>
                                    <h4 className="text-lg font-bold m-0">Rs. {Number(m.pricePerUnit).toFixed(2)}</h4>
                                    {m.unit && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>per {m.unit}</span>}
                                </div>
                                <Link to={`/material/${m.id}`} className="btn btn-secondary text-sm px-4 py-2">Details</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CategoryMaterialsPage;
