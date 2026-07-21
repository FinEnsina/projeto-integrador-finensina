# FinEnsina — Migração para Next.js (100% Vercel)

Este projeto substitui o backend antigo em PHP (que não funciona na Vercel)
por API Routes do Next.js + Prisma, mantendo o mesmo visual e comportamento
do site original. O front-end (`index.html`, `style.css`, `script.js`)
continua praticamente idêntico — só as URLs de `backend/*.php` foram
trocadas por `/api/*`.

## O que mudou

| Antes (PHP)                    | Agora (Next.js API Route) |
|---------------------------------|----------------------------|
| `backend/login.php`             | `pages/api/login.js`       |
| `backend/register.php`          | `pages/api/register.js`    |
| `backend/get_trilhas.php`       | `pages/api/trilhas.js`     |
| `backend/get_perguntas.php`     | `pages/api/perguntas.js`   |
| `backend/get_ranking.php`       | `pages/api/ranking.js`     |
| `backend/get_progresso.php`     | `pages/api/progresso.js`   |
| `backend/save_progress.php`     | `pages/api/save-progress.js` |
| MySQL (PDO)                     | PostgreSQL (Prisma ORM)    |

As tabelas do banco (`trilhas`, `perguntas`, `ranking`, `conquistas` etc.)
nunca tinham um `.sql` commitado no repositório original — só existiam no
MySQL local. Elas foram reconstruídas em `prisma/schema.prisma`, e o
conteúdo (5 trilhas, 25 perguntas de educação financeira, 5 conquistas) foi
recriado em `prisma/seed.js`.

## Passo a passo para colocar no ar

### 1. Criar um banco de dados Postgres gratuito

Mais simples: usar o **Vercel Postgres** (é só um clique, já integra
automaticamente com o projeto):

1. No dashboard da Vercel, abra o projeto → aba **Storage**
2. **Create Database** → escolha **Postgres**
3. Depois de criado, clique em **Connect Project** e selecione este projeto
   — a Vercel já cria a variável de ambiente `DATABASE_URL` sozinha

Alternativa: [neon.tech](https://neon.tech) ou [supabase.com](https://supabase.com)
(gratuitos), copiando a connection string para `DATABASE_URL` manualmente
nas configurações do projeto na Vercel.

### 2. Substituir os arquivos no repositório

Apague o conteúdo antigo do repositório (pasta `backend/` em PHP,
`index.html`, `script.js`, `style.css` na raiz) e coloque todos os arquivos
deste pacote no lugar, mantendo a mesma estrutura de pastas.

```bash
cd caminho/para/projeto-integrador-finensina
git pull origin main

# remova os arquivos antigos do site (PHP e estáticos na raiz)
git rm -r backend index.html script.js style.css

# copie todo o conteúdo deste pacote (finensina-next) para a raiz do repo
# (mantendo pages/, public/, prisma/, lib/, package.json, etc.)

git add .
git commit -m "Migra backend de PHP para Next.js + Prisma (compatível com Vercel)"
git push origin main
```

### 3. Configurar variáveis de ambiente localmente (para popular o banco)

```bash
npm install
cp .env.example .env
# edite .env e cole a DATABASE_URL do seu banco (Vercel Postgres/Neon/Supabase)

npx prisma db push      # cria as tabelas no banco
npm run db:seed          # popula trilhas, perguntas e conquistas
```

### 4. Deploy

Como o repositório já está conectado à Vercel, o push no passo 2 já dispara
um novo deploy automaticamente. Se preferir, rode manualmente:

```bash
npx vercel --prod
```

### 5. Testar

Acesse a URL do projeto na Vercel e confira:
- Login / cadastro de usuário
- Trilhas carregando (5 trilhas com 5 perguntas cada)
- Quiz funcionando e salvando progresso
- Ranking exibindo resultados
- "Meu Progresso" mostrando conquistas e histórico

## Rodando localmente

```bash
npm install
cp .env.example .env   # configure DATABASE_URL
npx prisma db push
npm run db:seed
npm run dev
```

Acesse `http://localhost:3000`.

## Segurança

- **Nunca** commite o arquivo `.env` (já está no `.gitignore`)
- Senhas de usuário são armazenadas com hash `bcrypt` (nunca em texto puro)
- Se em algum momento quiserem reativar a tentativa de login com Google,
  usem `NEXTAUTH_SECRET` e `GOOGLE_CLIENT_SECRET` como variáveis de
  ambiente na Vercel — nunca dentro de um arquivo commitado no Git
