# Central Divas 2.0

Plataforma SaaS completa para grupos de engajamento do Instagram.

## Funcionalidades

### Para Usuárias
- Cadastro e login com foto de perfil
- Feed do dia com posts para interagir
- Sistema de tarefas (curtir, comentar, seguir)
- Acompanhamento de progresso
- Perfil personalizável

### Para Administradoras
- Dashboard com estatísticas
- Gerenciamento de participantes
- Aprovação/reprovação de cadastros
- Criação de posts e tarefas
- Sistema de avisos
- Relatórios e ranking

### Para Super Admin
- Todas as funcionalidades de admin
- Criação de administradoras
- Controle total do sistema

## Tecnologias

**Frontend:**
- React 18
- Vite
- TailwindCSS
- React Router
- Lucide Icons

**Backend:**
- Node.js
- Express
- PostgreSQL
- JWT Auth
- Multer (upload de imagens)

## Requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

## Instalação

### 1. Clone o projeto
```bash
cd D:\Divas
```

### 2. Configure o Banco de Dados

Crie um banco de dados PostgreSQL:

```sql
CREATE DATABASE central_divas;
```

### 3. Configure o Backend

```bash
cd server
npm install
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=central_divas
DB_USER=postgres
DB_PASSWORD=sua_senha_aqui
JWT_SECRET=sua_chave_secreta
```

### 4. Inicialize o Banco

```bash
npm run db:init
```

Isso criará:
- Todas as tabelas necessárias
- Super Admin padrão (admin@divas.com / admin123)
- Tarefas padrão

### 5. Inicie o Backend

```bash
npm run dev
```

### 6. Configure o Frontend

```bash
cd ../client
npm install
npm run dev
```

### 7. Acesse a Aplicação

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Credenciais Padrão

**Super Admin:**
- Email: admin@divas.com
- Senha: admin123

## API Endpoints

### Autenticação
- `POST /api/auth/register` - Cadastro
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Dados do usuário logado
- `POST /api/auth/change-password` - Alterar senha

### Usuários
- `GET /api/users` - Listar usuários (admin)
- `GET /api/users/:id` - Ver usuário
- `PUT /api/users/:id` - Atualizar usuário
- `PATCH /api/users/:id/status` - Alterar status (admin)

### Posts
- `GET /api/posts` - Listar posts
- `GET /api/posts/feed-do-dia` - Posts do dia
- `POST /api/posts` - Criar post (admin)
- `PUT /api/posts/:id` - Editar post (admin)
- `DELETE /api/posts/:id` - Excluir post (admin)

### Tarefas
- `GET /api/tarefas` - Listar tarefas
- `POST /api/tarefas` - Criar tarefa (admin)
- `PUT /api/tarefas/:id` - Editar tarefa (admin)
- `DELETE /api/tarefas/:id` - Excluir tarefa (admin)

### Conclusões
- `GET /api/conclusoes` - Listar conclusões
- `POST /api/conclusoes` - Completar tarefa
- `GET /api/conclusoes/progresso` - Progresso do dia
- `GET /api/conclusoes/ranking` - Ranking (admin)

### Avisos
- `GET /api/avisos` - Listar avisos
- `GET /api/avisos/ativos` - Avisos ativos
- `POST /api/avisos` - Criar aviso (admin)
- `PUT /api/avisos/:id` - Editar aviso (admin)
- `DELETE /api/avisos/:id` - Excluir aviso (admin)

## Estrutura do Projeto

```
Divas/
├── server/                 # Backend
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Lógica dos endpoints
│   │   ├── middleware/      # Auth middleware
│   │   ├── models/         # Modelos do banco
│   │   ├── routes/         # Rotas da API
│   │   └── index.js        # Entry point
│   ├── uploads/            # Imagens uploadadas
│   └── package.json
│
├── client/                 # Frontend
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── context/       # Contextos (Auth)
│   │   ├── pages/         # Páginas
│   │   ├── utils/         # Utilitários (API)
│   │   └── App.jsx        # App principal
│   ├── public/            # Arquivos públicos
│   └── package.json
│
└── README.md
```

## Funcionalidades Implementadas

### Auto Refresh
O sistema atualiza automaticamente os dados a cada 15-20 segundos nas páginas:
- Dashboard
- Feed do Dia
- Minhas Tarefas
- Participantes (admin)
- Relatórios

### Progresso do Dia
- Barra de progresso visual no topo do Feed do Dia
- Porcentagem de conclusão
- Mensagens motivacionais (🔥 Falta pouco! / 🎉 Parabéns!)

### Bloqueio Inteligente
- Usuárias devem clicar em "Ir para post" antes de marcar tarefa como concluída
- Evita marcações sem interação real

### Status Visual
- Indicadores em cada post (⏳ Pendente / ✅ Todas concluídas)
- Cores diferentes para posts completos vs pendentes

### Feedback Visual
- Toast notifications para tarefas concluídas
- Botões com estados visuais (visitado/não visitado)
- Loading states em botões

## Evoluindo o Sistema

### Próximos Passos Sugeridos

1. **Notificações em Tempo Real**
   - Implementar WebSockets ou Socket.io
   - Notificar participantes de novos posts

2. **Gamificação**
   - Sistema de badges/medalhas
   - Recompensas por streaks
   - Níveis de participante

3. **Integração com Instagram**
   - Usar Instagram Graph API
   - Verificar automaticamente interações
   - Validar comentários

4. **Pagamentos**
   - Integração com gateway de pagamento
   - Planos premium
   - Assinaturas

5. **Relatórios Avançados**
   - Gráficos interativos
   - Exportação de dados
   - Análise de engajamento

6. **Mobile App**
   - React Native
   - App nativo iOS/Android

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

---

Feito com 💖 para todas as divas!
