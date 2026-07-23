# Ads Check

## O que é
Ferramenta interna pro time de pré-vendas: uma barra de busca onde o pré-vendedor digita/cola a `utm_content` de um MQL e vê qual criativo/anúncio gerou aquele lead, pra usar gatilhos relacionados na abordagem.

## Tipo
Ferramenta interna

## Escopo
- Site com uma barra de pesquisa por `utm_content`
- Fonte de dados: planilha do Google Sheets com os links dos criativos usados nas campanhas (https://docs.google.com/spreadsheets/d/1i7R4V3b9E1WNjRTwG1Z8H9VZdsHMXfDf_w9pJS9ueSM/edit)
- Sem login — acesso livre pro time de pré-vendas
- Deploy na Vercel

## Contexto
- Motivo: quando o MQL chega no CRM, o pré-vendas vê a `utm_content` do lead mas não tem contexto do anúncio em si. Essa ferramenta fecha esse gap pra ajudar a fechar mais agendas.
- Planilha é visível apenas pro domínio de e-mail @sieg (não é pública) — a integração precisa respeitar essa restrição de acesso.
- Prazo: pronto ainda hoje (2026-07-23). Escopo deve ficar enxuto pra bater o prazo.

## Arquivos importantes
- `api/creatives.js` — serverless function (Vercel) que busca o CSV da aba "identificação de anuncios" da planilha e retorna como JSON
- `src/App.jsx` — busca por `utm_content` e preview inline do criativo (iframe do Drive)
- `vite.config.js` — tem um middleware de dev que simula a serverless function localmente (`npm run dev` já funciona sem `vercel dev`)
- `marca-sieg/design-guide.md` (no projeto-sieg) — guia de marca usado pro visual (linha Institucional)

## Regras específicas
- A planilha foi deixada pública (Publicar na Web → CSV) por decisão do usuário — dado não sensível (links de criativos), decisão consciente do trade-off de acesso
- ID da planilha e gid da aba têm fallback hardcoded em `api/creatives.js`, mas podem ser sobrescritos via env vars `GOOGLE_SHEET_ID` e `GOOGLE_SHEET_GID`
- Visual segue a linha **SIEG · Institucional** (azul, claro) — nunca misturar com paleta Performance/Growth (roxo, escuro)
