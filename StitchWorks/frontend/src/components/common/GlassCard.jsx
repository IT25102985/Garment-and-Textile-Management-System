import React from 'react';
import { motion } from 'framer-motion';

const GlassCard = ({ children, className = '', style = {}, ...props }) => {
    return (
        <motion.div 
            whileHover={{ translateY: -5 }}
            className={`p-4 ${className}`}
            style={{
                background: 'var(--glass-bg)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '24px',
                boxShadow: 'var(--glass-shadow)',
                ...style
            }}
            {...props}
        >
            {children}
        </motion.div>
    );
};

export default GlassCard;
