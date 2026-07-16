import { Cake, MessageCircle } from 'lucide-react';
import { useAniversariantes } from '../../hooks/useApi';
import { whatsappLink } from '@clientebox/shared';

// dataNascimento é "só data" (meia-noite UTC) — usar getters UTC pra não
// "voltar" um dia em fusos atrás de UTC (ex.: America/Sao_Paulo).
function calcularIdadeQueVaiCompletar(dataNascimento: string): number {
  const hoje = new Date();
  const nascimento = new Date(dataNascimento);

  let anoAniversario = hoje.getUTCFullYear();
  const jaPassouEsseAno =
    nascimento.getUTCMonth() < hoje.getUTCMonth() ||
    (nascimento.getUTCMonth() === hoje.getUTCMonth() && nascimento.getUTCDate() < hoje.getUTCDate());
  if (jaPassouEsseAno) anoAniversario += 1;

  return anoAniversario - nascimento.getUTCFullYear();
}

function formatarDiaMes(dataNascimento: string): string {
  return new Date(dataNascimento).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' });
}

export function AniversariantesCard() {
  const { data: aniversariantes } = useAniversariantes();

  if (!aniversariantes || aniversariantes.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Cake size={15} className="text-cb-warning" />
        <h3 className="text-sm font-semibold text-gray-700">Aniversariantes da Semana</h3>
      </div>

      <ul className="divide-y divide-gray-50">
        {aniversariantes.map((cliente) => (
          <li key={cliente.id} className="px-5 py-3 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="font-medium text-gray-900 truncate">{cliente.nome}</p>
              <p className="text-xs text-gray-400">
                {formatarDiaMes(cliente.dataNascimento)} · completa {calcularIdadeQueVaiCompletar(cliente.dataNascimento)} anos
              </p>
            </div>
            {cliente.telefone && (
              <a
                href={whatsappLink(cliente.telefone)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-cb-success bg-emerald-50 hover:bg-emerald-100 transition-colors duration-150 flex-shrink-0"
              >
                <MessageCircle size={13} /> Parabenizar
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
