import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import api from '../../services/api';

const PublicNavbar = () => {
    const { user, role, logout } = useContext(AuthContext);
    const { cartCount } = useCart();
    const navigate = useNavigate();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [materialsDropdownOpen, setMaterialsDropdownOpen] = useState(false);
    const [categories, setCategories] = useState([]);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        api.get('/public/materials/categories')
            .then(res => setCategories(res.data))
            .catch(console.error);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/');
        setMobileMenuOpen(false);
    };

    const closeMobile = () => setMobileMenuOpen(false);

    return (
        <nav className="fixed w-full top-0 z-[1000]" style={{ background: 'var(--nav-bg)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--border-color)' }}>
            {/* Main bar */}
            <div className="flex items-center justify-between px-5 py-3.5 md:px-8">
                {/* Logo */}
                <div className="navbar-brand">
                    <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <h2 style={{ margin: 0, color: 'var(--text-main)', fontWeight: '700', letterSpacing: '-0.02em' }}>StitchWorks</h2>
                    </Link>
                </div>

                {/* Desktop Nav Links */}
                <div className="hidden md:flex items-center gap-6 lg:gap-8">
                    <Link to="/" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>Home</Link>

                    {categories.length > 0 ? (
                        <div
                            style={{ position: 'relative' }}
                            onMouseEnter={() => setMaterialsDropdownOpen(true)}
                            onMouseLeave={() => setMaterialsDropdownOpen(false)}
                        >
                            <Link to="/materials" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                Materials
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </Link>
                            {materialsDropdownOpen && (
                                <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '5px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', minWidth: '160px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', zIndex: 1100 }}>
                                    {categories.map(cat => (
                                        <Link key={cat.name} to={`/materials/${cat.name.toLowerCase()}`} style={{ display: 'block', padding: '10px 12px', textDecoration: 'none', color: 'var(--text-color)', borderRadius: '6px', transition: 'background 0.2s' }} className="dropdown-item">
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/materials" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>Materials</Link>
                    )}

                    <Link to="/about" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>About</Link>
                    <Link to="/contact" className="nav-link" style={{ textDecoration: 'none', color: 'var(--text-main)', fontWeight: '500' }}>Contact</Link>
                </div>

                {/* Right side: cart + user + hamburger */}
                <div className="flex items-center gap-3 md:gap-5">
                    {/* Cart icon */}
                    {user && role === 'CUSTOMER' && (
                        <Link to="/customer/cart" style={{ position: 'relative', color: 'var(--text-color)', display: 'flex', alignItems: 'center' }}>
                            <svg stroke="currentColor" fill="none" strokeWidth="2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round" height="24px" width="24px" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
                            {cartCount > 0 && (
                                <span style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#FF6B6B', color: 'white', borderRadius: '50%', padding: '2px 6px', fontSize: '12px', fontWeight: 'bold' }}>
                                    {cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Desktop: user dropdown or login */}
                    <div className="hidden md:block">
                        {user && (role === 'CUSTOMER' || role === 'SUPPLIER') ? (
                            <div style={{ position: 'relative' }}>
                                <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                                    <div style={{ width: '35px', height: '35px', borderRadius: '50%', background: 'var(--primary-color)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <span style={{ color: 'var(--text-color)' }}>{user.name}</span>
                                </div>
                                {dropdownOpen && (
                                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '10px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '10px', minWidth: '150px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                        <Link to={role === 'CUSTOMER' ? '/customer' : '/supplier'} style={{ display: 'block', padding: '8px', textDecoration: 'none', color: 'var(--text-color)' }}>My Dashboard</Link>
                                        <div style={{ borderTop: '1px solid var(--border-color)', margin: '5px 0' }}></div>
                                        <div onClick={handleLogout} style={{ display: 'block', padding: '8px', cursor: 'pointer', color: '#FF6B6B' }}>Logout</div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link to="/login" className="px-5 py-2 bg-blue-600 text-white text-sm font-semibold rounded-full hover:bg-blue-700 transition-colors shadow-sm" style={{ textDecoration: 'none' }}>Login / Register</Link>
                        )}
                    </div>

                    {/* Hamburger — mobile only */}
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        className="md:hidden flex flex-col gap-[5px] p-2 rounded-lg cursor-pointer border-none bg-transparent"
                        aria-label="Toggle mobile menu"
                        style={{ color: 'var(--text-main)' }}
                    >
                        {mobileMenuOpen ? (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                        ) : (
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileMenuOpen && (
                <div className="md:hidden border-t" style={{ background: 'var(--card-bg)', borderColor: 'var(--border-color)' }}>
                    <div className="px-5 py-4 flex flex-col gap-1">
                        <Link to="/" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg font-medium" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>Home</Link>
                        <Link to="/materials" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg font-medium" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>Materials</Link>

                        {categories.length > 0 && (
                            <div className="pl-4 flex flex-col gap-0.5">
                                {categories.map(cat => (
                                    <Link key={cat.name} to={`/materials/${cat.name.toLowerCase()}`} onClick={closeMobile} className="block px-3 py-2 rounded-lg text-sm" style={{ textDecoration: 'none', color: 'var(--text-muted)' }}>
                                        {cat.name}
                                    </Link>
                                ))}
                            </div>
                        )}

                        <Link to="/about" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg font-medium" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>About</Link>
                        <Link to="/contact" onClick={closeMobile} className="block px-3 py-2.5 rounded-lg font-medium" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>Contact</Link>

                        <div className="mt-2 pt-2 border-t" style={{ borderColor: 'var(--border-color)' }}>
                            {user && (role === 'CUSTOMER' || role === 'SUPPLIER') ? (
                                <>
                                    <Link to={role === 'CUSTOMER' ? '/customer' : '/supplier'} onClick={closeMobile} className="block px-3 py-2.5 rounded-lg font-medium" style={{ textDecoration: 'none', color: 'var(--text-main)' }}>My Dashboard</Link>
                                    <button onClick={handleLogout} className="block w-full text-left px-3 py-2.5 rounded-lg font-medium cursor-pointer border-none bg-transparent" style={{ color: '#FF6B6B' }}>Logout</button>
                                </>
                            ) : (
                                <Link to="/login" onClick={closeMobile} className="block w-full text-center px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-full" style={{ textDecoration: 'none' }}>Login / Register</Link>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default PublicNavbar;
