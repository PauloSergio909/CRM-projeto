import { useEffect, type ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createLancamentoSchema } from '@shared/validations';
import { Modal, Field, inputCls, selectCls, ModalFooter } from '../ui/Modal';
import {
  useCriarLancamento,
  useAtualizarLancamento,
  useCategorias,
  useClientes,
  useProdutos,
  type Lancamento,
} from '../../hooks/useApi';

type LancamentoForm = {
  tipo: 'receita' | 'despesa';
  categoriaId?: string;
  clienteId?: string;
  produtoId?: string;
  descricao: string;
  valor: number;
  data?: string;
  dataVencimento?: string;
  formaPagamento?: string;
  recorrente?: boolean;
  observacoes?: string;
};

function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

function emptyForm(tipoFixo?: 'receita' | 'despesa'): LancamentoForm {
  return {
    tipo: tipoFixo ?? 'despesa',
    categoriaId: '',
    clienteId: '',
    produtoId: '',
    descricao: '',
    valor: 0,
    data: toDateInputValue(new Date().toISOString()),
    dataVencimento: '',
    formaPagamento: '',
    recorrente: false,
    observacoes: '',
  };
}

const formasPagamento = [
  { value: '', label: 'Não informado' },
  { value: 'dinheiro', label: 'Dinheiro' },
  { value: 'pix', label: 'PIX' },
  { value: 'cartao_debito', label: 'Cartão de débito' },
  { value: 'cartao_credito', label: 'Cartão de crédito' },
  { value: 'boleto', label: 'Boleto' },
  { value: 'transferencia', label: 'Transferência' },
  { value: 'outro', label: 'Outro' },
];

interface LancamentoFormModalProps {
  open: boolean;
  onClose: () => void;
  lancamento: Lancamento | null;
  tipoFixo?: 'receita' | 'despesa';
}

export function LancamentoFormModal({ open, onClose, lancamento, tipoFixo }: LancamentoFormModalProps) {
  const criarLancamento = useCriarLancamento();
  const atualizarLancamento = useAtualizarLancamento();
  const isEditing = !!lancamento;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LancamentoForm>({
    resolver: zodResolver(createLancamentoSchema),
    defaultValues: emptyForm(tipoFixo),
  });

  const tipoSelecionado = watch('tipo');
  const { data: categorias } = useCategorias(tipoSelecionado);
  const { data: clientesResponse } = useClientes(1, '', 'ativo');
  const { data: produtos } = useProdutos(true);

  const handleProdutoChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const produto = produtos?.find((p) => p.id === e.target.value);
    if (produto) {
      setValue('descricao', produto.nome);
      setValue('valor', produto.preco);
      if (produto.categoriaId) setValue('categoriaId', produto.categoriaId);
    }
  };

  useEffect(() => {
    if (!open) return;
    reset(
      lancamento
        ? {
            tipo: lancamento.tipo,
            categoriaId: lancamento.categoriaId ?? '',
            clienteId: lancamento.clienteId ?? '',
            produtoId: lancamento.produtoId ?? '',
            descricao: lancamento.descricao,
            valor: lancamento.valor,
            data: toDateInputValue(lancamento.data),
            dataVencimento: toDateInputValue(lancamento.dataVencimento),
            formaPagamento: lancamento.formaPagamento ?? '',
            recorrente: lancamento.recorrente,
            observacoes: lancamento.observacoes ?? '',
          }
        : emptyForm(tipoFixo),
    );
  }, [open, lancamento, tipoFixo, reset]);

  const onSubmit = async (data: LancamentoForm) => {
    if (isEditing && lancamento) {
      await atualizarLancamento.mutateAsync({ id: lancamento.id, ...data });
    } else {
      await criarLancamento.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar lançamento' : 'Novo lançamento'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!tipoFixo && (
          <Field label="Tipo" required error={errors.tipo?.message}>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="receita" {...register('tipo')} /> Receita
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="radio" value="despesa" {...register('tipo')} /> Despesa
              </label>
            </div>
          </Field>
        )}

        {tipoSelecionado === 'receita' && (
          <Field label="Produto/serviço" error={errors.produtoId?.message}>
            <select {...register('produtoId', { onChange: handleProdutoChange })} className={selectCls}>
              <option value="">Digitar manualmente</option>
              {produtos?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Descrição" required error={errors.descricao?.message}>
          <input {...register('descricao')} className={inputCls} placeholder="Ex: Venda de produtos, Aluguel..." />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Valor" required error={errors.valor?.message}>
            <input {...register('valor')} type="number" step="0.01" min="0" className={inputCls} placeholder="0,00" />
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

        <Field label="Cliente" error={errors.clienteId?.message}>
          <select {...register('clienteId')} className={selectCls}>
            <option value="">Sem cliente vinculado</option>
            {clientesResponse?.data.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nome}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Data" error={errors.data?.message}>
            <input {...register('data')} type="date" className={inputCls} />
          </Field>
          <Field label="Vencimento" error={errors.dataVencimento?.message}>
            <input {...register('dataVencimento')} type="date" className={inputCls} />
          </Field>
        </div>

        <Field label="Forma de pagamento" error={errors.formaPagamento?.message}>
          <select {...register('formaPagamento')} className={selectCls}>
            {formasPagamento.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </Field>

        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input type="checkbox" {...register('recorrente')} /> Lançamento recorrente (mensal)
        </label>

        <Field label="Observações" error={errors.observacoes?.message}>
          <textarea {...register('observacoes')} className={inputCls} rows={2} />
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
