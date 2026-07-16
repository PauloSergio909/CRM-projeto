import { useState } from 'react';
import { Modal, Field, inputCls } from '../ui/Modal';
import { Button } from '../ui/Button';

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
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              onConfirm(undefined);
              setMotivo('');
            }}
          >
            Pular
          </Button>
          <Button type="button" onClick={confirmar}>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
