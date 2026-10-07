import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const MaterialsOverviewPage = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo(0, 0);
        api.get('/public/materials/categories')
            .then(res => {
                setCategories(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <div className="px-4 sm:px-6 pt-10 sm:pt-16 pb-16 sm:pb-24 min-h-screen" style={{ background: 'var(--bg-main)' }}>
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-3"
                style={{ letterSpacing: '-0.03em', color: 'var(--text-main)' }}
            >
                Explore Our Raw Materials
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center text-base sm:text-lg mb-12 sm:mb-16 max-w-xl mx-auto"
                style={{ color: 'var(--text-muted)' }}
            >
                Source the finest fabrics, leathers, and accessories for your production line. Discover premium materials grouped by category.
            </motion.p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {loading ? (
                    Array.from({ length: 6 }).map((_, idx) => (
                        <div key={idx} className="glass-card h-80 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                    ))
                ) : categories.length === 0 ? (
                    <div className="glass-card col-span-full p-14 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <h3 className="text-2xl" style={{ color: 'var(--text-main)' }}>No material categories are available at the moment.</h3>
                    </div>
                ) : (
                    categories.map((cat, idx) => (
                        <motion.div
                            key={cat.id || cat.name}
                            className="glass-card relative overflow-hidden h-80 flex flex-col items-center justify-center rounded-2xl"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.08 }}
                        >
                            <img
                                src={cat.coverImageUrl || "https://via.placeholder.com/400x300?text=" + cat.name}
                                alt={cat.name}
                                className="absolute inset-0 w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=StitchWorks+Materials"; }}
                            />
                            <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.9))' }} />
                            <div className="relative text-center px-5 flex flex-col items-center justify-center h-full" style={{ zIndex: 2 }}>
                                <h3 className="text-white text-3xl sm:text-4xl font-bold mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cat.name}</h3>
                                {cat.description && (
                                    <p className="text-white/85 text-sm mb-4 line-clamp-3" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                                        {cat.description}
                                    </p>
                                )}
                                <Link
                                    to={`/materials/${cat.name.toLowerCase()}`}
                                    className="btn btn-primary mt-auto text-sm px-6 py-2.5 rounded-full"
                                    style={{
                                        background: 'rgba(255,255,255,0.15)',
                                        backdropFilter: 'blur(10px)',
                                        border: '1px solid rgba(255,255,255,0.4)',
                                        color: '#fff',
                                        fontWeight: '600',
                                    }}
                                >
                                    Browse {cat.name}
                                </Link>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MaterialsOverviewPage;
