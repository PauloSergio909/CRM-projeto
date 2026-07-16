import PDFDocument from 'pdfkit';
import type { Usuario } from '@prisma/client';
import { formatarMoeda } from '../../utils/formatters';

interface RankingClienteItem {
  nome: string;
  totalGasto: number;
  totalCompras: number;
}

interface RankingProdutoItem {
  nome: string;
  totalVendido: number;
  totalFaturado: number;
}

interface ClienteInativoItem {
  nome: string;
  ultimaAtividade: string;
}

interface FaturamentoMensalItem {
  mes: string;
  receitas: number;
  despesas: number;
}

interface DadosRelatorio {
  usuario: Usuario;
  rankingClientes: RankingClienteItem[];
  rankingProdutos: RankingProdutoItem[];
  clientesInativos: ClienteInativoItem[];
  faturamentoMensal: FaturamentoMensalItem[];
}

function diasDesde(dataIso: string): number {
  return Math.floor((Date.now() - new Date(dataIso).getTime()) / 86_400_000);
}

function secaoTitulo(doc: PDFKit.PDFDocument, titulo: string) {
  doc.moveDown(1);
  doc.fontSize(13).fillColor('#0F172A').text(titulo);
  doc.moveDown(0.3);
  doc.fontSize(10).fillColor('#334155');
}

export function gerarRelatorioPdf(dados: DadosRelatorio): PDFKit.PDFDocument {
  const { usuario, rankingClientes, rankingProdutos, clientesInativos, faturamentoMensal } = dados;
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.fontSize(20).fillColor('#2563EB').text('ClienteBox', { align: 'left' });
  doc.fontSize(9).fillColor('#64748B').text(`Emitido por ${usuario.nome} em ${new Date().toLocaleDateString('pt-BR')}`);
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor('#0F172A').text('Relatório Gerencial');

  secaoTitulo(doc, 'Resumo dos Últimos 6 Meses');
  if (faturamentoMensal.length === 0) {
    doc.text('Sem dados no período.');
  } else {
    for (const item of faturamentoMensal) {
      const saldo = item.receitas - item.despesas;
      doc.text(
        `${item.mes}: receitas ${formatarMoeda(item.receitas)} · despesas ${formatarMoeda(item.despesas)} · saldo ${formatarMoeda(saldo)}`,
      );
    }
  }

  secaoTitulo(doc, 'Top 10 Clientes');
  if (rankingClientes.length === 0) {
    doc.text('Nenhuma venda registrada ainda.');
  } else {
    rankingClientes.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.nome} — ${formatarMoeda(item.totalGasto)} (${item.totalCompras} compra(s))`);
    });
  }

  secaoTitulo(doc, 'Produtos Mais Vendidos');
  if (rankingProdutos.length === 0) {
    doc.text('Nenhuma venda com produto vinculado ainda.');
  } else {
    rankingProdutos.forEach((item, i) => {
      doc.text(`${i + 1}. ${item.nome} — ${item.totalVendido} venda(s), ${formatarMoeda(item.totalFaturado)}`);
    });
  }

  secaoTitulo(doc, 'Clientes Inativos (30+ dias sem contato)');
  if (clientesInativos.length === 0) {
    doc.text('Nenhum cliente inativo.');
  } else {
    clientesInativos.forEach((item) => {
      doc.text(`${item.nome} — há ${diasDesde(item.ultimaAtividade)} dias sem contato`);
    });
  }

  doc.moveDown(2);
  doc.fontSize(8).fillColor('#94A3B8').text('Documento gerado automaticamente pelo ClienteBox.', { align: 'center' });

  return doc;
}
