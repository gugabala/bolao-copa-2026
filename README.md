# ⚽ Bolão Copa do Mundo 2026

Sistema de bolão para a Copa do Mundo 2026, com cadastro de usuários, apostas por partida e ranking de pontuação.

## Tecnologias

### Backend
- **Node.js** com **TypeScript**
- **Fastify** — servidor HTTP
- **tRPC** — API type-safe entre backend e frontend
- **Prisma ORM** — acesso ao banco de dados com migrations
- **PostgreSQL** — banco de dados relacional
- **Docker** — container do banco com timezone configurado para `America/Sao_Paulo`
- **bcryptjs** — hash de senhas
- **jsonwebtoken** — autenticação via JWT

### Frontend
- **React 19** com **TypeScript**
- **Vite** — bundler
- **shadcn/ui** + **Radix UI** — componentes de interface
- **Tailwind CSS v4** — estilização
- **TanStack Query** — gerenciamento de estado assíncrono
- **tRPC React Query** — integração type-safe com o backend
- **Zustand** — estado global (autenticação)
- **React Router DOM** — roteamento
- **Sonner** — notificações toast

---

## Como rodar o projeto

### Pré-requisitos
- Node.js >= 20
- Docker
- Git

### Backend

```bash
# Subir o banco de dados
docker compose up -d

# Instalar dependências
cd bolao-copa-back
npm install

# Gerar o cliente Prisma
npm run db:generate

# Rodar as migrations
npm run db:migrate

# Popular o banco (admin + partidas)
npm run db:seed

# Iniciar o servidor
npm run dev
```

O backend sobe em `http://localhost:3333`.

### Frontend

```bash
cd bolao-copa-front
npm install
npm run dev
```

O frontend sobe em `http://localhost:5173`.

### Credenciais iniciais

| Campo | Valor |
|-------|-------|
| Email | `gugabala@gmail.com` |
| Senha | `admin123` |
| Perfil | Super Admin |

---

## Perfis de usuário

| Perfil | Permissões |
|--------|------------|
| `SUPER_ADMIN` | Tudo — incluindo criar e promover admins |
| `ADMIN` | Cadastrar resultados, criar usuários comuns |
| `USUARIO` | Fazer apostas, ver ranking |

---

## Regras do Bolão

### Apostas

- O usuário deve apostar o placar exato de cada partida
- A aposta só pode ser feita até **30 minutos antes** do horário oficial da partida
- Após confirmada, a aposta **não pode ser alterada**
- Partidas do mata-mata marcadas como "A definir" não aceitam apostas até os times serem definidos pelo admin

### Placar no mata-mata

O resultado considera todos os gols marcados:
- Tempo normal
- Prorrogação
- Pênaltis (os gols de pênalti somam ao placar)

### Pontuação

| Situação | Pontos |
|----------|--------|
| Acertou o **placar exato** | **10 pontos** |
| Acertou o **vencedor** (mas não o placar) | **5 pontos** |
| Acertou que seria **empate** (mas não o placar exato) | **3 pontos** |
| Errou | **0 pontos** |

### Exemplos

| Aposta | Resultado | Tipo | Pontos |
|--------|-----------|------|--------|
| 2 × 1 | 2 × 1 | Placar exato | 10 |
| 1 × 1 | 1 × 1 | Placar exato (empate) | 10 |
| 2 × 1 | 3 × 1 | Vencedor certo | 5 |
| 2 × 2 | 1 × 1 | Empate (placar errado) | 3 |
| 2 × 1 | 0 × 1 | Erro | 0 |
| 1 × 0 | 1 × 0 + pênaltis | Placar exato | 10 |
| 2 × 1 | 2 × 0 + pênaltis | Vencedor certo | 5 |

### Correção de resultados

O admin pode corrigir um resultado já lançado. Ao corrigir, o sistema **recalcula automaticamente** a pontuação de todos os usuários que apostaram naquela partida.

---

## Estrutura do projeto

```
bolao-copa-2026/
├── bolao-copa-back/          # Backend
│   ├── prisma/
│   │   ├── schema.prisma     # Modelo do banco de dados
│   │   └── seed.ts           # Dados iniciais
│   ├── src/
│   │   ├── lib/
│   │   │   ├── prisma.ts     # Cliente do banco
│   │   │   ├── trpc.ts       # Configuração tRPC e middlewares
│   │   │   └── pontuacao.ts  # Lógica de cálculo de pontos
│   │   ├── routers/
│   │   │   ├── auth.ts       # Login e autenticação
│   │   │   ├── admin.ts      # Rotas administrativas
│   │   │   └── aposta.ts     # Apostas e ranking
│   │   └── index.ts          # Entry point
│   └── .env.example
├── bolao-copa-front/         # Frontend
│   └── src/
│       ├── components/
│       │   ├── ui/           # Componentes shadcn
│       │   ├── layout/       # Layout e rotas protegidas
│       │   └── ApostarDialog.tsx
│       ├── hooks/
│       │   └── useAuth.ts    # Estado de autenticação
│       ├── lib/
│       │   └── trpc.ts       # Cliente tRPC
│       └── pages/
│           ├── auth/         # Login
│           ├── partidas/     # Lista de partidas e apostas
│           ├── ranking/      # Ranking de pontuação
│           └── admin/        # Painel administrativo
└── docker-compose.yml
```
