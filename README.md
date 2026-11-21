# Renda+ (FinanceHub)

Aplicativo web de controle financeiro pessoal, com visual "liquid glass" e instalável no celular (PWA).

## O que faz

- **Visão geral:** saldo, lazer, investimentos e reserva de emergência em cartões clicáveis.
- **Entradas e gastos:** renda extra, gastos por categoria e compras no cartão.
- **Investimentos e metas:** aportes (reserva ou investimento) e metas com progresso.
- **Relatórios e gráficos**, lista de compras e calculadora.
- **Atalhos (iPhone e Android):** no Android, atalhos ao segurar o ícone do app instalado; no iPhone, Siri e toque nas costas. Usam links que abrem o app já preenchido, ou que salvam sozinhos com uma chave secreta da sua conta (página *Atalhos* dentro do app).
- **LGPD:** Termos de Uso, Política de Privacidade, aceite obrigatório no cadastro e menu *Privacidade* para baixar ou apagar os próprios dados.
- **Segurança de login:** limite de tentativas com bloqueio progressivo.
- Temas de cor (azul por padrão), modo escuro e claro.

## Tecnologias

- Vite 7 + JavaScript puro (arquivos em `js/` reunidos por `vite-plugin-financehub.js`)
- Supabase (autenticação e banco de dados, com RLS por usuário)
- Chart.js, Font Awesome
- Hospedagem na Vercel (deploy automático a cada push na branch `main`)

## Como rodar localmente

Requer Node.js (versão LTS).

```bash
npm install
npm run dev      # servidor local em http://localhost:5173
npm run build    # gera a pasta dist/
```

> Abra sempre pelo servidor (`npm run dev`). Abrir o `index.html` direto no navegador não funciona.

## Banco de dados (Supabase)

1. Crie a tabela `dados_financeiros` (uma linha por usuário, colunas JSONB para gastos, cartões, investimentos etc.).
2. (Opcional) Rode [`database/excluir_conta.sql`](database/excluir_conta.sql) para permitir que o usuário exclua a própria conta pelo app.
3. Rode o arquivo [`database/seguranca.sql`](database/seguranca.sql) no SQL Editor para ativar o RLS, de modo que cada usuário veja apenas os próprios dados.
3. Coloque a URL do projeto e a chave **pública** (`anon`) em `js/supabase.js`.

## Segurança

- Use somente a chave pública (`anon`) no código. **Nunca** publique a chave `service_role` nem arquivos `.env`.
- A proteção dos dados é feita pelo RLS do Supabase.
- Para reforçar contra força bruta, confira também *Authentication > Rate Limits* no painel do Supabase.

## Estrutura

```
assets/   ícones, manifest e bibliotecas
css/      estilos (tokens, componentes, polish)
database/ SQL de segurança
js/       lógica do app (um arquivo por área)
src/      ponto de entrada do Vite
```