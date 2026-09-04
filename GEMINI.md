# Diretrizes do Projeto — Enxaquecator

## 1. Princípios de UX e UI Minimalista
- **Registro Direto na Tela Inicial**: Mantenha o formulário de registro ágil e direto na tela inicial (evitar modais para a ação primária do diário).
- **Divulgação Progressiva**: Mantenha o topo com Tipo, Remédios Rápidos e Descrição/Observações visíveis na frente do formulário. Campos adicionais de detalhamento (intensidade, sintomas e gatilhos) ficam organizados na seção retrátil colapsada.
- **Padrões Clínicos de Registro**:
  - Tipo padrão: `presenca`
  - Intensidade padrão: `null`
- **Visualização do Calendário**: Preencher o fundo das células com a cor da categoria (Azul = Presença, Laranja/Vermelho = Dor, Roxo = Aura) e marcar dias com medicação usando o indicador `💊`.

## 2. Favicons e Requisitos PWA
- **Favicons**: Manter o favicon em SVG vetorial limpo, transparente e centralizado de ponta a ponta sem bordas escuras desproporcionais, acompanhado de `favicon.ico` com múltiplas resoluções para barra de favoritos.
- **Suíte PWA**: Manter sempre os arquivos `favicon.ico`, PNGs de 192x192, 512x512 (com suporte a `maskable`), `apple-touch-icon.png` e `favicon-32x32.png` na pasta `public/` e sincronizados com `vite.config.ts`.

## 3. Controle e Acompanhamento de Versão
- **Versionamento Contínuo a Cada Push**: A cada novo push/deploy, aumente a versão (ex: 1.0.0 -> 1.0.1 -> 1.0.2) mantendo-a sincronizada em `package.json`, em `src/utils/constants.ts` (`APP_VERSION`) e exibida na interface (Navbar e rodapé).
