import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createOportunidadeSchema } from '@shared/validations';
import { Modal, Field, inputCls, selectCls, ModalFooter } from '../ui/Modal';
import { useCriarOportunidade, useAtualizarOportunidade, useClientes, type Oportunidade } from '../../hooks/useApi';

type OportunidadeForm = {
  clienteId: string;
  titulo: string;
  descricao?: string;
  valorEstimado: number;
};

const emptyForm: OportunidadeForm = { clienteId: '', titulo: '', descricao: '', valorEstimado: 0 };

interface OportunidadeFormModalProps {
  open: boolean;
  onClose: () => void;
  oportunidade: Oportunidade | null;
}

export function OportunidadeFormModal({ open, onClose, oportunidade }: OportunidadeFormModalProps) {
  const criarOportunidade = useCriarOportunidade();
  const atualizarOportunidade = useAtualizarOportunidade();
  const { data: clientesResponse } = useClientes(1, '', 'ativo');
  const isEditing = !!oportunidade;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OportunidadeForm>({
    resolver: zodResolver(createOportunidadeSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      oportunidade
        ? {
            clienteId: oportunidade.clienteId,
            titulo: oportunidade.titulo,
            descricao: oportunidade.descricao ?? '',
            valorEstimado: oportunidade.valorEstimado,
          }
        : emptyForm,
    );
  }, [open, oportunidade, reset]);

  const onSubmit = async (data: OportunidadeForm) => {
    if (isEditing && oportunidade) {
      await atualizarOportunidade.mutateAsync({ id: oportunidade.id, ...data });
    } else {
      await criarOportunidade.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar oportunidade' : 'Nova oportunidade'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Título" required error={errors.titulo?.message}>
          <input {...register('titulo')} className={inputCls} placeholder="Ex: Venda de pacote de serviços" />
        </Field>

        <Field label="Cliente" required error={errors.clienteId?.message}>
          <select {...register('clienteId')} className={selectCls}>
            <option value="">Selecione um cliente</option>
            {clientesResponse?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Valor estimado" error={errors.valorEstimado?.message}>
          <input {...register('valorEstimado')} type="number" step="0.01" min="0" className={inputCls} placeholder="0,00" />
        </Field>

        <Field label="Descrição" error={errors.descricao?.message}>
          <textarea {...register('descricao')} className={inputCls} rows={3} />
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
