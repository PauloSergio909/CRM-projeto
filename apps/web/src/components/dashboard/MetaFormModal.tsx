import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { upsertMetaSchema } from '@shared/validations';
import { Modal, Field, inputCls, ModalFooter } from '../ui/Modal';
import { useDefinirMeta, type Meta } from '../../hooks/useApi';

type MetaForm = { mes: string; valorMeta: number };

interface MetaFormModalProps {
  open: boolean;
  onClose: () => void;
  mes: string;
  meta: Meta | null;
}

export function MetaFormModal({ open, onClose, mes, meta }: MetaFormModalProps) {
  const definirMeta = useDefinirMeta();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MetaForm>({
    resolver: zodResolver(upsertMetaSchema),
    defaultValues: { mes, valorMeta: 0 },
  });

  useEffect(() => {
    if (!open) return;
    reset({ mes, valorMeta: meta?.valorMeta ?? 0 });
  }, [open, mes, meta, reset]);

  const onSubmit = async (data: MetaForm) => {
    await definirMeta.mutateAsync(data);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title="Meta de faturamento do mês" size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('mes')} />
        <Field label="Meta de receitas" required error={errors.valorMeta?.message}>
          <input {...register('valorMeta')} type="number" step="0.01" min="0" className={inputCls} placeholder="0,00" />
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
