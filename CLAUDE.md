# Ads Check

## O que é
Ferramenta interna pro time de pré-vendas: uma barra de busca onde o pré-vendedor digita/cola a `utm_content` de um MQL e vê qual criativo/anúncio gerou aquele lead, pra usar gatilhos relacionados na abordagem.

## Tipo
Ferramenta interna

## Escopo
- Site com uma barra de pesquisa por `utm_content`
- Login obrigatório com Google, restrito a contas `@sieg.com`
- Fonte de dados: planilha do Google Sheets com os links dos criativos usados nas campanhas (https://docs.google.com/spreadsheets/d/1i7R4V3b9E1WNjRTwG1Z8H9VZdsHMXfDf_w9pJS9ueSM/edit)
- Preview do criativo (imagem ou vídeo) embutido no card, sem precisar clicar em nada
- Deploy na Vercel

## Contexto
- Motivo: quando o MQL chega no CRM, o pré-vendas vê a `utm_content` do lead mas não tem contexto do anúncio em si. Essa ferramenta fecha esse gap pra ajudar a fechar mais agendas.
- Planilha é pública (Publicar na Web → CSV) — dado não sensível, decisão consciente pra simplificar o acesso.
- Os arquivos de criativo no Drive são restritos ao domínio `@sieg.com` (não são públicos). O preview embutido do Drive pedia login do Google a cada busca e não persistia entre refreshes (bloqueio de cookies de terceiros do navegador). Resolvido com login próprio da ferramenta (restrito a `@sieg.com`) + proxy de mídia via Service Account — o usuário nunca é redirecionado pro login do Drive.
- Prazo: pronto ainda hoje (2026-07-23). Escopo deve ficar enxuto pra bater o prazo.

## Arquivos importantes
- `api/creatives.js` — serverless function (Vercel) que busca o CSV da aba "identificação de anuncios" da planilha, exige sessão válida, e enriquece cada linha com `fileId` e `mimeType` do Drive
- `api/media/[id].js` — Edge function que faz proxy do arquivo do Drive (via Service Account), com suporte a Range request pra vídeo
- `api/auth/google.js` — verifica o ID token do Google Sign-In, valida domínio `@sieg.com` e cria a sessão (cookie httpOnly)
- `api/session.js` / `api/auth/logout.js` — checar/encerrar sessão
- `api/_lib/session.js` — assina/verifica o cookie de sessão (JWT HS256 via `jose`)
- `api/_lib/driveAuth.js` — troca a chave da Service Account por um access token do Google (JWT RS256 via `jose`)
- `src/Login.jsx` — botão "Sign in with Google" (Google Identity Services), com `hd: sieg.com`
- `src/App.jsx` — gate de login + busca por `utm_content` + preview via `/api/media/:id`
- `vite.config.js` — middleware de dev que simula as serverless/edge functions da Vercel localmente (`npm run dev` já funciona sem `vercel dev`)
- `marca-sieg/design-guide.md` (no projeto-sieg) — guia de marca usado pro visual (linha Institucional)

## Regras específicas
- ID da planilha e gid da aba têm fallback hardcoded em `api/creatives.js`, mas podem ser sobrescritos via env vars `GOOGLE_SHEET_ID` e `GOOGLE_SHEET_GID`
- Visual segue a linha **SIEG · Institucional** (azul, claro) — nunca misturar com paleta Performance/Growth (roxo, escuro)
- Nunca commitar `.env` nem a chave da Service Account — sempre via variáveis de ambiente (local em `.env`, produção nas env vars da Vercel)

## Setup necessário no Google Cloud (login + acesso ao Drive)

Precisa ser feito uma vez, por quem tem acesso ao Google Cloud da SIEG. Depois de feito, preencher as env vars localmente em `.env` e na Vercel (Project Settings → Environment Variables).

**1. OAuth Client ID (login restrito a @sieg.com)**
1. [console.cloud.google.com](https://console.cloud.google.com) → escolher/criar um projeto
2. Se ainda não configurado: APIs & Services → OAuth consent screen → User type **Internal** (isso já restringe o login à organização Google Workspace da SIEG)
3. APIs & Services → Credentials → Create Credentials → **OAuth client ID** → tipo **Web application**
4. Em "Authorized JavaScript origins", adicionar a URL da Vercel (ex: `https://sieg-ads-check.vercel.app`) e `http://localhost:5173` (dev)
5. Copiar o Client ID (`....apps.googleusercontent.com`) → env vars `GOOGLE_CLIENT_ID` e `VITE_GOOGLE_CLIENT_ID` (mesmo valor nas duas)

**2. Service Account (ler os criativos do Drive sem pedir login de cada pessoa)**
1. Mesmo projeto → IAM & Admin → Service Accounts → Create Service Account
2. APIs & Services → Library → habilitar **Google Drive API**
3. Criar uma chave JSON pra essa service account (Keys → Add key → JSON)
4. Compartilhar a pasta do Drive que contém os criativos com o e-mail da service account (campo `client_email` do JSON), como Leitor
5. Colar o conteúdo do JSON (inteiro, em uma linha) na env var `GOOGLE_SERVICE_ACCOUNT_KEY`

**3. Variáveis de ambiente necessárias**
- `SESSION_SECRET` — já gerado localmente em `.env`; gerar outro valor aleatório pra produção e configurar na Vercel
- `ALLOWED_GOOGLE_DOMAIN` — `sieg.com` (já é o padrão no código)
- `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` — do passo 1
- `GOOGLE_SERVICE_ACCOUNT_KEY` — do passo 2
