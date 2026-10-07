import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

/**
 * Reusable Base Modal Wrapper adhering to strict structural rules:
 * 1. Main Modal Wrapper: Background overlay fixed inset-0 flex items-center justify-center p-4,
 *    container max-h-[90vh] flex flex-col (doesn't expand beyond viewport).
 * 2. Modal Header: Static at top with p-6 pb-4, shrink-0.
 * 3. Modal Body: Middle scrolling area with flex-1 overflow-y-auto, px-6 py-2.
 * 4. Modal Footer: Static at bottom with shrink-0, p-6, and border-t border-gray-100.
 */
export const Modal = ({
  isOpen,
  onClose,
  children,
  className = '',
  maxWidth = 'max-w-2xl',
  overlayClassName = '',
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex items-center justify-center p-4",
        overlayClassName
      )}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
      role="dialog"
      aria-modal="true"
    >
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Main Modal Container */}
      <div
        className={cn(
          "relative flex flex-col w-full max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200/80 overflow-hidden z-10 transition-all",
          maxWidth,
          className
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export const ModalHeader = ({ title, subtitle, onClose, children, className = '' }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-6 pb-4 shrink-0 border-b border-gray-100 bg-white",
        className
      )}
    >
      <div>
        {title && <h2 className="text-xl font-bold text-slate-900">{title}</h2>}
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        {children}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <FiX size={18} />
        </button>
      )}
    </div>
  );
};

export const ModalTitle = ({ children, className = '' }) => (
  <h2 className={cn("text-xl font-bold text-slate-900", className)}>{children}</h2>
);

export const ModalBody = ({ children, className = '' }) => {
  return (
    <div className={cn("flex-1 overflow-y-auto px-6 py-2 custom-scrollbar", className)}>
      {children}
    </div>
  );
};

export const ModalFooter = ({ children, className = '' }) => {
  return (
    <div
      className={cn(
        "flex items-center justify-end gap-3 p-6 shrink-0 border-t border-gray-100 bg-white",
        className
      )}
    >
      {children}
    </div>
  );
};

export default Modal;
