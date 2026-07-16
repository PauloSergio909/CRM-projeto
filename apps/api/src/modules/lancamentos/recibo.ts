import PDFDocument from 'pdfkit';
import type { Lancamento, Cliente, Usuario } from '@prisma/client';
import { formatarMoeda } from '../../utils/formatters';

const rotulosFormaPagamento: Record<string, string> = {
  dinheiro: 'Dinheiro',
  pix: 'PIX',
  cartao_debito: 'Cartão de débito',
  cartao_credito: 'Cartão de crédito',
  boleto: 'Boleto',
  transferencia: 'Transferência',
  outro: 'Outro',
};

const rotulosStatus: Record<string, string> = {
  pendente: 'Pendente',
  pago: 'Pago',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
};

export function gerarReciboPdf(
  lancamento: Lancamento & { cliente: Cliente | null },
  usuario: Usuario,
): PDFKit.PDFDocument {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  doc.fontSize(20).fillColor('#2563EB').text('ClienteBox', { align: 'left' });
  doc.fontSize(9).fillColor('#64748B').text(`Emitido por ${usuario.nome}`);
  doc.moveDown(1.5);

  doc.fontSize(16).fillColor('#0F172A').text('Recibo de Pagamento');
  doc.moveDown(0.3);
  doc.fontSize(9).fillColor('#64748B').text(`Nº ${lancamento.id.slice(0, 8).toUpperCase()}`);
  doc.text(`Emitido em ${new Date().toLocaleDateString('pt-BR')}`);
  doc.moveDown(1);

  doc.fontSize(12).fillColor('#0F172A').text('Cliente');
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor('#334155');
  doc.text(lancamento.cliente?.nome ?? 'Não informado');
  if (lancamento.cliente?.telefone) doc.text(lancamento.cliente.telefone);
  if (lancamento.cliente?.cpfCnpj) doc.text(lancamento.cliente.cpfCnpj);
  doc.moveDown(1);

  doc.fontSize(12).fillColor('#0F172A').text('Detalhes');
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor('#334155');
  doc.text(`Descrição: ${lancamento.descricao}`);
  doc.text(`Data: ${lancamento.data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`);
  if (lancamento.formaPagamento) {
    doc.text(`Forma de pagamento: ${rotulosFormaPagamento[lancamento.formaPagamento] ?? lancamento.formaPagamento}`);
  }
  doc.text(`Status: ${rotulosStatus[lancamento.status] ?? lancamento.status}`);
  doc.moveDown(1.5);

  doc
    .fontSize(14)
    .fillColor('#22C55E')
    .text(`Valor: ${formatarMoeda(Number(lancamento.valor))}`, { align: 'right' });

  doc.moveDown(3);
  doc.fontSize(8).fillColor('#94A3B8').text('Documento gerado automaticamente pelo ClienteBox.', { align: 'center' });

  return doc;
}
