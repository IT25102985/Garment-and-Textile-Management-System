import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useNavigate, Link } from 'react-router-dom';

const LandingPage = () => {
    const [materials, setMaterials] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [products, setProducts] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const navigate = useNavigate();

    // Dynamically import all images in the landpage directory
    const imageModules = import.meta.glob('../../assets/landpage/*.{jpg,jpeg,png}', { eager: true, import: 'default' });
    const slideImages = Object.values(imageModules);

    useEffect(() => {
        if (slideImages.length > 0) {
            console.log("Slideshow initialized with", slideImages.length, "images");
            const interval = setInterval(() => {
                setCurrentSlide((prev) => {
                    const next = (prev + 1) % slideImages.length;
                    console.log("Switching to slide", next);
                    return next;
                });
            }, 4000);
            return () => clearInterval(interval);
        } else {
            console.log("No images found for slideshow.");
        }
    }, [slideImages.length]);

    useEffect(() => {
        api.get('/public/materials').then(res => setMaterials(res.data)).catch(console.error);
        api.get('/public/products').then(res => setProducts(res.data)).catch(console.error);
        
        setLoadingCategories(true);
        api.get('/admin/categories').then(res => {
            setCategories(res.data);
        }).catch(() => {
            // fallback if not auth or some issue
        }).finally(() => {
            setLoadingCategories(false);
        });
    }, []);

    return (
        <div>
            {/* ── Hero Section ── */}
            <div
                className="relative overflow-hidden text-center rounded-2xl mx-3 sm:mx-5 mt-6 mb-0 border flex flex-col items-center justify-center min-h-[480px] sm:min-h-[580px] lg:min-h-[680px]"
                style={{ borderColor: 'var(--border-color)', padding: '80px 20px' }}
            >
                {/* Slideshow Backgrounds */}
                {slideImages.map((src, idx) => (
                    <div
                        key={idx}
                        style={{
                            position: 'absolute',
                            top: 0, left: 0, right: 0, bottom: 0,
                            backgroundImage: `url(${src})`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            opacity: idx === currentSlide ? 1 : 0,
                            transition: 'opacity 1.5s ease-in-out',
                            zIndex: 0
                        }}
                    />
                ))}

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-black/40" style={{ zIndex: 1 }} />

                {/* Hero Content */}
                <div
                    className="relative px-6 py-10 sm:px-10 sm:py-14 rounded-2xl border"
                    style={{ zIndex: 2, background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderColor: 'rgba(255,255,255,0.2)' }}
                >
                    <h1 className="text-3xl sm:text-5xl lg:text-[4.5rem] font-extrabold mb-4 leading-tight text-white" style={{ letterSpacing: '-0.04em', textShadow: '0 2px 10px rgba(0,0,0,0.3)' }}>
                        Source Premium Textiles
                    </h1>
                    <p className="text-base sm:text-lg lg:text-[1.4rem] text-white/90 mb-8 max-w-xl mx-auto" style={{ textShadow: '0 1px 5px rgba(0,0,0,0.3)' }}>
                        Join the leading B2B marketplace for high-quality raw materials and finished goods.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-5">
                        <a href="#products" className="btn btn-primary px-8 py-3 text-base font-semibold rounded-full" style={{ textDecoration: 'none', background: '#ffffff', color: '#000000', border: 'none' }}>
                            Explore Garments
                        </a>
                        <Link to="/materials" className="btn btn-secondary px-8 py-3 text-base font-semibold rounded-full" style={{ textDecoration: 'none', background: 'rgba(0,0,0,0.5)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}>
                            Explore Materials
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── Material Categories ── */}
            <div className="px-4 sm:px-6 py-16 sm:py-20">
                <h2 className="text-center text-2xl sm:text-3xl lg:text-[2.5rem] font-bold mb-10 sm:mb-14" style={{ color: 'var(--text-main)' }}>
                    Raw Materials Categories
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {loadingCategories ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="glass-card rounded-2xl h-60 animate-pulse" style={{ background: 'rgba(255,255,255,0.05)' }} />
                        ))
                    ) : categories.length === 0 ? (
                        <div className="glass-card col-span-full p-14 text-center rounded-2xl" style={{ background: 'rgba(255,255,255,0.05)' }}>
                            <h3 className="text-xl sm:text-2xl font-semibold" style={{ color: 'var(--text-main)' }}>Our material catalog is being curated.</h3>
                            <p className="mt-2" style={{ color: 'var(--text-muted)' }}>Please check back soon!</p>
                        </div>
                    ) : (
                        categories.map(cat => (
                            <div key={cat.name} className="glass-card relative overflow-hidden h-60 flex items-center justify-center rounded-2xl">
                                <img
                                    src={cat.coverImageUrl}
                                    alt={cat.name}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x300?text=StitchWorks+Materials"; }}
                                />
                                <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.8))' }} />
                                <div className="relative text-center px-5" style={{ zIndex: 2 }}>
                                    <h3 className="text-white text-2xl font-bold mb-3" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>{cat.name}</h3>
                                    <Link to={`/materials/${cat.name.toLowerCase()}`} className="btn btn-primary text-sm" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.3)', color: '#fff' }}>
                                        Browse {cat.name}
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ── Featured Materials ── */}
            <div id="featured-materials" className="px-4 sm:px-6 py-16 sm:py-20" style={{ background: 'var(--bg-primary)' }}>
                <h2 className="text-center text-2xl sm:text-3xl lg:text-[2.5rem] font-bold mb-10 sm:mb-14" style={{ color: 'var(--text-main)' }}>
                    Featured Raw Materials
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {materials.slice(0, 8).map(mat => (
                        <div key={mat.id} className="glass-card product-card flex flex-col p-5 rounded-2xl bg-white border border-gray-100" style={{ boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                            <div className="h-52 bg-gray-50 rounded-xl mb-4 overflow-hidden flex items-center justify-center">
                                {mat.images && mat.images.length > 0 ? (
                                    <img src={mat.images[0].imageUrl} alt={mat.name} loading="lazy" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-gray-300 text-sm">No Image</span>
                                )}
                            </div>
                            <h3 className="text-lg font-bold mb-1" style={{ color: '#111' }}>{mat.name}</h3>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'rgba(0,0,0,0.05)', color: '#555' }}>{mat.category || 'Material'}</span>
                            <p className="text-sm mb-3 line-clamp-2" style={{ color: '#666', lineHeight: '1.5' }}>{mat.description}</p>

                            {mat.customFields && Object.keys(mat.customFields).length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {Object.entries(mat.customFields).slice(0, 3).map(([key, value]) => (
                                        <span key={key} className="text-xs px-2 py-0.5 rounded" style={{ background: '#f5f5f5', border: '1px solid #e0e0e0', color: '#555' }}>
                                            <strong>{key}:</strong> {value}
                                        </span>
                                    ))}
                                    {Object.keys(mat.customFields).length > 3 && (
                                        <span className="text-xs self-center" style={{ color: '#888' }}>+{Object.keys(mat.customFields).length - 3} more</span>
                                    )}
                                </div>
                            )}

                            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-3">
                                <div className="flex flex-col">
                                    <span className="text-[10px] uppercase tracking-widest" style={{ color: '#999' }}>Price</span>
                                    <h4 className="text-lg font-bold m-0" style={{ color: '#111' }}>Rs. {Number(mat.pricePerUnit).toFixed(2)}</h4>
                                </div>
                                <button onClick={() => navigate(`/material/${mat.id}`)} className="btn btn-primary text-sm px-4 py-2 rounded-lg" style={{ background: '#000', color: '#fff', border: 'none' }}>View</button>
                            </div>
                        </div>
                    ))}
                    {materials.length === 0 && (
                        <p className="col-span-full text-center py-10" style={{ color: '#888' }}>No materials available yet.</p>
                    )}
                </div>
            </div>

            {/* ── Garment Collection ── */}
            <div id="products" className="px-4 sm:px-6 py-16 sm:py-20" style={{ background: 'var(--bg-secondary)' }}>
                <h2 className="text-center text-2xl sm:text-3xl lg:text-[2.5rem] font-bold mb-10 sm:mb-14" style={{ color: 'var(--text-main)' }}>
                    Garment Collection
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    {products.map(p => (
                        <div key={p.id} className="glass-card product-card flex flex-col p-5 rounded-2xl">
                            <div className="h-72 bg-gray-100 rounded-xl mb-4 overflow-hidden">
                                <img src={p.imageUrl} alt={p.name} loading="lazy" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/400x500?text=StitchWorks+Garment"; }} />
                            </div>
                            <h3 className="text-lg font-bold mb-1">{p.name}</h3>
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-medium mb-3" style={{ background: 'rgba(0,0,0,0.05)', color: 'var(--text-muted)' }}>{p.category}</span>
                            <p className="text-sm mb-4 line-clamp-2" style={{ color: 'var(--text-muted)', lineHeight: '1.5' }}>{p.description}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <h4 className="text-xl font-bold m-0">${p.basePrice}</h4>
                                <button onClick={() => navigate('/login')} className="btn btn-primary px-4 py-2 text-sm rounded-lg">Order</button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
