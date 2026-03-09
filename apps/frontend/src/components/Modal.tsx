'use client';

import React from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  children: React.ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

const Modal: React.FC<ModalProps> = ({ children, onClose, maxWidthClassName = 'max-w-2xl' }) => {
  if (typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-3 sm:p-6"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className={`animate-scale-in w-full rounded-[2rem] border border-slate-200 bg-white p-5 shadow-2xl sm:p-6 ${maxWidthClassName}`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
