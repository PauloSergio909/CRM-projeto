import { useEffect, useRef, useState, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';

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
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(false);

  // Mantém o modal montado durante a animação de saída (~200ms) em vez de
  // sumir instantaneamente — troca de classes acontece um frame depois pra
  // o navegador ter um estado inicial pra transicionar a partir dele.
  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }

    setVisible(false);
    const timer = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(timer);
  }, [open]);

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

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className={`fixed inset-0 bg-black/50 transition-opacity duration-200 ${visible ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />

      <div
        className={`
          relative bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col
          transition-all duration-200 ease-out
          ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
        `}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors duration-150"
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
  'w-full px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-cb-primary/30 focus:border-cb-primary placeholder:text-gray-400';

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
      <Button type="button" variant="ghost" onClick={onCancel}>
        Cancelar
      </Button>
      <Button type="submit" loading={loading} disabled={disabled}>
        {loading ? 'Salvando...' : confirmLabel}
      </Button>
    </div>
  );
}
