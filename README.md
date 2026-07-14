# ClienteBox

CRM + Financeiro para pequenos negócios. Monorepo com API (Fastify + Prisma + PostgreSQL) e Web (React + Vite + Tailwind).

## Estrutura

```
apps/api         API Fastify (auth, clientes, categorias, lançamentos, oportunidades, dashboard)
apps/web         Frontend React
packages/shared  Tipos e schemas Zod compartilhados entre api e web
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

Usuário demo: `demo@clientebox.com.br` / `demo123` (já vem com clientes, categorias e lançamentos de exemplo).

## Scripts úteis

- `npm run db:studio` — abre o Prisma Studio
- `npm run docker:down` — derruba o Postgres local
- `npm run docker:logs` — logs do container do Postgres
- `npm run build` — build de produção de todos os workspaces

## Status

Fases 1-4 implementadas (Base/Auth, Clientes, Financeiro, Dashboard + Pipeline) — ver `CRM_FINANCEIRO_ARQUITETURA.md` pra escopo completo. Ainda não testado de ponta a ponta.

Fora de escopo por enquanto: ranking de clientes, alerta de clientes inativos, importação/exportação CSV, PWA.

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
