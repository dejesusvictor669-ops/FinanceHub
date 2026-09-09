# FinanceHub — migração para Vite

A migração foi preparada preservando os arquivos originais.

## Estrutura

- `js/` = arquivos originais, preservados.
- `src/` = cópias usadas pelo Vite.
- `src/main.js` = ponto de entrada.
- `dist/` = versão de produção gerada pelo Vite.
- `index.original.html` = backup do HTML original.
- `vite.config.js` = configuração do Vite.

## Rodar

No terminal, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

Para gerar a produção:

```bash
npm run build
```

Depois disso, publique a pasta `dist/`.

## Importante

A migração prioriza preservar o comportamento atual. Os arquivos de `js/` originais não são sobrescritos.
