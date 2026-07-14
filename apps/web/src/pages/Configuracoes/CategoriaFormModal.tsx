import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createCategoriaSchema } from '@shared/validations';
import { Modal, Field, inputCls, selectCls, ModalFooter } from '../../components/ui/Modal';
import { useCriarCategoria, useAtualizarCategoria, type Categoria } from '../../hooks/useApi';

type CategoriaForm = { nome: string; tipo: 'receita' | 'despesa'; cor: string };

const emptyForm: CategoriaForm = { nome: '', tipo: 'despesa', cor: '#6B7280' };

interface CategoriaFormModalProps {
  open: boolean;
  onClose: () => void;
  categoria: Categoria | null;
}

export function CategoriaFormModal({ open, onClose, categoria }: CategoriaFormModalProps) {
  const criarCategoria = useCriarCategoria();
  const atualizarCategoria = useAtualizarCategoria();
  const isEditing = !!categoria;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CategoriaForm>({
    resolver: zodResolver(createCategoriaSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(categoria ? { nome: categoria.nome, tipo: categoria.tipo, cor: categoria.cor ?? '#6B7280' } : emptyForm);
  }, [open, categoria, reset]);

  const onSubmit = async (data: CategoriaForm) => {
    if (isEditing && categoria) {
      await atualizarCategoria.mutateAsync({ id: categoria.id, ...data });
    } else {
      await criarCategoria.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar categoria' : 'Nova categoria'} size="sm">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome" required error={errors.nome?.message}>
          <input {...register('nome')} className={inputCls} placeholder="Ex: Vendas, Aluguel..." />
        </Field>

        <Field label="Tipo" required error={errors.tipo?.message}>
          <select {...register('tipo')} className={selectCls}>
            <option value="receita">Receita</option>
            <option value="despesa">Despesa</option>
          </select>
        </Field>

        <Field label="Cor" error={errors.cor?.message}>
          <div className="flex items-center gap-3">
            <input {...register('cor')} type="color" className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer" />
            <span className="text-sm text-gray-500">{watch('cor')}</span>
          </div>
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
