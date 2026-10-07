import React, { useState } from 'react';
import { toast } from 'react-toastify';

const ContactPage = () => {
    const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success("Thank you for reaching out! We'll get back to you soon.");
        setFormData({ name: '', email: '', subject: '', message: '' });
    };

    return (
        <div className="px-4 py-16 sm:py-24 min-h-screen flex justify-center items-center" style={{ background: 'var(--bg-main)' }}>
            <div className="glass-card w-full max-w-xl p-8 sm:p-14 rounded-3xl border-none">
                <h1 className="text-center text-3xl sm:text-4xl font-extrabold mb-8" style={{ color: 'var(--text-main)' }}>Contact Us</h1>

                <form onSubmit={handleSubmit} className="space-y-4 mb-10">
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        required
                        className="form-control w-full"
                    />
                    <input
                        type="email"
                        placeholder="Your Email"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        required
                        className="form-control w-full"
                    />
                    <input
                        type="text"
                        placeholder="Subject"
                        value={formData.subject}
                        onChange={e => setFormData({...formData, subject: e.target.value})}
                        required
                        className="form-control w-full"
                    />
                    <textarea
                        placeholder="Your Message"
                        rows="5"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                        required
                        className="form-control w-full"
                    ></textarea>
                    <button type="submit" className="btn btn-primary w-full py-3 text-base font-semibold">
                        Send Message
                    </button>
                </form>

                <div className="border-t pt-8 text-center" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xl font-bold mb-4" style={{ color: 'var(--text-main)' }}>Our Office</h3>
                    <p className="mb-2 text-sm" style={{ color: 'var(--text-muted)' }}><strong>Email:</strong> info@stitchworks.com</p>
                    <p className="mb-2 text-sm" style={{ color: 'var(--text-muted)' }}><strong>Phone:</strong> +1 (555) 123-4567</p>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}><strong>Address:</strong> 123 Textile Avenue, Colombo, Sri Lanka</p>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
