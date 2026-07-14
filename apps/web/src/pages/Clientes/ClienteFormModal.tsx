import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createClienteSchema } from '@shared/validations';
import { Modal, Field, inputCls, ModalFooter } from '../../components/ui/Modal';
import { useCriarCliente, useAtualizarCliente, type Cliente } from '../../hooks/useApi';

type ClienteForm = {
  nome: string;
  telefone?: string;
  email?: string;
  cpfCnpj?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  observacoes?: string;
};

const emptyForm: ClienteForm = {
  nome: '',
  telefone: '',
  email: '',
  cpfCnpj: '',
  endereco: '',
  cidade: '',
  estado: '',
  observacoes: '',
};

interface ClienteFormModalProps {
  open: boolean;
  onClose: () => void;
  cliente: Cliente | null;
}

export function ClienteFormModal({ open, onClose, cliente }: ClienteFormModalProps) {
  const criarCliente = useCriarCliente();
  const atualizarCliente = useAtualizarCliente();
  const isEditing = !!cliente;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ClienteForm>({
    resolver: zodResolver(createClienteSchema),
    defaultValues: emptyForm,
  });

  useEffect(() => {
    if (!open) return;
    reset(
      cliente
        ? {
            nome: cliente.nome,
            telefone: cliente.telefone ?? '',
            email: cliente.email ?? '',
            cpfCnpj: cliente.cpfCnpj ?? '',
            endereco: cliente.endereco ?? '',
            cidade: cliente.cidade ?? '',
            estado: cliente.estado ?? '',
            observacoes: cliente.observacoes ?? '',
          }
        : emptyForm,
    );
  }, [open, cliente, reset]);

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

        <Field label="CPF/CNPJ" error={errors.cpfCnpj?.message}>
          <input {...register('cpfCnpj')} className={inputCls} placeholder="000.000.000-00" />
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

        <Field label="Observações" error={errors.observacoes?.message}>
          <textarea {...register('observacoes')} className={inputCls} rows={3} placeholder="Notas sobre o cliente" />
        </Field>

        <ModalFooter onCancel={onClose} loading={isSubmitting} />
      </form>
    </Modal>
  );
}
