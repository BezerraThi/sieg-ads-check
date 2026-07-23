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
- (será preenchido conforme o projeto avança)

## Regras específicas
- Nunca commitar credenciais/API key da integração com Google Sheets em texto puro — sempre em `.env` (ignorado pelo git)
- Como a planilha é restrita ao domínio @sieg, avaliar a forma de acesso (service account do Google, API key, ou publicação restrita) sem expor a planilha publicamente
