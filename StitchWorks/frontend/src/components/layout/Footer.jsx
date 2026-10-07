import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    return (
        <footer style={{ 
            marginTop: 'auto',
            padding: '60px 20px 30px', 
            background: 'var(--bg-secondary)', 
            borderTop: '1px solid var(--border-color)',
            color: 'var(--text-main)'
        }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '50px', justifyContent: 'space-between' }}>
                <div style={{ flex: '1 1 300px' }}>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: '700', letterSpacing: '-0.02em', marginBottom: '20px', color: 'var(--text-main)' }}>StitchWorks</h2>
                    <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
                        The premier B2B textile and garment marketplace connecting global buyers with vetted suppliers. Streamlining sourcing, design, production, and delivery.
                    </p>
                </div>
                
                <div style={{ flex: '1 1 200px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.1rem' }}>Quick Links</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li><Link to="/" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Home</Link></li>
                        <li><Link to="/#materials" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Materials Catalog</Link></li>
                        <li><Link to="/about" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>About Us</Link></li>
                        <li><Link to="/contact" style={{ color: 'var(--text-muted)', textDecoration: 'none', transition: 'color 0.2s' }}>Contact</Link></li>
                    </ul>
                </div>
                
                <div style={{ flex: '1 1 300px' }}>
                    <h4 style={{ color: 'var(--text-main)', marginBottom: '20px', fontSize: '1.1rem' }}>Contact Info</h4>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <li style={{ color: 'var(--text-muted)' }}><strong>Email:</strong> info@stitchworks.com</li>
                        <li style={{ color: 'var(--text-muted)' }}><strong>Phone:</strong> +1 (555) 123-4567</li>
                        <li style={{ color: 'var(--text-muted)' }}><strong>Address:</strong> 123 Textile Avenue, Colombo, Sri Lanka</li>
                    </ul>
                </div>
            </div>
            
            <div style={{ maxWidth: '1200px', margin: '60px auto 0', paddingTop: '30px', borderTop: '1px solid var(--border-color)', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                &copy; {new Date().getFullYear()} StitchWorks. All rights reserved.
            </div>
        </footer>
    );
};

export default Footer;
