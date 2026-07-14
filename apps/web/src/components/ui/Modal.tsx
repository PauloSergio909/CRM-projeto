import { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  size?: keyof typeof sizeClasses;
}

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKeyDown);

    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const firstInput = bodyRef.current?.querySelector<HTMLElement>('input, textarea, select');
    firstInput?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = original;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />

      <div className={`relative bg-white rounded-2xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div ref={bodyRef} data-modal-body className="px-6 py-5 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

export const inputCls =
  'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-cb-primary/30 focus:border-cb-primary placeholder:text-gray-400';

export const selectCls = `${inputCls} cursor-pointer`;

interface FieldProps {
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}

export function Field({ label, required, error, children }: FieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-cb-danger">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-cb-danger">{error}</p>}
    </div>
  );
}

interface ModalFooterProps {
  onCancel: () => void;
  confirmLabel?: string;
  loading?: boolean;
  disabled?: boolean;
}

export function ModalFooter({ onCancel, confirmLabel = 'Salvar', loading, disabled }: ModalFooterProps) {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition"
      >
        Cancelar
      </button>
      <button
        type="submit"
        disabled={loading || disabled}
        className="px-4 py-2 text-sm font-medium text-white bg-cb-primary rounded-xl hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Salvando...' : confirmLabel}
      </button>
    </div>
  );
}
