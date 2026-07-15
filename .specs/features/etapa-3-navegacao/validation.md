# Etapa 3 — Navegação e Deep Link: Validation

**Date**: 2026-07-14
**Spec**: `.specs/features/etapa-3-navegacao/spec.md`
**Diff range**: `5f328f0..4179496` (commits `6c09f42`, `db69a24`, `6917705`, `4179496`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

Escopo Medium — sem tasks.md formal. Os 4 commits atômicos mapeiam 1:1 aos requisitos (AD-005):

| Commit | Requisito | Status |
| --- | --- | --- |
| `6c09f42` — rotas do convidado em esqueleto | NAV-01 | ✅ Done (ver gap de teste no AC3) |
| `db69a24` — rotas do host em esqueleto | NAV-02 | ✅ Done |
| `6917705` — deep link e edge cases de slug | NAV-03 | ✅ Done (AC3 = UAT) |
| `4179496` — home vira hub esqueleto | NAV-04 | ✅ Done |

---

## Spec-Anchored Acceptance Criteria

### NAV-01 — Rotas do convidado em esqueleto

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: `/e/teste-slug` renderiza o convite com o slug lido | tela de convite + slug `teste-slug` exibido | `src/__tests__/guest-routes.test.tsx:12-16` — `findByText('Você foi convidado')` + `getByText('evento: teste-slug')` | ✅ PASS |
| AC2: toco em "Câmera" → `/e/teste-slug/camera` com título e o mesmo slug | navegação por toque + título + slug | Composto: `src/__tests__/deep-link.test.tsx:31-32` — `fireEvent.press(getByRole('link', { name: 'Câmera' }))` → `findByText('Câmera')`; destino com slug: `guest-routes.test.tsx:18-22` — `findByText('Câmera')` + `getByText('evento: teste-slug')` via initialUrl. Sensor: mutante do pathname do Link da câmera **morto** | ✅ PASS (nota: slug pós-toque asserido por composição, não no mesmo teste) |
| AC3: toco em "Galeria" → `/e/teste-slug/gallery` com título e o mesmo slug | navegação por toque + título + slug | Destino via initialUrl: `guest-routes.test.tsx:24-28` — `findByText('Galeria')` + `getByText('evento: teste-slug')`. **Nenhum teste pressiona o link "Galeria"** — a cláusula "WHEN toco" não tem evidência (evidence-or-zero). Sensor: mutante do pathname do Link da galeria **sobreviveu** (15/15 passaram) | ❌ GAP (parcial — tela coberta, ação de navegação não) |

### NAV-02 — Rotas do host em esqueleto

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: `/host/login` esqueleto com botão levando a `/host/events` | tela de login + navegação para `/host/events` | `src/__tests__/host-routes.test.tsx:9-19` — `findByText('Login do host')`, `press(link 'Entrar')` → `findByText('Meus eventos')` + `expect(view.getPathname()).toBe('/host/events')` | ✅ PASS |
| AC2: de `/host/events` navego ao evento e dele à moderação | navegação lista → `/host/events/[id]` → `.../moderation` | `host-routes.test.tsx:21-29` — `press(link 'Evento de exemplo')` → `getPathname() === '/host/events/evento-demo'`; `:31-41` — do evento, `press(link 'Moderação')` → `findByText('Moderação')` + `getByText('id: evento-demo')` | ✅ PASS |
| AC3: id lido da URL exibido no evento e na moderação | `id: evento-demo` visível | `host-routes.test.tsx:27` (pós-navegação), `:36` (evento direto), `:40` (moderação pós-navegação), `:43-47` — `/host/events/evento-demo/moderation` direto → `getByText('id: evento-demo')` | ✅ PASS |

### NAV-03 — Deep link abre a rota do convidado

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: app aberto com URL `/e/{slug}` (scheme) renderiza o convite com o slug exato | tela de convite + slug | `src/__tests__/deep-link.test.tsx:9-15` — `renderRouter(..., { initialUrl: 'yourscheme:///e/teste-slug' })` → `findByText('Você foi convidado')` + `getByText('evento: teste-slug')`. Scheme genérico `yourscheme` é o do ambiente de teste; o `eterniza://` literal é config do `app.json` (presente desde a Etapa 1) e será re-verificado na Etapa 6 (dev build) — **assumption registrada na spec** (adaptação do ✅ Verificar) | ✅ PASS (mapeamento URL→tela idêntico ao prometido na assumption) |
| AC2: slug com hífens e números lido integralmente | `casamento-ana-joao-x7k2` sem truncar | `src/__tests__/guest-routes.test.tsx:30-33` — `findByText('evento: casamento-ana-joao-x7k2')` | ✅ PASS |
| AC3: abrir o link em dispositivo físico → app abre já no convite do slug | comportamento em dispositivo | — | ⏳ UAT pendente (AD-003) — `exp://<tunnel>/--/e/teste-slug` no iPhone via Expo Go |

### NAV-04 — Home como hub esqueleto

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: home exibe "Sou host" navegando para `/host/login` | botão presente + navegação | `src/__tests__/home.test.tsx:8-16` — `findByText('Eterniza')`, `press(link 'Sou host')` → `findByText('Login do host')` + `getPathname() === '/host/login'` | ✅ PASS |
| AC2: link "componentes →" removido; galeria apenas em `__DEV__` | ausência do link antigo; acesso dev gated | `home.test.tsx:18-22` — `expect(queryByText('componentes →')).toBeNull()`; `:24-28` — link dev presente sob `__DEV__` (true no jest); o "apenas" é o gate `__DEV__` em `src/app/index.tsx:22` — sensor: mutante `__DEV__ → false` **morto** | ✅ PASS |

**Status**: ❌ 1 gap presente (NAV-01 AC3, cláusula de toque) — 8/9 ACs automatizáveis com evidência; 1 item de dispositivo → UAT (AD-003)

---

## Edge Cases

- [x] **`/e/` sem slug → unmatched padrão, sem crash**: `src/__tests__/deep-link.test.tsx:22-25` — `findByTestId('expo-router-unmatched')`. ✅
- [x] **Slug URL-encoded exibido decodificado**: `deep-link.test.tsx:17-20` — initialUrl `/e/ana%2Djoao%2Dx7k2` → `findByText('evento: ana-joao-x7k2')`. ✅
- [x] **Convite → câmera → volta preserva o slug**: `deep-link.test.tsx:27-37` — press 'Câmera', press 'Voltar' → `findByText('Você foi convidado')` + `getByText('evento: teste-slug')`. ✅

---

## Gate Check

| Gate | Comando | Resultado |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | ✅ exit 0, sem erros |
| Lint | `npm run lint` (`expo lint`) | ✅ exit 0, sem warnings |
| Testes | `npm test` (jest-expo) | ✅ 9 suites, **53 passed, 0 failed, 0 skipped** |

- **Test count antes da feature**: 38 (Etapas 1–2)
- **Test count depois**: 53 — delta **+15** (guest-routes 4, host-routes 4, deep-link 4, home 3)
- **Integridade**: nenhum teste removido ou enfraquecido; os 38 anteriores continuam passando
- **Testes órfãos**: nenhum — os 15 novos mapeiam aos ACs NAV-01..04, aos 3 edge cases da spec e ao NAV-03 AC2

---

## Discrimination Sensor

Executado em estado descartável (edição → `npx jest <suite>` → `git checkout -- <arquivo>`). Working tree confirmado limpo (`git status --porcelain` vazio) após cada rodada e ao final.

| # | Mutação | File:line | Killed? |
| --- | --- | --- | --- |
| 1 | Link "Câmera": pathname `/e/[slug]/camera` → `/e/[slug]/gallery` | `src/app/e/[slug]/index.tsx:18` | ✅ Killed (1 failed / 8 — "voltar da câmera preserva o slug") |
| 2 | Link "Entrar": href `/host/events` → `/` | `src/app/host/login.tsx:16` | ✅ Killed (1 failed / 4 — AC1 do host) |
| 3 | Slug fixo: `evento: {slug}` → `evento: teste-slug` | `src/app/e/[slug]/index.tsx:17` | ✅ Killed (2 failed / 8 — slug com hífens + URL-encoded) |
| 4 | Gate dev: `__DEV__ ?` → `false ?` | `src/app/index.tsx:22` | ✅ Killed (1 failed / 3 — NAV-04 AC2) |
| 5 | Link "Galeria": pathname `/e/[slug]/gallery` → `/e/[slug]/camera` | `src/app/e/[slug]/index.tsx:21` | ❌ **Survived** (15/15 passaram) → fix task criada |

**Sensor depth**: lightweight (default) + 1 sonda dirigida ao gap suspeito do AC3
**Result**: 4/5 killed — ❌ FAIL. Mutante 5 confirma empiricamente o gap do NAV-01 AC3: um fio trocado no botão "Galeria" passaria despercebido pela suíte.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code (8 telas esqueleto = título + slug/id + navegação; sem API, sem auth, sem conteúdo real — Out of Scope respeitado) | ✅ |
| Surgical changes (só rotas novas + home; dep `expo-asset` justificada no commit `6c09f42` — dependência direta do expo-font que ficaria apenas transitiva, + plugin no `app.json`) | ✅ |
| No scope creep (sem tela 404 custom, sem guarda de auth, sem universal link — tudo adiado conforme spec) | ✅ |
| Matches patterns (kebab-case, `@/` imports, `Screen`/`Text`/`Button` da Etapa 2, tokens do theme — AD-004) | ✅ |
| Spec-anchored outcome check (títulos, slugs, ids e pathnames assertados = literais da spec; `getPathname()` asserta a URL canônica) | ✅ |
| Per-layer coverage (rotas: happy path por URL direta + navegação por toque + edge cases) — exceto cláusula de toque do NAV-01 AC3 | ❌ |
| Todo teste mapeia a um AC ou edge case — sem testes órfãos | ✅ |
| Guidelines seguidas (STATE.md AD-001..AD-007; RNTL v14 com `await` em render/fireEvent; `getPathname` no objeto retornado do `renderRouter`; casts `Href` comentados como workaround do typegen SDK 54 — não é bug) | ✅ |

**Observações menores (não bloqueantes):**

1. O cast `as unknown as Href` em `src/app/host/events/index.tsx:17` (e `as Href` em `login.tsx:16`) é workaround documentado em comentário para o typegen do SDK 54 que gera pathnames `/index` rejeitados pelo runtime — verificado que os testes assertam a URL canônica resultante (`getPathname()`), então o workaround está protegido por teste.
2. No AC2 do NAV-01, o slug pós-toque é asserido por composição de dois testes (toque em `deep-link.test.tsx:31-32`; título+slug do destino em `guest-routes.test.tsx:18-22`) — aceitável, mas o fix do AC3 pode aproveitar para assertar `getPathname()` também no fluxo do convidado.

---

## Fix Plans

### Fix 1: NAV-01 AC3 — cláusula "toco em Galeria" sem teste (mutante sobrevivente)

- **Root cause**: `guest-routes.test.tsx` cobre a tela gallery apenas via `initialUrl`; nenhum teste dispara `fireEvent.press` no link "Galeria" do convite. Um pathname errado no Link (`src/app/e/[slug]/index.tsx:21`) não é detectado.
- **Fix task**: em `src/__tests__/guest-routes.test.tsx`, adicionar teste que renderiza `/e/teste-slug` (manter a referência do `renderRouter` para `getPathname`), pressiona `getByRole('link', { name: 'Galeria' })` e asserta `view.getPathname() === '/e/teste-slug/gallery'` + `evento: teste-slug` na tela. Re-rodar o mutante 5 para confirmar kill.
- **Priority**: Major (asserção ausente permite regressão de navegação silenciosa; código atual está correto)

---

## Interactive UAT — Pendências (AD-003)

| # | Teste | Esperado |
| --- | --- | --- |
| 1 | Deep link no iPhone (NAV-03 AC3 / Success Criterion) | Abrir `exp://<host-do-tunnel>/--/e/teste-slug` no iPhone (Expo Go, `npx expo start --tunnel`) → app abre direto na tela "Você foi convidado" com `evento: teste-slug` |
| 2 | Fluxo do convidado no dispositivo | Convite → Câmera → Voltar → Galeria, slug constante em todas as telas |
| 3 | Fluxo do host no dispositivo | Home → "Sou host" → Login → Entrar → Meus eventos → Evento de exemplo → Moderação, id `evento-demo` exibido |
| 4 | Home sem link antigo | Link "componentes →" ausente; em dev build/Expo Go (dev) o link discreto da galeria aparece |

**Nota**: o comando literal `npx uri-scheme open "eterniza://e/teste-slug"` fica para a Etapa 6 (dev build) — adaptação registrada na spec (assumption) e coberta aqui pelo mapeamento URL→tela via `renderRouter` + UAT `exp://`.

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| NAV-01 | Pending | ❌ Needs Fix (código correto; teste do AC3 incompleto — Fix 1) |
| NAV-02 | Pending | ✅ Verified |
| NAV-03 | Pending | ✅ Verified (automatizável) / ⏳ UAT pendente (AC3 — dispositivo) |
| NAV-04 | Pending | ✅ Verified |

---

## Summary

**Overall**: ❌ Not Ready (1 fix task de teste) — código de produção sem defeito encontrado; a suíte não discrimina o Link "Galeria"

**Spec-anchored check**: 8/9 ACs automatizáveis com evidência `file:line`; 1 gap (NAV-01 AC3, cláusula de toque); 1 item de dispositivo → UAT (AD-003); adaptação do ✅ Verificar (uri-scheme → renderRouter + exp://) validada contra a assumption da spec
**Sensor**: 4/5 mutantes mortos; mutante 5 (pathname do Link "Galeria") sobreviveu → Fix 1
**Gate**: tsc ✅ · lint ✅ · jest 53/53 ✅ (baseline 38 → +15)
**Working tree**: limpo ao final (`git status --porcelain` vazio, exceto este validation.md)

**What works**: árvore completa de 8 rotas navegável e asserida (slug/id lidos da URL, decodificados, preservados no back); deep link por initialUrl com scheme; unmatched sem crash; home hub com gate `__DEV__` discriminado por teste; `getPathname()` asserta URLs canônicas nos fluxos do host e da home.

**Issues found**: Fix 1 — adicionar teste de toque no link "Galeria" (asserção de pathname + slug) e re-rodar o mutante 5.

**Next steps**: (1) rotear Fix 1 a um implementer e re-verificar (iteração 1 de 3); (2) após o fix, rodar o UAT interativo (4 itens acima) no iPhone via tunnel para fechar NAV-03 AC3 e o Success Criterion do deep link.

---

## Fix 1 → Re-Verify (iteração 1 de 3) — 2026-07-14

**Fix aplicado**: dois testes de navegação por press adicionados em `src/__tests__/guest-routes.test.tsx` — toque em "Câmera" (AC2) e em "Galeria" (AC3), ambos assertando `view.getPathname()` (`/e/teste-slug/camera` e `/e/teste-slug/gallery`) e o slug exibido na tela de destino.

**Re-verificação empírica do mutante sobrevivente (M5)**: o mesmo mutante (pathname do Link "Galeria" → `/e/[slug]/camera` em `src/app/e/[slug]/index.tsx:21`) foi re-injetado em estado descartável → `npm test -- guest-routes` → **1 failed** (falha exatamente na asserção de pathname do novo teste) → arquivo restaurado (`git checkout`), working tree limpo. **Mutante morto.**

**Gate pós-fix**: tsc ✅ · lint ✅ · jest **55/55** ✅ (53 → +2, nenhum teste removido).

**Lesson registrada**: L-001 (candidate, signal `surviving_mutant`) — "cobrir a tela de destino via initialUrl não cobre a ação de navegar; todo Link/botão de navegação precisa de um teste de press com asserção de pathname".

**Traceability final**: NAV-01 ✅ Verified · NAV-02 ✅ Verified · NAV-03 ✅ Verified (automatizável) / ⏳ UAT (AC3) · NAV-04 ✅ Verified

**Overall final (automatizável)**: ✅ **PASS** — pendente apenas o UAT interativo (AD-003).
