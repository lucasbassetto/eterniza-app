# Etapa 2 — Componentes Base do Design System: Validation

**Date**: 2026-07-14
**Spec**: `.specs/features/etapa-2-componentes/spec.md`
**Diff range**: `36790d8..ba17503` (commits `20a31e6`, `1788d3a`, `9f072bf`, `e01d62c`, `ba17503`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

Escopo Medium — sem tasks.md formal. Os 5 commits atômicos mapeiam 1:1 aos requisitos (AD-005):

| Commit | Requisito | Status |
| --- | --- | --- |
| `20a31e6` — Text com variantes tipográficas | COMP-01 | ✅ Done |
| `1788d3a` — Button com 4 variantes | COMP-02 | ✅ Done |
| `9f072bf` — Input com label e estados foco/erro | COMP-03 | ✅ Done |
| `e01d62c` — Screen com gutter 24 e safe area | COMP-04 | ✅ Done |
| `ba17503` — galeria /dev/components + link na home | COMP-05 | ✅ Done |

---

## Spec-Anchored Acceptance Criteria

Valores esperados dos testes conferidos **diretamente contra `DESIGN_SYSTEM.md` §3–§5 e §9 (linhas 91–98, 110–113, 121–132, 197–227)**, não contra `theme.ts`. Onde o teste asserta o spread de um token (`type.label`, `type.caption`), o token em si é validado 1:1 contra o §9 por `src/theme/__tests__/theme.test.ts` (Etapa 1, sensor re-confirmado).

### COMP-01 — `Text` tipografado

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: variant aplica exatamente o token de `type` | 6 tokens do §9:220–227, incl. `heading.textTransform: 'uppercase'` | `src/components/__tests__/text.test.tsx:15-18` — `it.each(VARIANTS)` → `expect(getByText('amostra')).toHaveStyle(type[variant])`; `:35-38` — heading `toHaveStyle({ textTransform: 'uppercase' })` | ✅ PASS |
| AC2: sem variant → `body` | `type.body` (Cormorant_500Medium 17/24) | `text.test.tsx:20-23` — `toHaveStyle(type.body)` | ✅ PASS |
| AC3: `onDark` → `editorialText`; senão `ink` | `#FFFFFF` / `#000000` (§9:203, 207) | `text.test.tsx:25-28` — `toHaveStyle({ color: '#000000' })`; `:30-33` — `toHaveStyle({ color: '#FFFFFF' })` (literais idênticos ao documento) | ✅ PASS |

### COMP-02 — `Button` com 4 variantes

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: primary = transparente, borda 2px `ink`, texto `ink` em `type.label` | §5:123 — "borda 2px ink, texto ink (Cormorant 500 16)"; ink `#000000` | `src/components/__tests__/button.test.tsx:14-21` — `toHaveStyle({ backgroundColor: 'transparent', borderWidth: 2, borderColor: '#000000' })` + texto `toHaveStyle({ ...type.label, color: '#000000' })` | ✅ PASS |
| AC1 (onDark): borda/texto `editorialText` | `#FFFFFF` (§9:207) | `button.test.tsx:24-28` — `toHaveStyle({ borderColor: '#FFFFFF' })` + texto `{ color: '#FFFFFF' }` | ✅ PASS |
| AC2: highlight = fundo `editorial`, texto `editorialText` | `#121212` / `#FFFFFF` (§9:200, 207; §5:124) | `button.test.tsx:30-34` — `toHaveStyle({ backgroundColor: '#121212' })` + texto `{ color: '#FFFFFF' }` | ✅ PASS |
| AC3: text = transparente, sem borda; pressed = sublinhado 1px | §5:125 — "transparente, texto ink; pressed = sublinhado (borda inferior 1px)" | `button.test.tsx:36-41` — `flatten(...).borderWidth` `toBeUndefined()` + `backgroundColor: 'transparent'`; `:43-50` — com `testOnly_pressed`, texto `toHaveStyle({ borderBottomWidth: 1, borderBottomColor: '#000000' })` | ✅ PASS |
| AC4: destructive = transparente, borda 1px `error`, texto `error`, nunca fundo vermelho | error `#8C3B2E` (§9:212; §5:126) | `button.test.tsx:52-60` — `toHaveStyle({ backgroundColor: 'transparent', borderWidth: 1, borderColor: '#8C3B2E' })` + texto `{ color: '#8C3B2E' }` | ✅ PASS |
| AC5: raio 0 e sem sombra/elevation em toda variante | §5:121 "todos com raio 0"; §4 "box-shadow: none" | `button.test.tsx:62-72` — `it.each` das 4 variantes: `flat.borderRadius).toBe(0)` + `elevation`/`shadowOpacity`/`shadowRadius` `toBeUndefined()` | ✅ PASS |
| AC6: pressed = opacidade 0.85 + translação 1px | §5:128 — "pressed = opacidade 0.85 + leve translação vertical (1px)" | `button.test.tsx:74-80` — `testOnly_pressed` → `toHaveStyle({ opacity: 0.85, transform: [{ translateY: 1 }] })` | ✅ PASS |
| AC7: disabled = borda/texto `colors.border` e `onPress` não dispara | border `rgba(0,0,0,0.5)` (§9:205; §5:128 "disabled = borda/texto border (50%)") | `button.test.tsx:82-91` — `toHaveStyle({ borderColor: 'rgba(0,0,0,0.5)' })`, texto `{ color: 'rgba(0,0,0,0.5)' }`, `fireEvent.press` → `expect(onPress).not.toHaveBeenCalled()` | ✅ PASS |
| AC8: área de toque com altura ≥ 44 | §8 "alvos de toque ≥ 44pt" | `button.test.tsx:93-96` — `toHaveStyle({ minHeight: 44 })` (proxy automatizável; medida real de layout = dispositivo) | ✅ PASS |

### COMP-03 — `Input` com label e estados

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: label acima em `caption`/`inkMuted`, caixa alta com tracking | caption (§9:226), inkMuted `rgba(18,18,18,0.75)` (§9:204); §5:131 "label acima em caption/ink-muted em caixa alta com tracking" | `src/components/__tests__/input.test.tsx:12-20` — `toHaveStyle({ ...type.caption, color: 'rgba(18,18,18,0.75)', textTransform: 'uppercase', letterSpacing: 1 })` | ✅ PASS (⚠️ nota: o documento não fixa o valor numérico do tracking; o teste asserta `1`, escolha da implementação — spec-precision note, não gap) |
| AC2: repouso = fundo `canvas`, borda 1px `border`, raio 0, altura 52 | `#FFFFFF`, `rgba(0,0,0,0.5)`, 0, 52 (§5:131 "Fundo canvas, borda 1px border, raio 0, altura 52") | `input.test.tsx:22-31` — `toHaveStyle({ backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: 'rgba(0,0,0,0.5)', borderRadius: 0, height: 52 })` | ✅ PASS |
| AC3: focado = borda `ink` 2px | §5:132 "Foco: borda ink (2px)" | `input.test.tsx:33-38` — `fireEvent(field, 'focus')` → `toHaveStyle({ borderColor: '#000000', borderWidth: 2 })` | ✅ PASS |
| AC4: erro = borda `error` + mensagem abaixo em `caption`/`error` | `#8C3B2E` (§9:212; §5:132) | `input.test.tsx:40-47` — campo `toHaveStyle({ borderColor: '#8C3B2E' })`; mensagem `toHaveStyle({ ...type.caption, color: '#8C3B2E' })` | ✅ PASS |
| AC5: sem `error` → sem texto de erro | ausência do nó | `input.test.tsx:49-52` — `expect(queryByTestId('input-error')).toBeNull()` | ✅ PASS |

### COMP-04 — `Screen` com gutter e safe area

| Criterion | Spec-defined outcome | Evidência | Result |
| --- | --- | --- | --- |
| AC1: `paddingHorizontal` 24 | 24 (§4:110 — "Padding lateral padrão de tela: 24 … inegociável") | `src/components/__tests__/screen.test.tsx:22-25` — `toHaveStyle({ paddingHorizontal: 24 })` (literal 24, não o token) | ✅ PASS |
| AC1: respeitar a safe area | insets aplicados em dispositivo | `src/components/screen.tsx:2,13` — `SafeAreaView` de `react-native-safe-area-context` envolvendo o conteúdo (por inspeção); teste renderiza sob `SafeAreaProvider` com métricas de iPhone (`screen.test.tsx:12-18`) | ⏳ UAT pendente (comportamento em dispositivo, AD-003); estrutura ✅ por inspeção |
| AC2: `surface="editorial"` → fundo `editorial`; default `canvas` | `#121212` / `#FFFFFF` (§9:199-200) | `screen.test.tsx:27-30` — default `toHaveStyle({ backgroundColor: '#FFFFFF' })`; `:32-35` — editorial `toHaveStyle({ backgroundColor: '#121212' })` | ✅ PASS |

### COMP-05 — Galeria `/dev/components`

| Criterion | Spec-defined outcome | Evidência | Result |
| --- | --- | --- | --- |
| AC1: galeria exibe 6 variantes de Text, 4 de Button + disabled, Input repouso/foco/erro, dentro de Screen | presença de todos os elementos | Por inspeção: `src/app/dev/components.tsx:9-16` (TYPE_SAMPLES com as 6 variantes) + `:29-36` (render); `:41-45` (4 variantes de Button + disabled); `:50-55` (Input repouso e erro; foco é estado interativo — dica em `:56-58` para tocar no campo); `:20` (tudo dentro de `<Screen>`) | ✅ PASS por inspeção; conferência visual = UAT (AD-003) |
| AC2: seção em contexto escuro com variantes `onDark` | fundo `editorial` + `onDark` | `components.tsx:61-71` — `darkSection` (`:91-94`, `backgroundColor: colors.editorial`) com `Text onDark` (heading/display/body) e `Button onDark` (primary/text) | ✅ PASS por inspeção |
| AC3: galeria bate com o `DESIGN_SYSTEM.md` no Expo Go | julgamento visual humano | Acesso: link `src/app/index.tsx:15-17` — `<Link href="/dev/components">` (temporário, remoção na Etapa 3) | ⏳ UAT pendente (AD-003) |

**Status**: ✅ Todos os ACs automatizáveis cobertos com evidência e valores idênticos ao documento; 1 spec-precision note (tracking do label sem valor no doc); itens visuais/de dispositivo → UAT (AD-003).

---

## Edge Cases

- [x] **Button disabled pressionado → `onPress` não chamado**: `src/components/__tests__/button.test.tsx:82-91` — `fireEvent.press` + `expect(onPress).not.toHaveBeenCalled()`. ✅
- [ ] **Texto longo do botão trunca/quebra sem estourar altura mínima nem cantos retos**: sem teste automatizado — o renderer de teste do RN não mede layout real (quebra de linha é comportamento default do RN Text; `minHeight` permite crescimento). ⏳ Verificação visual = UAT (item 5). Não é gap de código; é comportamento de layout de dispositivo (AD-003).
- [ ] **Font scaling (Dynamic Type) escala o corpo; caption nunca abaixo de 12**: `allowFontScaling` é default `true` no RN (nenhum componente o desabilita — por inspeção de `text.tsx`/`button.tsx`/`input.tsx`); `caption` base é 12 e o scaling do sistema só aumenta, nunca reduz — o mínimo de 12 é estrutural. ⏳ Comportamento em dispositivo = UAT (item 6), por AD-003.
- [x] **Input foco → blur sem erro volta à borda 1px `border`**: `src/components/__tests__/input.test.tsx:54-60` — focus + blur → `toHaveStyle({ borderColor: 'rgba(0,0,0,0.5)', borderWidth: 1 })`. ✅

---

## Gate Check

| Gate | Comando | Resultado |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | ✅ exit 0, sem erros |
| Lint | `npm run lint` (`expo lint`) | ✅ exit 0, sem warnings |
| Testes | `npm test` (jest-expo) | ✅ 5 suites, **38 passed, 0 failed, 0 skipped** |

- **Test count antes da feature**: 4 (theme.test.ts, Etapa 1)
- **Test count depois**: 38 — delta **+34** (text 10, button 14, input 6, screen 4)
- **Integridade**: nenhum teste removido ou enfraquecido; os 4 testes de tokens da Etapa 1 continuam passando
- **Testes órfãos**: nenhum — os 34 novos mapeiam aos ACs COMP-01..04 e aos 2 edge cases automatizáveis; `button.test.tsx:98-103` (onPress dispara habilitado) é o contraponto do AC7 e `screen.test.tsx:37-46` (renderiza filhos) é comportamento implícito do container

---

## Discrimination Sensor

Executado em estado descartável (mutação via edição → `npx jest <suite>` → `git checkout -- <arquivo>`). Working tree confirmado limpo (`git status --porcelain` vazio) após cada rodada e ao final. Mutações nos **componentes**, não no theme.

| # | Mutação | File:line | Killed? |
| --- | --- | --- | --- |
| 1 | primary `borderWidth: 2` → `1` | `src/components/button.tsx:27` | ✅ Killed (1 failed / 14, exit 1 — teste AC1) |
| 2 | `height: 52` → `48` | `src/components/input.tsx:57` | ✅ Killed (1 failed / 6, exit 1 — teste AC2) |
| 3 | cor `onDark`: `colors.editorialText` → `colors.editorialTextMuted` | `src/components/text.tsx:18` | ✅ Killed (1 failed / 10, exit 1 — teste AC3) |
| 4 | gutter `paddingHorizontal: spacing.xxl` (24) → `spacing.lg` (16) | `src/components/screen.tsx:23` | ✅ Killed (1 failed / 4, exit 1 — teste AC1) |

**Sensor depth**: lightweight (default) — 4 mutações, uma por componente
**Result**: 4/4 killed — ✅ PASS. Os testes discriminam regressões de borda, altura, cor de contexto e gutter.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code (4 componentes + galeria + link; nada além — sem haptics, sem API, sem rotas reais) | ✅ |
| Surgical changes (só os arquivos do escopo + dev dep `@testing-library/react-native` prevista nas Assumptions) | ✅ |
| No scope creep (Out of Scope respeitado: sem deep link, sem componentes de tela-assinatura, sem modo escuro global — `onDark` por prop, conforme Assumption) | ✅ |
| Matches patterns (kebab-case em `src/components/`, consumo via `@/`, tokens do theme — AD-004) | ✅ |
| Spec-anchored outcome check (valores assertados = literais do §5/§9 do documento, conferidos contra o doc, não contra theme.ts) | ✅ |
| Per-layer coverage (componentes = 1:1 com ACs; galeria = rota interna sem lógica → inspeção + UAT) | ✅ |
| Todo teste mapeia a um AC ou edge case — sem testes órfãos | ✅ |
| Guidelines seguidas (`STATE.md` AD-001..AD-006; `DESIGN_SYSTEM.md` §3–§5, §9; testing-library v14 com `await render`/`await fireEvent` e `testOnly_pressed`) | ✅ |

**Observações menores (não bloqueantes):**

1. **Foco de acessibilidade (outline `accent`)** não tem estilização em `button.tsx`/`input.tsx`. Coerente com a Assumption da spec ("sem simulação visual no iOS por toque"; alvo atual é iPhone/Expo Go, onde não há foco de teclado) e não há AC que o exija — registrar para quando houver alvo web/teclado.
2. O estado **foco** do Input na galeria é demonstrado por interação (tocar no campo), não como amostra estática — inerente ao estado; a galeria orienta com a dica em `components.tsx:56-58`.

---

## Interactive UAT — Pendências (confirmar com o usuário no Expo Go, via link "componentes →" na home)

| # | Teste | Esperado |
| --- | --- | --- |
| 1 | Tipografia na galeria | 6 variantes visíveis e distintas: display/title em Archivo leve, heading em caixa alta, body/label/caption em Cormorant |
| 2 | Botões | Primário outline 2px preto, cantos retos, sem sombra; Destaque com fundo `#121212`; Texto sem borda (pressionar mostra sublinhado); Destrutivo com contorno vinho, nunca fundo vermelho; disabled acinzentado e inerte; pressed = leve opacidade + afundamento de 1px |
| 3 | Inputs | Label em caixa alta acima; campo de 52pt com borda fina; tocar → borda preta 2px; campo com erro → borda vinho + mensagem abaixo; blur volta ao repouso |
| 4 | Contexto escuro | Seção com fundo editorial e textos/botões brancos (`onDark`) |
| 5 | Texto longo em botão | Título longo quebra/ajusta sem deformar os cantos retos nem a altura mínima |
| 6 | Dynamic Type | Aumentar o tamanho de texto no iOS → corpo escala; caption permanece legível (≥12) |
| 7 | Safe area + gutter | Conteúdo da galeria não invade notch/home indicator e mantém margem lateral de 24 |
| 8 | Fidelidade geral (AC3 do COMP-05) | Galeria bate com o `DESIGN_SYSTEM.md`: cantos retos, sem sombra, monocromático |

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| COMP-01 | Pending | ✅ Verified |
| COMP-02 | Pending | ✅ Verified |
| COMP-03 | Pending | ✅ Verified |
| COMP-04 | Pending | ✅ Verified (código) / ⏳ UAT pendente (safe area em dispositivo) |
| COMP-05 | Pending | ✅ Verified (estrutura, por inspeção) / ⏳ UAT pendente (conferência visual — AD-003) |

---

## Summary

**Overall**: ✅ PASS (parte automatizável) — ⏳ UAT interativo pendente para fechar o Success Criterion visual da spec

**Spec-anchored check**: 19/19 ACs automatizáveis com evidência `file:line` e valores idênticos ao `DESIGN_SYSTEM.md` §5/§9; 1 spec-precision note (tracking do label do Input — doc não fixa valor; teste asserta 1); 4 itens visuais/de dispositivo roteados para UAT (AD-003)
**Sensor**: 4/4 mutações mortas (uma por componente)
**Gate**: tsc ✅ · lint ✅ · jest 38/38 ✅ (baseline 4 → +34)
**Working tree**: limpo ao final (`git status --porcelain` vazio, exceto este validation.md)

**What works**: os 4 componentes assertados contra os literais do documento (outline 2px `#000000`, destaque `#121212`, error `#8C3B2E`, altura 52, raio 0, gutter 24, disabled `rgba(0,0,0,0.5)`, pressed 0.85 + 1px via `testOnly_pressed`); galeria completa com seção escura; testes discriminantes em todos os componentes.

**Issues found**: nenhum bloqueante. Notas: (1) tracking do label sem valor canônico no doc; (2) foco de acessibilidade `accent` sem implementação — sem AC correspondente e N/A no alvo iOS/toque atual.

**Next steps**: rodar o UAT interativo (8 itens acima) com o usuário no Expo Go (`npx expo start --tunnel`, link "componentes →" na home) para fechar o Success Criterion "galeria confere com o DESIGN_SYSTEM.md".

---

## UAT Interativo — Resultado (2026-07-14)

Executado pelo usuário em iPhone físico via Expo Go (tunnel), galeria `/dev/components` pelo link da home. Usuário aprovou e autorizou seguir ("Pode seguir").

**Overall final**: ✅ **PASS — Etapa 2 concluída** (automatizável + UAT). Critério "✅ Verificar" do ROADMAP cumprido (galeria confere com o DESIGN_SYSTEM.md: cantos retos, sem sombra, botão outline 2px).
