# Diretrizes do Projeto — Enxaquecator

## 1. Princípios de UX e UI Minimalista
- **Registro Direto na Tela Inicial**: Mantenha o formulário de registro ágil e direto na tela inicial (evitar modais para a ação primária do diário).
- **Divulgação Progressiva**: Mantenha no corpo principal do formulário: Tipo do Episódio, Remédios Rápidos e Descrição/Observações. A seção retrátil colapsada abriga exclusivamente os detalhamentos opcionais (intensidade de dor, sintomas e gatilhos).
- **Modo de Edição com Destaque Visual**: Quando o formulário for usado para edição (`existingCrisis`), aplicar obrigatoriamente uma cor de fundo contrastante (tom âmbar suave/destacado), banner indicativo e botão de ação "Atualizar Registro" para que fique evidente que se trata de uma alteração de dados já salvos.
- **Padrões e Ícones Clínicos**:
  - Tipo padrão: `presenca` (ícone oficial obrigatório: **`🌀`**, nunca usar `🌫️`)
  - Dor: **`💥`** | Aura: **`✨`**
  - Intensidade padrão: `null`
- **Visualização do Calendário**: Preencher o fundo das células com a cor da categoria (Azul = Presença `🌀`, Laranja/Vermelho = Dor `💥`, Roxo = Aura `✨`) e marcar dias com medicação usando o indicador `💊`.
- **Estilo de Textos**: Evitar textos e slogans genéricos de preenchimento nos formulários.

## 2. Favicons e Requisitos PWA
- **Favicons**: Manter o favicon em SVG vetorial limpo, transparente e centralizado de ponta a ponta sem bordas escuras desproporcionais, acompanhado de `favicon.ico` com múltiplas resoluções para barra de favoritos.
- **Suíte PWA**: Manter sempre os arquivos `favicon.ico`, PNGs de 192x192, 512x512 (com suporte a `maskable`), `apple-touch-icon.png` e `favicon-32x32.png` na pasta `public/` e sincronizados com `vite.config.ts`.

## 3. Controle e Acompanhamento de Versão
- **Versionamento Contínuo a Cada Push**: A cada novo push/deploy, aumente a versão (ex: 1.0.0 -> 1.0.1 -> 1.0.2) mantendo-a sincronizada em `package.json`, em `src/utils/constants.ts` (`APP_VERSION`) e exibida na interface.
- **Estilo Minimalista da Versão**: Na Navbar, o número da versão (`vX.X.X`) deve ser exibido de forma limpa, apenas como texto discreto em fonte reduzida, sem bordas ou fundo de caixa.

## 4. Publicação e CI/CD
- **Deploy Automático via GitHub Actions**: O repositório possui CI/CD configurado em `.github/workflows/firebase-hosting-merge.yml`, que roda o build e o deploy automaticamente no Firebase Hosting a cada push na `main`.
- **Proibição de Deploy Manual**: **Não execute** `npm run deploy` ou comandos manuais do Firebase Hosting na máquina local; apenas valide localmente com `npm run build` e faça o `git push origin main`.
