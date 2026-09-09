# FinanceHub — Vite (migração corrigida)

Esta versão usa Vite sem reescrever os 20 arquivos JavaScript originais.

- `js/` continua sendo a fonte original e legível.
- `src/main.js` é apenas o ponto de entrada.
- `vite-plugin-financehub.js` lê os arquivos de `js/` na ordem original e os transforma em um bundle único no build.
- Funções usadas pelo HTML continuam expostas em `globalThis`, preservando o comportamento anterior.
- `index.original.html` é o backup do HTML original.
- Não existe `src/ofuscar.js`.

## Rodar

```powershell
npm install
npm run dev
```

## Produção

```powershell
npm run build
```

O resultado fica em `dist/`.

## Importante

Edite os arquivos em `js/` normalmente. Não edite o bundle de `dist/`.
A ofuscação será uma etapa separada depois que o build e todas as funções forem validados.
