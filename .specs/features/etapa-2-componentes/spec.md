# Etapa 2 — Componentes Base do Design System: Specification

> Fonte: `ROADMAP.md` Etapa 2 + `DESIGN_SYSTEM.md` §3–§5. Escopo: **Medium** (o design JÁ existe — o `DESIGN_SYSTEM.md` é o design doc; sem decisão arquitetural nova → fase Design dispensada; passos atômicos no Execute).

## Problem Statement

Toda tela futura (câmera, galeria, host) precisa dos mesmos blocos: texto tipografado, botões, inputs e o container de tela com gutter. Sem componentes base, cada etapa reimplementaria o design system na mão — com deriva visual inevitável. Esta etapa cria os 4 componentes e uma galeria interna para validá-los visualmente de uma vez.

## Goals

- [ ] `Text` com as 6 variantes tipográficas (`display/title/heading/body/label/caption`)
- [ ] `Button` com as 4 variantes (primário outline, destaque, texto, destrutivo) e estados (pressed/disabled)
- [ ] `Input` com label em caixa alta e estados foco/erro
- [ ] `Screen` com gutter 24 + safe area
- [ ] Rota interna `/dev/components` exibindo tudo (galeria para validação visual)

## Out of Scope

| Feature | Reason |
|---|---|
| Rotas reais do produto e deep link | Etapa 3 |
| Componentes específicos (obturador, carrossel de filtros, foto trancada, chip de poses) | Etapas 6–8 — são telas-assinatura, não componentes base |
| Haptics e microinterações | Etapa 11 (polimento); pressed básico (opacidade/translação) entra aqui pois o §5 o define como estado do botão |
| Integração com `errors` da API no Input | Etapa 4 — aqui o Input só recebe `error?: string` via prop |
| Modo escuro global | Fora de escopo declarado no roadmap (suporte a contexto escuro é por prop `onDark`, pontual) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Infra de teste de componente | Adicionar `@testing-library/react-native` (dev dep) | Os ACs de estilo (borda 2px, raio 0, altura 52, cores) são verificáveis por render + asserção de estilo; era a lacuna apontada na validação da Etapa 1 | n |
| Nomes/arquivos | `src/components/` com arquivos kebab-case (`text.tsx`, `button.tsx`, `input.tsx`, `screen.tsx`), exportando `Text`, `Button`, `Input`, `Screen` | Convenção do template Expo (kebab-case); consumo via `@/components/...` | n |
| Contexto escuro | Prop `onDark?: boolean` em `Text` e `Button` (troca ink→editorial-text, conforme §5); `Screen` recebe `surface?: 'canvas' \| 'editorial'` (default `canvas`) | O §5 define variantes "sobre escuro" para botão primário/texto; câmera e revelação (futuras) usam shell `editorial` | n |
| Acesso à galeria no UAT | Link discreto "componentes →" na tela placeholder da home, a ser removido na Etapa 3 (quando houver navegação real) | Sem navegação ainda, é o único jeito prático de chegar em `/dev/components` no Expo Go | n |
| Foco de acessibilidade (outline `accent`) | Implementar onde a plataforma expõe foco (navegação por teclado/web); sem simulação visual no iOS por toque | iOS não tem foco visual sem teclado externo; o §5 o define como estado de acessibilidade, não de toque | n |
| Pressed do botão | `Pressable` com função de estilo: opacidade 0.85 + `translateY: 1` (§5); variante texto ganha sublinhado (borda inferior 1px) no pressed | Valores literais do §5 | n |
| Fonte do texto de botão | `type.label` (Cormorant 500, 16) para todas as variantes | §5: "texto de botão é Cormorant 500 16, como na referência" | n |

**Open questions:** none — tudo resolvido ou logado acima.

**Dimensões implícitas:** persistência, chamadas externas, auth, concorrência, pagamentos — N/A (componentes puros de UI, sem estado global nem I/O). Presentes: **estados/transições de UI** (pressed/disabled/foco/erro — cobertos nos ACs) e **acessibilidade** (alvo ≥44pt, Cormorant mínimo 12 — cobertos em Edge Cases).

---

## User Stories

### P1: `Text` tipografado ⭐ MVP

**User Story**: Como desenvolvedor, quero um componente `Text` com as variantes do design system para nunca estilizar tipografia na mão.

**Acceptance Criteria**:

1. WHEN `<Text variant="display|title|heading|body|label|caption">` renderiza THEN o estilo aplicado SHALL ser exatamente o token correspondente de `type` do `theme.ts` (fontFamily, fontSize, lineHeight, letterSpacing e, no heading, textTransform uppercase).
2. WHEN nenhuma variant é passada THEN SHALL usar `body`.
3. WHEN `onDark` é true THEN a cor default SHALL ser `editorialText`; caso contrário, `ink`.

**Independent Test**: `npm test` — render de cada variante assertando o estilo do token.

---

### P1: `Button` com 4 variantes ⭐ MVP

**User Story**: Como desenvolvedor, quero botões prontos nas 4 variantes do §5 para que toda ação do app tenha a mesma linguagem (outline, cantos retos, sem sombra).

