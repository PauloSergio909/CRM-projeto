# ClienteBox

CRM + Financeiro para pequenos negócios. Monorepo com API (Fastify + Prisma + PostgreSQL) e Web (React + Vite + Tailwind).

## Estrutura

```
apps/api         API Fastify (auth, clientes, categorias, lançamentos, oportunidades, dashboard)
apps/web         Frontend React (o CRM em si)
apps/marketing   Landing page pública (site de uma página, deploy separado)
packages/shared  Tipos, schemas Zod e utils compartilhados entre os apps
```

## Pré-requisitos

- Node.js 20+ e npm
- Docker Desktop (para o Postgres local)

## Setup local

```bash
npm install
npm run docker:up          # sobe o Postgres local (porta 5433)
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm run db:migrate
npm run db:seed            # cria usuário demo + dados de exemplo
npm run dev                # api em :3333, web em :5173
```

Usuário demo: `demo@clientebox.com.br` / `demo123` — vem com 10 clientes (variando status/tags/saúde), 5 produtos, ~6 meses de lançamentos (pagos, pendentes e vencidos), 10 oportunidades espalhadas pelas 5 etapas do pipeline, meta do mês, aniversariante da semana e log de auditoria de exemplo — dá pra ver todas as telas com dado de verdade sem precisar cadastrar nada na mão.

Pra trabalhar na landing page (`apps/marketing`, roda à parte do `npm run dev` normal):

```bash
cp apps/marketing/.env.example apps/marketing/.env   # VITE_APP_URL aponta pro CRM (padrão: localhost:5173)
npm run dev:marketing                                 # landing em :5174
```

## Scripts úteis

- `npm run db:studio` — abre o Prisma Studio
- `npm run db:seed:demo-reset` — apaga e recria os dados da conta demo (clientes/lançamentos voltam ao estado original do seed; categorias são mantidas). Rodar antes de mandar o link do modo demonstração pra um novo prospect, já que é uma conta única compartilhada.
- `npm run docker:down` — derruba o Postgres local
- `npm run docker:logs` — logs do container do Postgres
- `npm run build` — build de produção de todos os workspaces (inclui `apps/marketing`)

## Status

Fases 1-4 implementadas (Base/Auth, Clientes, Financeiro, Dashboard + Pipeline) + Leva 1 (recorrência automática, ranking de clientes, clientes inativos, filtro de período no Dashboard, CSV, PWA) + Leva 2 (ViaCEP, aniversário de cliente) + Leva 3 (catálogo de produtos/serviços, ranking de produtos, recibo em PDF) + Leva 4 (metas mensais de faturamento, tags de cliente) + Leva 5 (log de auditoria, relatório gerencial em PDF) + Leva 6 (onboarding guiado, duplicatas inteligentes) + Leva 7 (previsão de faturamento, score de saúde do cliente) + Leva 8 (landing page pública, modo demonstração) — ver `CRM_FINANCEIRO_ARQUITETURA.md` pra escopo completo. Essa foi a última leva planejada do relatório do mentor; próximos passos ficam por conta de novo feedback.

**Nota sobre a landing page e o modo demonstração**: `apps/marketing/src/App.tsx` usa um número de WhatsApp placeholder (`TELEFONE_CONTATO`, marcado com `TODO`) — trocar pelo número real antes de publicar. O hero usa um mockup do Dashboard construído em HTML/CSS, não uma screenshot real (trocar quando tiver capturas de tela de verdade). O modo demonstração (`/demo` no CRM) loga automaticamente na conta `demo@clientebox.com.br` — é uma conta única compartilhada entre todos os visitantes, então rode `npm run db:seed:demo-reset` antes de mandar o link pra um novo prospect. **Publicar de verdade (Vercel ou outro) é passo manual**: `apps/marketing` é um app Vite comum — no Vercel, aponte o "Root Directory" pra `apps/marketing` e defina a env var `VITE_APP_URL` com a URL do CRM já publicado (`apps/web`, que por sua vez precisa de `VITE_API_URL` apontando pra API publicada).

**Nota sobre previsão de faturamento e score de saúde**: ambos são calculados on-the-fly (sem novos campos persistidos). A previsão usa pesos de probabilidade por etapa do funil (`contato: 10%`, `negociacao: 35%`, `proposta: 60%`) — um critério estimado, não uma regra de negócio existente antes desta leva; ajustar os pesos em `dashboard.service.ts::PESO_ETAPA` se não fizer sentido pro seu funil real.

**Nota sobre o onboarding**: só é mostrado a contas com `onboardingConcluido=false` — contas criadas antes da Leva 6 foram marcadas manualmente como já concluídas (`UPDATE usuarios SET onboarding_concluido = true`) pra não reaparecer pra quem já usa o sistema.

