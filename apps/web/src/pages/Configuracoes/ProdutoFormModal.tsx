import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProdutoSchema } from '@shared/validations';
import { Modal, Field, inputCls, selectCls, ModalFooter } from '../../components/ui/Modal';
import { useCriarProduto, useAtualizarProduto, useCategorias, type Produto } from '../../hooks/useApi';

type ProdutoForm = { nome: string; preco: number; categoriaId?: string; descricao?: string };

const emptyForm: ProdutoForm = { nome: '', preco: 0, categoriaId: '', descricao: '' };

interface ProdutoFormModalProps {
  open: boolean;
  onClose: () => void;
  produto: Produto | null;
}

export function ProdutoFormModal({ open, onClose, produto }: ProdutoFormModalProps) {
  const criarProduto = useCriarProduto();
  const atualizarProduto = useAtualizarProduto();
  const { data: categorias } = useCategorias('receita');
  const isEditing = !!produto;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProdutoForm>({
    resolver: zodResolver(createProdutoSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      produto
        ? {
            nome: produto.nome,
            preco: produto.preco,
            categoriaId: produto.categoriaId ?? '',
            descricao: produto.descricao ?? '',
          }
        : emptyForm,
    );
  }, [open, produto, reset]);

  const onSubmit = async (data: ProdutoForm) => {
    if (isEditing && produto) {
      await atualizarProduto.mutateAsync({ id: produto.id, ...data });
    } else {
      await criarProduto.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar produto/serviço' : 'Novo produto/serviço'} size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome" required error={errors.nome?.message}>
          <input {...register('nome')} className={inputCls} placeholder="Ex: Corte masculino, Consulta..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Preço" required error={errors.preco?.message}>
            <input {...register('preco')} type="number" step="0.01" min="0" className={inputCls} placeholder="0,00" />
          </Field>
          <Field label="Categoria" error={errors.categoriaId?.message}>
            <select {...register('categoriaId')} className={selectCls}>
              <option value="">Sem categoria</option>
              {categorias?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Descrição" error={errors.descricao?.message}>
          <textarea {...register('descricao')} className={inputCls} rows={3} placeholder="Notas sobre o produto/serviço" />
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
