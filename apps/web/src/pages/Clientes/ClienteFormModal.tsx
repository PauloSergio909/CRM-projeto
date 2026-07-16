import { useEffect, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle } from 'lucide-react';
import { createClienteSchema } from '@shared/validations';
import { Modal, Field, inputCls, ModalFooter } from '../../components/ui/Modal';
import { TagChip } from '../../components/ui/TagChip';
import { useCriarCliente, useAtualizarCliente, useVerificarDuplicatas, type Cliente } from '../../hooks/useApi';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { buscarCep } from '../../utils/viacep';

type ClienteForm = {
  nome: string;
  telefone?: string;
  email?: string;
  cpfCnpj?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  dataNascimento?: string;
  tags?: string[];
  observacoes?: string;
};

const emptyForm: ClienteForm = {
  nome: '',
  telefone: '',
  email: '',
  cpfCnpj: '',
  cep: '',
  endereco: '',
  cidade: '',
  estado: '',
  dataNascimento: '',
  tags: [],
  observacoes: '',
};

function toDateInputValue(iso: string | null | undefined): string {
  return iso ? iso.slice(0, 10) : '';
}

interface ClienteFormModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export function ClienteFormModal({ open, onClose, cliente }: ClienteFormModalProps) {
  const criarCliente = useCriarCliente();
  const atualizarCliente = useAtualizarCliente();
  const isEditing = !!cliente;
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [novaTag, setNovaTag] = useState('');

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ClienteForm>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: emptyForm,
  });

  const tags = watch('tags') ?? [];

  const nomeWatch = useDebouncedValue(watch('nome') ?? '', 400);
  const telefoneWatch = useDebouncedValue(watch('telefone') ?? '', 400);
  const cpfCnpjWatch = useDebouncedValue(watch('cpfCnpj') ?? '', 400);
  const { data: duplicatas } = useVerificarDuplicatas(
    open && !isEditing ? nomeWatch : '',
    open && !isEditing ? telefoneWatch : '',
    open && !isEditing ? cpfCnpjWatch : '',
  );

  const adicionarTag = () => {
    const valor = novaTag.trim();
    if (!valor || tags.includes(valor) || tags.length >= 10) return;
    setValue('tags', [...tags, valor]);
    setNovaTag('');
  };

  const removerTag = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      adicionarTag();
    }
  };

  useEffect(() => {
    if (!open) return;
    reset(
      cliente
        ? {
            nome: cliente.nome,
            telefone: cliente.telefone ?? '',
            email: cliente.email ?? '',
            cpfCnpj: cliente.cpfCnpj ?? '',
            cep: cliente.cep ?? '',
            endereco: cliente.endereco ?? '',
            cidade: cliente.cidade ?? '',
            estado: cliente.estado ?? '',
            dataNascimento: toDateInputValue(cliente.dataNascimento),
            tags: cliente.tags,
            observacoes: cliente.observacoes ?? '',
          }
        : emptyForm,
    );
  }, [open, cliente, reset]);

  const handleCepBlur = async (e: FocusEvent<HTMLInputElement>) => {
    const cep = e.target.value;
    if (cep.replace(/\D/g, '').length !== 8) return;

    setBuscandoCep(true);
    const endereco = await buscarCep(cep);
    setBuscandoCep(false);

    if (endereco) {
      const enderecoCompleto = [endereco.logradouro, endereco.bairro].filter(Boolean).join(', ');
      if (enderecoCompleto) setValue('endereco', enderecoCompleto);
      if (endereco.localidade) setValue('cidade', endereco.localidade);
      if (endereco.uf) setValue('estado', endereco.uf);
    }
  };

  const onSubmit = async (data: ClienteForm) => {
    if (isEditing && cliente) {
      await atualizarCliente.mutateAsync({ id: cliente.id, ...data });
    } else {
      await criarCliente.mutateAsync(data);
    }
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} title={isEditing ? 'Editar cliente' : 'Novo cliente'} size="lg">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Nome" required error={errors.nome?.message}>
          <input {...register('nome')} className={inputCls} placeholder="Nome completo" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Telefone" error={errors.telefone?.message}>
            <input {...register('telefone')} className={inputCls} placeholder="(11) 91234-5678" />
          </Field>
          <Field label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" className={inputCls} placeholder="cliente@email.com" />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="CPF/CNPJ" error={errors.cpfCnpj?.message}>
            <input {...register('cpfCnpj')} className={inputCls} placeholder="000.000.000-00" />
          </Field>
          <Field label="Data de nascimento" error={errors.dataNascimento?.message}>
            <input {...register('dataNascimento')} type="date" className={inputCls} />
          </Field>
        </div>

        <Field label="CEP" error={errors.cep?.message}>
          <div className="relative">
            <input
              {...register('cep', { onBlur: handleCepBlur })}
              className={inputCls}
              placeholder="00000-000"
              maxLength={9}
            />
            {buscandoCep && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">buscando...</span>}
          </div>
        </Field>

        <Field label="Endereço" error={errors.endereco?.message}>
          <input {...register('endereco')} className={inputCls} placeholder="Rua, número, bairro" />
        </Field>

        <div className="grid grid-cols-[1fr_100px] gap-4">
          <Field label="Cidade" error={errors.cidade?.message}>
            <input {...register('cidade')} className={inputCls} placeholder="Cidade" />
          </Field>
          <Field label="UF" error={errors.estado?.message}>
            <input {...register('estado')} className={inputCls} placeholder="SP" maxLength={2} />
          </Field>
        </div>

        <Field label="Tags" error={errors.tags?.message}>
          <div className="flex gap-2 mb-2">
            <input
              value={novaTag}
              onChange={(e) => setNovaTag(e.target.value)}
              onKeyDown={handleTagKeyDown}
              className={inputCls}
              placeholder="Digite e pressione Enter (ex: VIP, atacado)"
            />
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((tag) => (
                <TagChip key={tag} tag={tag} onRemove={() => removerTag(tag)} />
              ))}
            </div>
          )}
        </Field>

        <Field label="Observações" error={errors.observacoes?.message}>
          <textarea {...register('observacoes')} className={inputCls} rows={3} placeholder="Notas sobre o cliente" />
        </Field>

        {!isEditing && duplicatas && duplicatas.length > 0 && (
          <div className="flex items-start gap-2 px-3.5 py-3 rounded-xl bg-amber-50 text-amber-800 text-sm">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <p>
              Cliente parecido já cadastrado:{' '}
              {duplicatas.map((d) => `${d.nome} (${d.telefone ?? d.cpfCnpj ?? 'sem contato'})`).join(', ')}. Pode
              continuar se for realmente um cliente diferente.
            </p>
          </div>
        )}

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
