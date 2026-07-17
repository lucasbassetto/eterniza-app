# Etapa 7 — Filtros ao vivo (Skia): Specification

> Fonte: `ROADMAP.md` Etapa 7 + `APP_BRIEF.md` §1 (pilar 4)/§4 (regra 3) + `DESIGN_SYSTEM.md`
> §6 (câmera, filtros como filmes) + ref. landing_2/3/4 (AD-007) + AD-009 (módulos do rebuild
> único). Escopo: **Large** (frame processors na GPU, pipeline de imagem, rebuild nativo).

## Problem Statement

A câmera fotografa, mas sem estética — e estética é o pilar 4 do produto ("filtro escolhido e
aplicado ao vivo na câmera, estilo Instagram"). O convidado precisa ver o filtro em tempo real
no preview, trocar por um carrossel na própria câmera, e a foto enviada ao servidor deve já
ser a final, filtrada (o servidor não processa nada — regra 3). Isso exige Skia + frame
processors, que não estão no build atual: esta etapa carrega o **rebuild único** no Mac com
todos os módulos nativos que as Etapas 7–9 vão precisar (AD-009), para não compilar de novo.

## Goals

- [ ] **Rebuild único** com: Skia, worklets (frame processors), `expo-haptics`,
      `expo-media-library` (Etapa 9), `react-native-gesture-handler` + `react-native-reanimated`
      (física do Polaroid, Etapa 8) — regressão zero nas telas existentes
- [ ] **6 filtros do DS** definidos como dados (matrizes de cor): `Original`, `Nupcial`
      (soft/bright), `Ouro` (warm gold), `Sépia`, `P&B Clássico`, `Vintage 94` (fade; grain
      entra com o efeito Polaroid)
- [ ] **Preview ao vivo** com o filtro aplicado na GPU, fluido (≥30fps — critério do roadmap)
- [ ] **Carrossel** de miniaturas circulares com nome embaixo, anel `1px editorial-text` no
      ativo (DS §6); troca reflete no preview instantaneamente
- [ ] **Foto enviada já filtrada**, na resolução máxima intacta; `Original` sobe o arquivo
      da câmera sem reprocessar
- [ ] **Haptic leve ao tirar foto** (DS §7 — agora que o módulo existe)

## Out of Scope

| Feature | Reason |
|---|---|
| Efeito Polaroid (impressão/química) | Etapa 8 (AD-009) — esta etapa só instala as ferramentas |
| Granulação/textura do `Vintage 94` | Refinamento junto do efeito Polaroid (Etapa 8) — no lançamento o filtro é a curva de cor (fade) |
| Som de obturador (`expo-audio`) | Adiado — módulo nativo só para um som não paga o risco de build agora; reavaliar na Etapa 11 |
| Ajustes de intensidade do filtro | Não existe no produto — filtro é escolha binária, como filme |
| Persistir o filtro escolhido entre sessões | Complexidade sem pedido; default `Original` a cada abertura. Filtro escolhido persiste entre POSES na mesma sessão de câmera |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Integração preview | `useSkiaFrameProcessor` da VisionCamera v4 (`@shopify/react-native-skia` + `react-native-worklets-core`, plugin babel dos worklets) — desenha cada frame com `ColorFilter` (matriz 4×5) na GPU | Caminho documentado da própria VisionCamera para filtros ao vivo; matriz de cor é a operação mais barata da GPU (30fps tranquilo) | n |
| Filtros = matrizes de cor 4×5 | Módulo `src/camera/filters.ts` com `{ key, name, matrix }`; curvas iniciais aproximadas por engenharia (DS §6: "curva exata é trabalho de design/engenharia no Skia") e calibradas no UAT | Dados puros = testáveis sem GPU; UAT valida o look | n |
| Foto final filtrada | `takePhoto()` (sem filtro) → pipeline offscreen Skia: decode → draw com a MESMA matriz → encode JPEG qualidade ~92 → upload. `Original` pula o pipeline (sobe o arquivo original intocado) | Preview e foto compartilham a matriz (WYSIWYG); offscreen preserva a resolução máxima | n |
| Re-encode vs "não comprimir" | O re-encode JPEG (~92) é inerente ao filtro client-side sancionado pelo brief (regra 3: "a imagem enviada já é a final"); resolução NUNCA muda. `Original` nem re-encoda | Regra 4 fala de resolução/degradação evitável; filtro exige re-encode | n |
| Orientação EXIF | O pipeline deve produzir a imagem já na orientação correta (desenhar aplicando a rotação EXIF antes do encode) — foto retrato não pode chegar deitada | Skia não copia EXIF; risco conhecido de pipelines de imagem | n |
| Falha no processamento | Trata como falha de captura: erro discreto, pose NÃO gasta, obturador reabilita (mesmo contrato da falha de rede — CAM-03 AC3). Nunca subir silenciosamente sem filtro | O convidado escolheu a estética; entregar outra coisa viola o pilar 4 | n |
| Miniaturas do carrossel | Amostra estática neutra (asset pequeno no bundle) com a matriz de cada filtro aplicada via Skia `Image` + `ColorFilter`; círculo (radius.circle é exceção funcional do DS), nome embaixo em `caption` | Mostra o efeito real sem custo de frame processor extra | n |
| Posição do carrossel | Entre a tira inferior e o obturador (ref. landing_2/3 + DS §6), rolagem horizontal, ativo com anel `1px editorial-text` | DS §6 literal | n |
| Haptic | `expo-haptics` leve no `takePhoto` (DS §7); os demais haptics (última pose, reveal) nas suas etapas | Módulo já entra no rebuild | n |
| Módulos do rebuild | `@shopify/react-native-skia`, `react-native-worklets-core`, `expo-haptics`, `expo-media-library`, `react-native-gesture-handler`, `react-native-reanimated` — versões via `npx expo install` (SDK 54) | AD-009: um único build no Mac cobre Etapas 7–9 | n |
| Testes | Matrizes/dados: unit puro (P&B zera saturação, Original = identidade, 6 filtros, nomes do DS). Pipeline e Skia mockados nos testes de tela: seleção no carrossel → upload recebe a uri processada do filtro certo (`Original` → uri original). Fluidez/look real = UAT (AD-003) | GPU não existe no jest | n |

**Open questions:** none — módulos do rebuild confirmados com o usuário na conversa
(expo-audio ficou de fora; reavaliar na Etapa 11).

**Dimensões implícitas**: **performance** (30fps preview; processamento offscreen de 12MP no
`busy` do obturador), **falha externa** (pipeline falha → pose preservada), **consistência**
(preview e foto com a MESMA matriz), **regressão** (rebuild não pode quebrar Etapas 1–6 —
suíte inteira + UAT de fumaça). N/A: auth, concorrência.

**Lessons aplicadas**: L-002 — o elo carrossel→preview→pipeline→upload testado ponta-a-ponta.

---

## User Stories

### P1: Rebuild com os módulos das Etapas 7–9 ⭐ MVP (infra)

**User Story**: Como desenvolvedor, quero um único rebuild com Skia, worklets, haptics,
media-library e gesture/reanimated, para as Etapas 7–9 serem só JavaScript.

**Acceptance Criteria**:

1. WHEN as dependências entram THEN `npx expo run:ios --device` SHALL compilar e o app abrir
   com todas as telas das Etapas 1–6 funcionando (regressão zero) — UAT.
2. WHEN o jest roda THEN os novos módulos nativos SHALL estar mockados e a suíte inteira verde.
3. WHEN o app abre THEN o plugin babel dos worklets SHALL estar ativo (frame processor não
   crasha) — UAT.

---

### P1: Filtros definidos como dados ⭐ MVP

**User Story**: Como produto, quero os 6 filtros do DS como matrizes nomeadas, para preview,
foto e miniaturas usarem exatamente a mesma definição.

**Acceptance Criteria**:

1. WHEN o módulo de filtros carrega THEN SHALL exportar exatamente 6 filtros com os nomes do
   DS §6, na ordem: `Original`, `Nupcial`, `Ouro`, `Sépia`, `P&B Clássico`, `Vintage 94`.
2. WHEN `Original` é aplicado THEN a matriz SHALL ser a identidade (nenhuma alteração).
3. WHEN `P&B Clássico` é aplicado THEN a matriz SHALL zerar a saturação (linhas RGB iguais,
   pesos de luminância).
4. WHEN qualquer matriz é lida THEN SHALL ter 20 elementos (4×5) com alpha preservado.

**Independent Test**: `npm test` — propriedades das matrizes, sem GPU.

---

### P1: Preview ao vivo com filtro ⭐ MVP

**User Story**: Como convidado, quero ver a festa já com o filtro no visor — o que vejo é o
que a foto será.

**Acceptance Criteria** *(revisados no UAT de 2026-07-16 — AD-010: o `useSkiaFrameProcessor`
do VisionCamera v4 é experimental e congela o app na new architecture, tanto ao anexar quanto
sempre-anexado (vision-camera#3606 e #3517, reproduzível no app de exemplo). O preview ao vivo
com a matriz exata fica DESCARTADO até o upstream estabilizar; o preview passa a ser o "véu de
filme": preview nativo da Etapa 6 + camada rgba com o tom do filtro. O efeito EXATO permanece
nas miniaturas do carrossel e na foto final)*:

1. WHEN um filtro ≠ `Original` está ativo THEN o preview SHALL exibir o véu do filme (tint
   rgba do filtro) sobre o preview nativo, sem custo por frame — fluidez da Etapa 6 intacta.
2. WHEN troco de filtro no carrossel THEN o véu SHALL mudar instantaneamente.
3. WHEN `Original` está ativo THEN o preview SHALL ser o nativo puro, idêntico ao da Etapa 6
   (sem véu, sem frame processor).
4. WHEN a câmera vira (frontal/traseira) THEN o filtro ativo SHALL permanecer.

**Independent Test**: seleção→estado testável com mocks; fluidez e fidelidade visual = UAT.

---

### P1: Carrossel de filtros ⭐ MVP

**User Story**: Como convidado, quero trocar de filme com um toque, vendo uma amostra de cada.

**Acceptance Criteria**:

1. WHEN a câmera abre THEN o carrossel SHALL mostrar as 6 miniaturas circulares com o nome
   embaixo (`caption`), `Original` ativo por default.
2. WHEN toco numa miniatura THEN ela SHALL ganhar o anel `1px editorial-text` (e a anterior
   perder) e virar o filtro das próximas fotos.
3. WHEN tiro uma foto THEN o filtro escolhido SHALL continuar selecionado (persiste entre
   poses da sessão).
4. WHEN as poses zeram THEN o carrossel SHALL desabilitar junto do obturador.

**Independent Test**: renderRouter + Skia mockado — seleção, anel ativo, default, persistência
entre poses.

---

### P1: Foto enviada já filtrada ⭐ MVP

**User Story**: Como convidado, quero que a foto que chega ao evento seja exatamente a que vi
no visor.

**Acceptance Criteria**:

1. WHEN tiro foto com filtro ≠ `Original` THEN o app SHALL aplicar a MESMA matriz do preview
   na foto capturada (offscreen, resolução máxima intacta, orientação correta) e subir o
   resultado.
2. WHEN tiro foto com `Original` THEN o app SHALL subir o arquivo original da câmera, sem
   reprocessar.
3. WHEN o processamento falha THEN a pose SHALL NOT ser gasta, com erro discreto e obturador
   reabilitado (contrato da CAM-03 AC3).
4. WHEN o upload conclui THEN a foto no backend SHALL estar filtrada — **UAT: conferir via
   moderação que a imagem baixada tem o filtro**.
5. WHEN há processamento em andamento THEN o obturador SHALL permanecer ocupado (estado
   `busy` cobre captura + processamento + upload).

**Independent Test**: pipeline mockado nos testes de tela (uri certa por filtro); imagem real
filtrada = UAT.

---

## Edge Cases

- WHEN o frame processor não inicializa (worklets ausentes/binário velho) THEN a câmera SHALL
  degradar para preview sem filtro com aviso em dev — não crashar a tela.
- WHEN a foto é da câmera frontal THEN o pipeline SHALL respeitar o espelhamento/orientação.
- WHEN o dispositivo é lento e o preview cai de 30fps THEN a captura SHALL continuar íntegra
  (fluidez é do preview; a foto é processada offscreen).
- WHEN o convidado troca de filtro DURANTE um processamento THEN a foto em voo SHALL manter o
  filtro do momento da captura.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| FILT-01 | P1: Rebuild com módulos 7–9 | Execute | Implementado (config) — commit b655a37; build/UAT pendente no Mac |
| FILT-02 | P1: Filtros como dados | Execute | Verified — commit c5b38aa |
| FILT-03 | P1: Preview ao vivo | Execute | Verified (fiação) — commits 5f5d8b6 + 9ef343f; fluidez/look = UAT |
| FILT-04 | P1: Carrossel | Execute | Verified — commit 5f5d8b6 |
| FILT-05 | P1: Foto enviada filtrada | Execute | Verified (fiação+pipeline) — commits d5fc173 + 9ef343f; imagem real = UAT |

**Coverage:** 5 total, 0 mapped to tasks (tasks implícitas no Execute), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] **Preview com filtro em tempo real fluido (≥30fps)** — UAT no iPhone.
- [ ] **Foto no backend já filtrada** — UAT: baixar da moderação e conferir o filtro.
- [ ] Regressão zero pós-rebuild (suíte inteira + fumaça nas telas 1–6).
- [x] Gate automatizado verde: `tsc --noEmit` + lint + 136/136 testes. Verificação inline com
      sensor 6/6 (default ≠ Original, pesos do P&B, bypass do pipeline, matriz fixa, upload
      com uri da câmera, frame processor nunca acoplado — todas detectadas).
- [x] Commits atômicos (AD-005): b655a37, c5b38aa, d5fc173, 5f5d8b6, 9ef343f.
