'use client';

import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center" onClick={() => onClose(false)}>
      <div className="bg-white rounded-xl shadow-elevated w-full max-w-md max-h-[80vh] flex flex-col mx-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="text-base font-semibold text-text-primary">{title}</h3>
          <button onClick={() => onClose(false)} className="text-text-muted hover:text-text-primary transition-colors cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <div className="flex-1 flex flex-col overflow-hidden px-5 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}