**Nota sobre PWA**: os ícones em `apps/web/public/icons/` (`icon-192.png`, `icon-512.png`) são placeholder gerados programaticamente (quadrado azul `#2563EB`) — trocar pelos ícones da marca de verdade antes de publicar.

**Nota sobre datas "só data"** (`dataNascimento`, e potencialmente `data`/`dataVencimento` de lançamentos): são armazenadas como meia-noite UTC. Comparações/exibições feitas com `getMonth()`/`getDate()`/`toLocaleDateString()` em hora local "voltam" um dia em fusos atrás de UTC (ex.: America/Sao_Paulo) — sempre usar os métodos `getUTC*()` ou `{timeZone:'UTC'}` pra esses campos. Corrigido no fluxo de aniversariantes; vale revisar se aparecer o mesmo sintoma em outro lugar.

**Nota sobre o recibo em PDF**: sem logo de verdade (não existe cadastro de dados da empresa ainda) — usa "ClienteBox" + nome do usuário como cabeçalho. Só disponível pra lançamentos com cliente vinculado.

Fora de escopo por enquanto: modo escuro (leva separada, planejada — mexe em ~31 arquivos), multi-usuário/permissões (precisa de plano próprio, muda a arquitetura de tenant).

## Checklist de teste manual

Depois do `npm run dev`, acesse `http://localhost:5173`.

**Auth**
- [ ] Login com o usuário demo
- [ ] Cadastro de um usuário novo em `/cadastro` → deve logar automaticamente e já vir com categorias padrão em Configurações
- [ ] Reload da página mantém a sessão (sem redirecionar pro login)
- [ ] Logout limpa a sessão e redireciona pro login
- [ ] Deixar o token expirar (ou apagar `accessToken` do localStorage mantendo o `refreshToken`) e navegar → deve renovar sozinho sem deslogar

**Clientes**
- [ ] Lista carrega os clientes do seed, busca por nome/telefone/email funciona, filtro por status funciona
- [ ] Criar, editar e alternar status (ativo/inativo) de um cliente
- [ ] Abrir a ficha do cliente, ver histórico de interações do seed, registrar uma interação nova
- [ ] Botão do WhatsApp abre `wa.me` com o telefone do cliente
- [ ] Logar com um segundo usuário e confirmar que ele **não** vê os clientes do usuário demo

**Financeiro**
- [ ] Em Configurações, ver as categorias padrão, criar uma nova, editar, desativar
- [ ] Criar um lançamento de receita e um de despesa (com categoria, cliente e forma de pagamento)
- [ ] `/financeiro/contas-a-pagar` só mostra despesas; `/financeiro/contas-a-receber` só mostra receitas
- [ ] Criar um lançamento com vencimento no passado e status pendente → deve virar "vencido" ao recarregar a lista
- [ ] Botão "Marcar como pago" muda o status com um clique
- [ ] Filtro por período (data início/fim) e por categoria funcionam

**Pipeline**
- [ ] Criar 2-3 oportunidades vinculadas a clientes
- [ ] Arrastar um card entre colunas e dentro da mesma coluna — a ordem persiste após F5
- [ ] Mover um card pra "Fechado (Perdido)" abre o modal pedindo o motivo
- [ ] Total por coluna (quantidade + valor) bate com os cards visíveis

**Dashboard**
- [ ] KPIs de receitas/despesas/saldo do mês batem com os lançamentos pagos criados
- [ ] Variação % vs mês anterior aparece corretamente
- [ ] Contador de "Clientes Novos" reflete os clientes criados no mês
- [ ] "Contas a Vencer" reflete lançamentos pendentes vencendo nos próximos 7 dias
- [ ] Gráfico de faturamento mensal e de despesas por categoria renderizam sem erro
- [ ] Feed de atividades mostra interações, pagamentos e novos clientes recentes, mais recentes primeiro
- [ ] Trocar o mês no seletor no topo → KPIs e gráfico de despesas por categoria mudam pro mês selecionado

**Leva 1 (recorrência, relatórios, CSV, PWA)**
- [ ] Marcar um lançamento como recorrente com data de 2-3 meses atrás → recarregar `/financeiro` → lançamentos dos meses intermediários aparecem automaticamente, sem duplicar ao recarregar de novo
- [ ] `/relatorios` → ranking de clientes bate com os lançamentos pagos existentes
- [ ] `/relatorios` → clientes sem interação/venda há mais de 30 dias aparecem na lista de inativos, com botão de WhatsApp
- [ ] `/clientes` → "Exportar CSV" baixa um arquivo com os clientes atuais
- [ ] `/clientes` → "Importar CSV" com o arquivo exportado (ou editado) cria os clientes e mostra o resumo de importados/erros
- [ ] `npm run build` em `apps/web` gera `manifest.webmanifest` e um service worker; "Instalar app" aparece no Chrome

