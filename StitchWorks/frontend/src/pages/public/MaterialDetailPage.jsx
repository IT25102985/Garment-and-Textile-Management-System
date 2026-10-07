import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import { Carousel } from 'react-responsive-carousel';
import 'react-responsive-carousel/lib/styles/carousel.min.css';

const MaterialDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useContext(AuthContext);
    
    const [material, setMaterial] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    
    useEffect(() => {
        setLoading(true);
        api.get(`/public/materials/${id}`)
            .then(res => {
                setMaterial(res.data);
                if (res.data.minimumOrderQuantity) {
                    setQuantity(res.data.minimumOrderQuantity);
                }
            })
            .catch(err => {
                console.error(err);
                setMaterial(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleAddToCart = () => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (material.minimumOrderQuantity && quantity < material.minimumOrderQuantity) {
            alert(`Minimum order quantity is ${material.minimumOrderQuantity} ${material.unitForSale || material.unit}`);
            return;
        }
        
        addToCart({
            id: material.id,
            name: material.name,
            price: material.pricePerUnit,
            imageUrl: material.imageUrl,
            itemType: 'material'
        }, quantity);
        
        alert("Material added to cart!");
    };

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center px-4 text-center" style={{ color: 'var(--text-muted)' }}>
            Loading material details...
        </div>
    );

    if (!material) return (
        <div className="px-4 py-20 text-center max-w-lg mx-auto min-h-screen flex items-center justify-center">
            <div className="glass-card p-10 sm:p-14 rounded-2xl w-full">
                <h2 className="text-xl font-bold mb-4">Material Not Found</h2>
                <p className="mb-6" style={{ color: 'var(--text-muted)' }}>The material you are looking for does not exist or has been removed.</p>
                <Link to="/materials" className="btn btn-primary">Return to Materials</Link>
            </div>
        </div>
    );

    return (
        <div className="px-4 sm:px-6 pt-10 sm:pt-16 pb-16 max-w-6xl mx-auto min-h-screen">
            {/* Breadcrumb */}
            <div className="flex items-center mb-8">
                <Link to={`/materials/${material.category?.toLowerCase()}`} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
                    &larr; Back to {material.category}
                </Link>
            </div>

            {/* Two-column layout: stacks on mobile, side-by-side on md+ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 rounded-3xl overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
                {/* Image */}
                <div className="p-5 sm:p-8">
                    {material.images && material.images.length > 0 ? (
                        <div className="rounded-2xl overflow-hidden shadow-lg">
                            <Carousel showArrows={true} showStatus={false} showThumbs={true} infiniteLoop={true}>
                                {material.images.map((img, idx) => (
                                    <div key={idx} className="h-72 sm:h-[420px] bg-gray-100">
                                        <img src={img} alt={`${material.name} ${idx + 1}`} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </Carousel>
                        </div>
                    ) : (
                        <img
                            src={material.imageUrl}
                            alt={material.name}
                            className="w-full rounded-2xl shadow-lg"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/600x600?text=StitchWorks+Material"; }}
                        />
                    )}
                </div>

                {/* Details */}
                <div className="p-5 sm:p-8 md:p-8 md:pl-0 flex flex-col">
                    <span className="inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 self-start" style={{ background: 'rgba(0,0,0,0.05)' }}>{material.category}</span>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3">{material.name}</h1>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-6" style={{ color: 'var(--primary-color)' }}>
                        Rs. {Number(material.pricePerUnit).toFixed(2)}
                        {material.unit && <span className="text-sm font-normal ml-1" style={{ color: 'var(--text-muted)' }}>per {material.unit}</span>}
                    </h2>

                    <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Description</h3>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{material.description || 'No description available.'}</p>
                    </div>

                    {material.customFields && Object.keys(material.customFields).length > 0 && (
                        <div className="mb-8 p-4 sm:p-5 rounded-xl" style={{ background: 'rgba(0,0,0,0.03)' }}>
                            <h3 className="text-base font-semibold mb-3">Properties</h3>
                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(material.customFields).map(([key, value]) => (
                                    <div key={key} className="flex flex-col">
                                        <span className="text-xs uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{key}</span>
                                        <span className="text-sm font-medium">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-auto flex flex-col sm:flex-row items-start sm:items-end gap-4">
                        <div className="flex-1">
                            <label className="block mb-2 text-sm font-medium">Quantity ({material.unitForSale || material.unit})</label>
                            <input
                                type="number"
                                min={material.minimumOrderQuantity || 1}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                className="form-control w-full"
                                style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                            {material.minimumOrderQuantity && (
                                <span className="block mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>Min order: {material.minimumOrderQuantity}</span>
                            )}
                        </div>
                        <button
                            onClick={handleAddToCart}
                            className="btn btn-primary w-full sm:flex-[2] py-3 text-base font-semibold"
                        >
                            Add to Cart — ${(material.pricePerUnit * quantity).toFixed(2)}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MaterialDetailPage;
