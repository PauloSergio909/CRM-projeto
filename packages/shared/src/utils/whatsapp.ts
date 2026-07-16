export function whatsappLink(telefone: string, mensagem?: string): string {
  const digits = telefone.replace(/\D/g, '');
  const withCountryCode = digits.startsWith('55') ? digits : `55${digits}`;
  const base = `https://wa.me/${withCountryCode}`;
  return mensagem ? `${base}?text=${encodeURIComponent(mensagem)}` : base;
}
