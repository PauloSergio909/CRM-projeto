import { useEffect, useState } from 'react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useOportunidades, useMoverOportunidade, type Oportunidade } from '../../hooks/useApi';
import { formatCurrency } from '../../utils/formatters';
import { OportunidadeCard } from '../../components/pipeline/OportunidadeCard';
import { OportunidadeFormModal } from '../../components/pipeline/OportunidadeFormModal';
import { MotivoPerdaModal } from '../../components/pipeline/MotivoPerdaModal';
import { Button } from '../../components/ui/Button';

type Etapa = Oportunidade['etapa'];

const COLUNAS: { etapa: Etapa; titulo: string }[] = [
  { etapa: 'contato', titulo: 'Primeiro Contato' },
  { etapa: 'negociacao', titulo: 'Negociação' },
  { etapa: 'proposta', titulo: 'Proposta Enviada' },
  { etapa: 'fechado_ganho', titulo: 'Fechado (Ganho)' },
  { etapa: 'fechado_perdido', titulo: 'Fechado (Perdido)' },
];

function agrupar(lista: Oportunidade[]): Record<Etapa, Oportunidade[]> {
  const grupos = Object.fromEntries(COLUNAS.map((c) => [c.etapa, [] as Oportunidade[]])) as Record<
    Etapa,
    Oportunidade[]
  >;
  for (const o of lista) {
    grupos[o.etapa]?.push(o);
  }
  for (const etapa of Object.keys(grupos) as Etapa[]) {
    grupos[etapa].sort((a, b) => a.posicao - b.posicao);
  }
  return grupos;
}

interface ColunaProps {
  etapa: Etapa;
  titulo: string;
  itens: Oportunidade[];
  onCardClick: (o: Oportunidade) => void;
}

function Coluna({ etapa, titulo, itens, onCardClick }: ColunaProps) {
  const { setNodeRef } = useDroppable({ id: etapa });
  const total = itens.reduce((soma, o) => soma + o.valorEstimado, 0);

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[260px] bg-gray-50 rounded-2xl p-3 flex flex-col">
      <div className="mb-3 px-1">
        <h3 className="text-sm font-semibold text-gray-700">{titulo}</h3>
        <p className="text-xs text-gray-400">
          {itens.length} · {formatCurrency(total)}
        </p>
      </div>

      <SortableContext items={itens.map((o) => o.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-2 min-h-[40px]">
          {itens.map((o) => (
            <OportunidadeCard key={o.id} oportunidade={o} onClick={() => onCardClick(o)} />
          ))}
        </div>
      </SortableContext>
    </div>
  );
}

export function PipelinePage() {
  const { data } = useOportunidades();
  const moverOportunidade = useMoverOportunidade();

  const [grupos, setGrupos] = useState<Record<Etapa, Oportunidade[]>>(() => agrupar([]));
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Oportunidade | null>(null);
  const [motivoPerdaPendente, setMotivoPerdaPendente] = useState<{ id: string; etapa: Etapa; posicao: number } | null>(
    null,
  );

  useEffect(() => {
    if (data) setGrupos(agrupar(data));
  }, [data]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  function localizarColuna(id: string): Etapa | undefined {
    if (COLUNAS.some((c) => c.etapa === id)) return id as Etapa;
    return (Object.keys(grupos) as Etapa[]).find((etapa) => grupos[etapa].some((o) => o.id === id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const colunaOrigem = localizarColuna(String(active.id));
    const colunaDestino = localizarColuna(String(over.id));
    if (!colunaOrigem || !colunaDestino || colunaOrigem === colunaDestino) return;

    setGrupos((atual) => {
      const origem = [...atual[colunaOrigem]];
      const destino = [...atual[colunaDestino]];
      const indiceAtivo = origem.findIndex((o) => o.id === active.id);
      if (indiceAtivo === -1) return atual;

      const [item] = origem.splice(indiceAtivo, 1);
      const indiceOver = destino.findIndex((o) => o.id === over.id);
      destino.splice(indiceOver >= 0 ? indiceOver : destino.length, 0, item);

      return { ...atual, [colunaOrigem]: origem, [colunaDestino]: destino };
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const colunaDestino = localizarColuna(String(over.id));
    if (!colunaDestino) return;

    const itensColuna = grupos[colunaDestino];
    const indiceAtivo = itensColuna.findIndex((o) => o.id === active.id);
    const indiceOver = itensColuna.findIndex((o) => o.id === over.id);

    let novaOrdem = itensColuna;
    if (indiceAtivo !== -1 && indiceOver !== -1 && indiceAtivo !== indiceOver) {
      novaOrdem = arrayMove(itensColuna, indiceAtivo, indiceOver);
      setGrupos((atual) => ({ ...atual, [colunaDestino]: novaOrdem }));
    }

    const posicaoFinal = novaOrdem.findIndex((o) => o.id === active.id);
    if (posicaoFinal === -1) return;

    if (colunaDestino === 'fechado_perdido') {
      setMotivoPerdaPendente({ id: String(active.id), etapa: colunaDestino, posicao: posicaoFinal });
      return;
    }

    moverOportunidade.mutate({ id: String(active.id), etapa: colunaDestino, posicao: posicaoFinal });
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-gray-900">Pipeline</h2>
        <Button
          onClick={() => {
            setEditando(null);
            setModalOpen(true);
          }}
        >
          <Plus size={16} /> Nova Oportunidade
        </Button>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUNAS.map((coluna) => (
            <Coluna
              key={coluna.etapa}
              etapa={coluna.etapa}
              titulo={coluna.titulo}
              itens={grupos[coluna.etapa] ?? []}
              onCardClick={(o) => {
                setEditando(o);
                setModalOpen(true);
              }}
            />
          ))}
        </div>
      </DndContext>

      <OportunidadeFormModal open={modalOpen} onClose={() => setModalOpen(false)} oportunidade={editando} />

      <MotivoPerdaModal
        open={!!motivoPerdaPendente}
        onClose={() => setMotivoPerdaPendente(null)}
        onConfirm={(motivo) => {
          if (motivoPerdaPendente) {
            moverOportunidade.mutate({ ...motivoPerdaPendente, motivoPerda: motivo });
          }
          setMotivoPerdaPendente(null);
        }}
      />
    </div>
  );
}