**Acceptance Criteria**:

1. WHEN variante `primary` renderiza THEN SHALL ter fundo transparente, borda 2px `ink`, texto `ink` em `type.label`; com `onDark`, borda/texto `editorialText`.
2. WHEN variante `highlight` (Destaque) renderiza THEN SHALL ter fundo `editorial` e texto `editorialText`.
3. WHEN variante `text` renderiza THEN SHALL ser transparente e sem borda; pressed SHALL exibir sublinhado (borda inferior 1px).
4. WHEN variante `destructive` renderiza THEN SHALL ter fundo transparente, borda 1px `error`, texto `error` — nunca fundo vermelho.
5. WHEN qualquer variante renderiza THEN `borderRadius` SHALL ser 0 e SHALL NOT haver sombra/elevation.
6. WHEN pressed THEN SHALL aplicar opacidade 0.85 + translação vertical de 1px.
7. WHEN `disabled` THEN borda/texto SHALL usar `colors.border` e `onPress` SHALL NOT disparar.
8. WHEN qualquer variante renderiza THEN a área de toque SHALL ter altura ≥ 44.

**Independent Test**: `npm test` — render por variante/estado assertando estilos e `onPress`.

---

### P1: `Input` com label e estados ⭐ MVP

**User Story**: Como desenvolvedor, quero um input com a anatomia do §5 (label caixa alta, foco, erro) para formulários consistentes (login, nome do convidado, criar evento).

**Acceptance Criteria**:

1. WHEN renderiza com `label` THEN o label SHALL aparecer acima, em `caption`/`inkMuted`, caixa alta com tracking.
2. WHEN em repouso THEN o campo SHALL ter fundo `canvas`, borda 1px `border`, raio 0 e altura 52.
3. WHEN focado THEN a borda SHALL virar `ink` 2px.
4. WHEN `error="mensagem"` THEN a borda SHALL virar `error` e a mensagem SHALL aparecer abaixo em `caption`/`error`.
5. WHEN `error` é ausente THEN SHALL NOT renderizar espaço/texto de erro.

**Independent Test**: `npm test` — render + fireEvent de foco assertando bordas e mensagem.

---

### P1: `Screen` com gutter e safe area ⭐ MVP

**User Story**: Como desenvolvedor, quero um container de tela que garanta o gutter 24 e a safe area para que nenhum conteúdo encoste na borda (regra inegociável do §4).

**Acceptance Criteria**:

1. WHEN `Screen` renderiza THEN SHALL aplicar `paddingHorizontal` 24 (`spacing.xxl`) e respeitar a safe area.
2. WHEN `surface="editorial"` THEN o fundo SHALL ser `editorial`; default SHALL ser `canvas`.

**Independent Test**: `npm test` — render assertando padding e cor de fundo.

---

### P1: Galeria `/dev/components` ⭐ MVP

**User Story**: Como dono do produto, quero uma tela interna exibindo todos os componentes e estados para validar visualmente o design system de uma vez (é o UAT desta etapa).

**Acceptance Criteria**:

1. WHEN navego para `/dev/components` THEN SHALL ver: as 6 variantes de `Text`, as 4 variantes de `Button` (+ estado disabled), `Input` nos estados repouso/foco/erro, tudo dentro de `Screen`.
2. WHEN a galeria renderiza THEN SHALL incluir uma seção em contexto escuro (`editorial`) com as variantes `onDark`.
3. WHEN o usuário confere a galeria no Expo Go THEN ela SHALL bater com o `DESIGN_SYSTEM.md`: cantos retos, sem sombra, botão primário outline 2px — **UAT interativo (AD-003)**.

**Independent Test**: UAT — abrir `/dev/components` no Expo Go e conferir com você.

---

## Edge Cases

- WHEN `Button` disabled é pressionado THEN `onPress` SHALL NOT ser chamado (além do estilo).
- WHEN texto do botão é longo THEN SHALL truncar/quebrar sem estourar a altura mínima nem os cantos retos.
- WHEN font scaling do sistema aumenta THEN o corpo SHALL escalar (Dynamic Type, §8) — e `caption` nunca abaixo de 12.
- WHEN `Input` recebe foco e depois blur sem erro THEN a borda SHALL voltar a 1px `border`.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| COMP-01 | P1: Text | Execute | Pending |
| COMP-02 | P1: Button | Execute | Pending |
| COMP-03 | P1: Input | Execute | Pending |
| COMP-04 | P1: Screen | Execute | Pending |
| COMP-05 | P1: Galeria /dev/components | Execute | Pending |

**Coverage:** 5 total, 0 mapped to tasks (tasks implícitas no Execute — escopo Medium), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] **Galeria de componentes confere com o `DESIGN_SYSTEM.md`** (cantos retos, sem sombra, botão outline 2px) — UAT interativo com o usuário (AD-003).
- [ ] Gate automatizado verde: `tsc --noEmit` + lint + testes de componente (estilos e comportamento por variante/estado).
- [ ] Commits atômicos por componente (AD-005).
