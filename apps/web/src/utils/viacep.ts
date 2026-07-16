export interface EnderecoViaCep {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function buscarCep(cep: string): Promise<EnderecoViaCep | null> {
  const cepLimpo = cep.replace(/\D/g, '');
  if (cepLimpo.length !== 8) return null;

  try {
    const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    if (!resposta.ok) return null;

    const dados = await resposta.json();
    if (dados.erro) return null;

    return {
      logradouro: dados.logradouro ?? '',
      bairro: dados.bairro ?? '',
      localidade: dados.localidade ?? '',
      uf: dados.uf ?? '',
    };
  } catch {
    return null;
  }
}
