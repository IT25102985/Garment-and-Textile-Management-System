import React from 'react';
import PublicNavbar from './PublicNavbar';
import Footer from './Footer';

const PublicLayout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen" style={{ backgroundColor: 'var(--bg-main, #ffffff)' }}>
            <PublicNavbar />
            <div className="flex flex-col flex-1 pt-[70px]">
                <div className="flex-1">
                    {children}
                </div>
                <Footer />
            </div>
        </div>
    );
};

export default PublicLayout;

