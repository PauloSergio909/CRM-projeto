import { useState } from 'react';
import { Modal, Field, inputCls } from '../ui/Modal';

interface MotivoPerdaModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (motivo?: string) => void;
}

export function MotivoPerdaModal({ open, onClose, onConfirm }: MotivoPerdaModalProps) {
  const [motivo, setMotivo] = useState('');

  const handleClose = () => {
    setMotivo('');
    onClose();
  };

  const confirmar = () => {
    onConfirm(motivo.trim() || undefined);
    setMotivo('');
  };

  return (
    <Modal open={open} onClose={handleClose} title="Motivo da perda" size="sm">
      <div className="space-y-4">
        <Field label="Por que essa oportunidade foi perdida? (opcional)">
          <textarea
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            className={inputCls}
            rows={3}
            placeholder="Ex: Cliente escolheu concorrente, preço fora do orçamento..."
            autoFocus
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onConfirm(undefined);
              setMotivo('');
            }}
            className="px-4 py-2 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-100 transition"
          >
            Pular
          </button>
          <button
            type="button"
            onClick={confirmar}
            className="px-4 py-2 text-sm font-medium text-white bg-cb-primary rounded-xl hover:opacity-90 transition"
          >
            Confirmar
          </button>
        </div>
      </div>
    </Modal>
  );
}