**Leva 2 (ViaCEP, aniversário)**
- [ ] No formulário de cliente, digitar um CEP válido (ex: `01310-100`) e sair do campo → endereço/cidade/estado preenchem sozinhos
- [ ] Cadastrar um cliente com data de nascimento igual a hoje (ou nos próximos 7 dias) → aparece no card "Aniversariantes da Semana" do Dashboard, com botão de WhatsApp
- [ ] Cliente sem aniversariante na semana → card não aparece no Dashboard
- [ ] Exportar CSV de clientes → coluna `cep` aparece com o valor certo

**Leva 3 (catálogo de produtos, recibo em PDF)**
- [ ] Em Configurações, cadastrar um produto/serviço com preço e categoria
- [ ] Criar um lançamento de receita, selecionar o produto no formulário → descrição e valor preenchem sozinhos (ainda editáveis)
- [ ] `/relatorios` → "Produtos Mais Vendidos" reflete os lançamentos pagos vinculados a produtos
- [ ] Num lançamento com cliente vinculado, clicar em "Recibo" → baixa um PDF válido com cliente, valor, data e forma de pagamento
- [ ] Num lançamento sem cliente vinculado, o botão "Recibo" não aparece

**Leva 4 (metas mensais, tags de cliente)**
- [ ] No Dashboard, definir uma meta de faturamento pro mês atual → barra de progresso aparece com o valor de receitas do mês
- [ ] Marcar lançamentos de receita como pagos até ultrapassar a meta → badge "Meta batida!" aparece
- [ ] Trocar o mês no seletor do Dashboard → meta mostrada é a daquele mês (ou CTA "Definir meta" se não houver)
- [ ] Cadastrar um cliente com tags (ex: "VIP", "atacado") → aparecem como chips na ficha do cliente e na lista
- [ ] Em `/clientes`, filtrar pelo select de tags → só os clientes com aquela tag aparecem
- [ ] Exportar CSV de clientes → coluna `tags` com valores separados por `;`; editar e reimportar → tags voltam como array

**Leva 5 (log de auditoria, relatório em PDF)**
- [ ] Criar/editar/mudar status de um cliente, um lançamento e uma oportunidade → `/auditoria` mostra as entradas correspondentes, mais recentes primeiro
- [ ] Filtro por entidade em `/auditoria` funciona
- [ ] Definir uma meta → aparece no log de auditoria
- [ ] Em `/relatorios`, clicar "Baixar PDF" → baixa um PDF válido com resumo de 6 meses, ranking de clientes, produtos mais vendidos e clientes inativos

**Leva 6 (onboarding guiado, duplicatas inteligentes)**
- [ ] Cadastrar um usuário novo → após o login, o tour aparece automaticamente e guia por Dashboard/Clientes/Financeiro; "Pular" ou concluir o último passo fecha o tour e não aparece de novo num próximo login
- [ ] Ao cadastrar um cliente com nome ou telefone (ignorando formatação) igual a um já existente, aparece um aviso âmbar não-bloqueante no formulário — "Salvar" continua funcionando

**Leva 7 (previsão de faturamento, score de saúde do cliente)**
- [ ] Card "Previsão de Faturamento" no Dashboard mostra um total condizente com lançamentos recorrentes de receita × 3 + pipeline ponderado por etapa
- [ ] Cliente ativo com venda paga recente tem selo "Saudável"; sem nenhuma venda/interação tem selo "Atenção"; com lançamento vencido tem selo "Em risco" mesmo com atividade recente
- [ ] Cliente inativo não mostra selo de saúde
- [ ] Ticket médio aparece na ficha do cliente quando ele já teve pelo menos uma venda paga

**Leva 8 (landing page pública, modo demonstração)**
- [ ] `npm run dev:marketing` sobe a landing em `:5174` com hero, funcionalidades, planos e footer
- [ ] Botão "Ver demonstração" abre `{VITE_APP_URL}/demo` e loga automaticamente na conta demo, caindo no Dashboard com os dados de exemplo
- [ ] Acessar `/demo` já logado numa conta real mostra o aviso de confirmação em vez de trocar de conta direto
- [ ] `npm run db:seed:demo-reset` restaura os clientes/lançamentos da conta demo ao estado original, mesmo depois de mexidas feitas via `/demo`
- [ ] Botões de WhatsApp na landing abrem o wa.me com a mensagem pré-preenchida
