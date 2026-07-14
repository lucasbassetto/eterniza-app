# Etapa 1 — Fundação: Validation

**Date**: 2026-07-14
**Spec**: `.specs/features/etapa-1-fundacao/spec.md`
**Diff range**: `f083aba..9309e07` (commits `18eb9f3`, `6acc87a`, `9309e07`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

Escopo Medium — sem tasks.md formal. Os 3 commits atômicos mapeiam 1:1 aos requisitos:

| Commit | Requisito | Status |
| --- | --- | --- |
| `18eb9f3` — scaffold Expo SDK 57 + expo-router | FUND-01 | ✅ Done |
| `6acc87a` — design tokens + testes | FUND-02 | ✅ Done |
| `9309e07` — fontes da marca + tela placeholder | FUND-03 | ✅ Done |

---

## Spec-Anchored Acceptance Criteria

Valores esperados dos testes conferidos **diretamente contra `DESIGN_SYSTEM.md` §9 (linhas 197–227)**, não contra `theme.ts`.

### FUND-01 — Projeto Expo executável com expo-router

| Criterion | Spec-defined outcome | Evidência | Result |
| --- | --- | --- | --- |
| WHEN `npx expo start` roda THEN bundler inicia sem erros e app abre no Expo Go | app visível no Expo Go | Config: `package.json:3` — `"main": "expo-router/entry"`; `app.json:27` — plugin `"expo-router"` | ⏳ UAT pendente (AD-003) — config verificada por inspeção |
| WHEN app abre THEN expo-router resolve a rota raiz sem tela de erro | rota raiz renderiza | `src/app/index.tsx:5` — `export default function Index()`; `src/app/_layout.tsx:31` — `return <Stack screenOptions={{ headerShown: false }} />` | ⏳ UAT pendente (resolução em dispositivo); estrutura ✅ por inspeção |
| WHEN `tsc --noEmit` roda THEN termina sem erros de tipo | exit code 0 | Gate executado nesta validação: `npx tsc --noEmit` → exit 0 | ✅ PASS |

### FUND-02 — Design tokens em código (`theme.ts`)

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| WHEN `theme.ts` comparado ao §9 THEN `colors` idêntico | 15 chaves; ex.: `canvas: '#FFFFFF'`, `accent: '#136F99'`, `overlay: 'rgba(0,0,0,0.55)'` (§9, DESIGN_SYSTEM.md:197–213) | `src/theme/__tests__/theme.test.ts:9-25` — `expect(colors).toEqual({...})` com os 15 pares exatos do §9 | ✅ PASS (valores batem 1:1 com o documento) |
| WHEN `theme.ts` comparado ao §9 THEN `spacing` idêntico | `xs:4 … huge:48` (DESIGN_SYSTEM.md:215) | `src/theme/__tests__/theme.test.ts:29-38` — `expect(spacing).toEqual({ xs:4, sm:8, md:12, lg:16, xl:20, xxl:24, xxxl:32, huge:48 })` | ✅ PASS |
| WHEN `theme.ts` comparado ao §9 THEN `radius` idêntico | `none:0, minor:4, pill:64, circle:999` (DESIGN_SYSTEM.md:218) | `src/theme/__tests__/theme.test.ts:42-47` — `expect(radius).toEqual({ none:0, minor:4, pill:64, circle:999 })` | ✅ PASS |
| WHEN `theme.ts` comparado ao §9 THEN `type` idêntico | 6 estilos com fontFamily/fontSize/lineHeight/letterSpacing exatos (DESIGN_SYSTEM.md:220–227) | `src/theme/__tests__/theme.test.ts:51-64` — `expect(type).toEqual({...})` incluindo `heading.textTransform: 'uppercase'` e `caption.lineHeight: 14.5` | ✅ PASS |
| WHEN teste unitário de tokens roda THEN passa | `npm test` verde | Gate: `npm test` → 4 passed, 0 failed | ✅ PASS |

### FUND-03 — Fontes carregadas + tela placeholder

| Criterion | Spec-defined outcome | Evidência | Result |
| --- | --- | --- | --- |
| WHEN app inicia THEN splash permanece até as 4 fontes carregarem; nunca renderiza texto com fonte do sistema | `Cormorant_400Regular`, `Cormorant_500Medium`, `Archivo_300Light`, `Archivo_400Regular` | `src/app/_layout.tsx:8` — `SplashScreen.preventAutoHideAsync()`; `:11-16` — `useFonts({...})` com exatamente as 4 fontes da spec; `:27-29` — `if (!fontsLoaded && !fontError) return null` | ✅ PASS por inspeção de código (comportamento em runtime = UAT) |
| WHEN tela placeholder renderiza THEN fundo `canvas`, título Archivo (`display`/`title`), corpo Cormorant (`body`), gutter 24 | `#FFFFFF`, `type.display`, `type.body`, `paddingHorizontal: 24` | `src/app/index.tsx:20` — `backgroundColor: colors.canvas`; `:8` — `<Text style={[type.display, ...]}>Eterniza</Text>`; `:9` — `<Text style={[type.body, ...]}>`; `:21` — `paddingHorizontal: spacing.xxl` (= 24 por `theme.ts:20`, validado contra §9) | ✅ PASS por inspeção (aparência real = UAT) |
| WHEN usuário observa a tela THEN fontes visivelmente distintas (serifa no corpo, grotesca no título) | julgamento visual humano | — (não automatizável por definição) | ⏳ UAT pendente (AD-003) |

**Status**: ✅ Todos os ACs automatizáveis cobertos com evidência; 0 spec-precision gaps; itens visuais → UAT pendente conforme AD-003.

---

## Edge Cases

- [x] **Falha no carregamento de fontes** → esconder splash, renderizar com fallback, logar erro: `src/app/_layout.tsx:18-25` — `if (fontError) console.error(...)` e `if (fontsLoaded || fontError) SplashScreen.hideAsync()`; `:27` — o `return null` só ocorre enquanto `!fontsLoaded && !fontError`, então com `fontError` a árvore renderiza. ✅ Verificado por inspeção. *Sem teste de componente — aceito: a spec (Assumptions) restringe o gate automatizado a `tsc` + teste de tokens (AD-003), e não há infra de component-test nesta etapa. Não é gap para o escopo Medium; candidato a teste quando a Etapa 2 introduzir componentes.*
- [x] **Clone limpo funciona com `npm install && npx expo start`** → nenhum passo manual: `package.json` traz todos os deps (fontes em `dependencies:6-7`), `.gitignore` presente, README presente, alias `@/*` resolvido em `tsconfig.json:6-13`. ✅ Por inspeção (execução real em outra máquina = fora do escopo desta validação).

---

## Gate Check

| Gate | Comando | Resultado |
| --- | --- | --- |
| Typecheck | `npx tsc --noEmit` | ✅ exit 0, sem erros |
| Lint | `npm run lint` (`expo lint`) | ✅ exit 0, sem warnings |
| Testes | `npm test` (jest-expo) | ✅ 1 suite, **4 passed, 0 failed, 0 skipped** |

- **Test count antes da feature**: 0 (projeto não existia)
- **Test count depois**: 4 — delta +4
- **Integridade**: nenhum teste removido/enfraquecido (baseline inexistente)

---

## Discrimination Sensor

Executado em estado descartável (mutação via edição → `npm test` → `git checkout -- src/theme/theme.ts`). Working tree confirmado limpo após cada rodada e ao final.

| # | Mutação | File:line | Killed? |
| --- | --- | --- | --- |
| 1 | `colors.accent: '#136F99'` → `'#146F99'` | `src/theme/theme.ts:14` | ✅ Killed (teste `colors` falhou, exit 1) |
| 2 | `spacing.xxl: 24` → `28` (valor do gutter) | `src/theme/theme.ts:20` | ✅ Killed (exit 1) |
| 3 | `type.body.fontFamily: 'Cormorant_500Medium'` → `'Archivo_400Regular'` | `src/theme/theme.ts:29` | ✅ Killed (teste `type` falhou, exit 1) |

**Sensor depth**: lightweight (default)
**Result**: 3/3 killed — ✅ PASS. Os testes discriminam regressões em cores, spacing e tipografia.

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code (nada além do pedido; sem pastas vazias adiantadas — AD-001) | ✅ |
| Surgical changes (apenas scaffold + theme + layout + index + teste) | ✅ |
| No scope creep (sem componentes base, rotas reais, API — Out of Scope respeitado) | ✅ |
| Matches patterns (template oficial Expo; tokens copiados, não reinterpretados — AD-004) | ✅ |
| Spec-anchored outcome check (valores assertados = §9 do documento) | ✅ |
| Per-layer coverage (domínio = tokens 1:1; sem rotas/serviços nesta etapa) | ✅ |
| Todo teste mapeia a um AC (4 testes ↔ FUND-02 AC1/AC2; nenhum teste órfão) | ✅ |
| Guidelines do projeto seguidas (`STATE.md` AD-001…AD-005; `DESIGN_SYSTEM.md` §9) | ✅ |

Observação menor (não bloqueante): `app.json:15` mantém `backgroundColor: "#E6F4FE"` do adaptive icon padrão do template — ícone/splash definitivos são Etapa 11 (Out of Scope declarado).

---

## Interactive UAT — Pendências (confirmar com o usuário no Expo Go)

| # | Teste | Esperado |
| --- | --- | --- |
| 1 | `npx expo start` + abrir no Expo Go | Bundler inicia sem erros; app abre sem tela de erro de rota |
| 2 | Splash | Splash permanece até as fontes carregarem; o texto nunca "pisca" com fonte do sistema |
| 3 | Tela placeholder | Fundo branco (`canvas`), título "Eterniza" em Archivo (grotesca, leve), parágrafo em Cormorant (serifada), margem lateral de 24 visível |
| 4 | Distinção tipográfica | As duas fontes são visivelmente distintas (serifa no corpo × grotesca no título) |

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| FUND-01 | Pending | ✅ Verified (automatizável) / ⏳ UAT pendente (abrir no Expo Go) |
| FUND-02 | Pending | ✅ Verified |
| FUND-03 | Pending | ✅ Verified (código) / ⏳ UAT pendente (visual) |

---

## Summary

**Overall**: ✅ PASS (parte automatizável) — ⏳ UAT interativo pendente para fechar os Success Criteria da spec

**Spec-anchored check**: 8/8 ACs automatizáveis com evidência e valores idênticos ao §9; 0 spec-precision gaps; 3 itens visuais roteados para UAT (AD-003)
**Sensor**: 3/3 mutações mortas
**Gate**: tsc ✅ · lint ✅ · jest 4/4 ✅
**Working tree**: limpo ao final (`git status` — nothing to commit)

**What works**: tokens 1:1 com o DESIGN_SYSTEM.md §9 (verificado contra o documento, não contra a implementação); testes discriminantes; splash/fallback de fontes corretos por inspeção; tela placeholder usa os tokens exigidos.

**Issues found**: nenhum bloqueante. Nota: lógica de splash/fallback sem teste automatizado — aceito pelo escopo (AD-003 + Medium); revisitar quando houver infra de component-test (Etapa 2).

**Next steps**: rodar o UAT interativo (4 itens acima) com o usuário no Expo Go para marcar os Success Criteria visuais.
