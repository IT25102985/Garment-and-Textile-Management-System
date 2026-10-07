import React from 'react';
import { ShieldCheck, Sparkles, Award } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="px-4 py-16 sm:py-24 min-h-screen flex justify-center items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="glass-card w-full max-w-3xl p-8 sm:p-14 rounded-3xl border-none">
                <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-5" style={{ color: 'var(--text-main)', letterSpacing: '-0.03em' }}>
                    About StitchWorks
                </h1>
                <p className="text-base sm:text-lg leading-relaxed mb-10 text-center max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>
                    StitchWorks is a premier B2B textile and garment platform connecting global buyers with vetted manufacturers and suppliers. We streamline sourcing, design, inventory, and production – all in one unified ecosystem.
                </p>

                <div className="p-6 sm:p-9 rounded-2xl mb-10 text-center border" style={{ background: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3" style={{ color: 'var(--text-main)' }}>Our Mission</h3>
                    <p className="text-sm sm:text-base leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        To revolutionize the textile and garment manufacturing supply chain through transparency, real-time collaboration, and technological innovation—enabling fashion brands and factories of all sizes to scale effortlessly.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-6 rounded-2xl border text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(0,122,255,0.1)', color: '#007AFF' }}>
                            <ShieldCheck size={24} />
                        </div>
                        <h4 className="text-base font-bold mb-2" style={{ color: 'var(--text-main)' }}>Vetted Suppliers</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Rigorous verification of production standards and quality certification.</p>
                    </div>

                    <div className="p-6 rounded-2xl border text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981' }}>
                            <Sparkles size={24} />
                        </div>
                        <h4 className="text-base font-bold mb-2" style={{ color: 'var(--text-main)' }}>Smart Sourcing</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>Live inventory catalog, transparent pricing, and instant PO tracking.</p>
                    </div>

                    <div className="p-6 rounded-2xl border text-center" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--border-color)' }}>
                        <div className="w-12 h-12 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(139,92,246,0.1)', color: '#8B5CF6' }}>
                            <Award size={24} />
                        </div>
                        <h4 className="text-base font-bold mb-2" style={{ color: 'var(--text-main)' }}>Production Precision</h4>
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>End-to-end size registry, custom specifications, and seamless fulfillment.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;
