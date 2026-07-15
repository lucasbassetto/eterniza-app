# Etapa 1 — Fundação do Projeto: Specification

> Fonte: `ROADMAP.md` Etapa 1. Escopo: **Medium** (feature clara, sem decisão arquitetural nova → Design e Tasks formais dispensados; passos atômicos listados no Execute).

## Problem Statement

O app Eterniza ainda não existe como projeto de código — o workspace contém apenas documentação. Antes de qualquer feature de produto, é preciso a fundação: projeto Expo + TypeScript com `expo-router`, os design tokens do `DESIGN_SYSTEM.md` §9 em código, as duas fontes da identidade carregadas corretamente e uma tela que prove tudo isso funcionando no dispositivo.

## Goals

- [ ] Projeto Expo (TypeScript) rodando no Expo Go, com `expo-router` como sistema de rotas
- [ ] `theme.ts` idêntico ao `DESIGN_SYSTEM.md` §9 (cores, spacing, radius, tipografia)
- [ ] Fontes Cormorant e Archivo carregadas via `@expo-google-fonts/*`, com splash mantida até estarem prontas
- [ ] Tela placeholder usando os tokens (fundo `canvas`, título Archivo, corpo Cormorant)

## Out of Scope

| Feature | Reason |
|---|---|
| Componentes base (`Text`, `Button`, `Input`, `Screen`) | Etapa 2 |
| Rotas reais e deep link | Etapa 3 |
| Cliente de API / TanStack Query | Etapa 4 |
| Câmera, dev build, VisionCamera | Etapa 6 |
| Ícone/splash definitivos do app | Etapa 11 (polimento) — splash padrão do Expo basta aqui |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Onde o projeto vive | Scaffold **in-place** em `d:\eterniza-app` (raiz do workspace), preservando os 3 `.md` existentes | O workspace já é o repositório do app; evitar subpasta aninhada | n |
| Git | `git init` nesta etapa + commit atômico ao final | ROADMAP exige "um commit atômico" por etapa e o diretório ainda não é repo | n |
| Versão do Expo SDK | ~~Última estável (SDK 57)~~ → **SDK 54**, fixado | UAT revelou que o Expo Go da App Store (iPhone do usuário) suporta só SDK 54 — ver AD-006 | y |
| Gerenciador de pacotes | `npm` | Default do ecossistema Expo; nada no brief indica outro | n |
| Gate automatizado da etapa | `tsc --noEmit` + teste unitário (`jest-expo`) comparando os tokens de `theme.ts` com os valores do §9 | O contrato do skill exige teste derivado dos ACs; tokens são a única parte verificável em código (AD-003: visual = UAT) | n |
| Conteúdo da tela placeholder | "Eterniza" em `display`/Archivo + parágrafo curto em `body`/Cormorant, fundo `canvas`, gutter 24 | Mínimo que prova os 3 requisitos visuais do roadmap | n |
| Estrutura de pastas | `app/` (rotas expo-router), `src/theme/theme.ts`, demais pastas (`src/api`, `src/components`) só quando as etapas correspondentes chegarem | Não adiantar estrutura vazia (AD-001) | n |

**Open questions:** none — tudo resolvido ou logado acima.

**Dimensões implícitas (persistência, chamadas externas, auth, pagamentos, concorrência, transições de estado):** N/A para este escopo — a etapa é scaffolding local, sem estado nem I/O de rede. Única dimensão presente: falha no carregamento de fontes (coberta em Edge Cases).

---

## User Stories

### P1: Projeto Expo executável com expo-router ⭐ MVP

**User Story**: Como desenvolvedor, quero um projeto Expo + TypeScript com `expo-router` configurado para que todas as etapas seguintes tenham onde ser construídas.

**Acceptance Criteria**:

1. WHEN `npx expo start` é executado THEN o bundler SHALL iniciar sem erros e o app SHALL abrir no Expo Go.
2. WHEN o app abre THEN o `expo-router` SHALL resolver a rota raiz (`app/index.tsx`) — sem tela de erro de rota.
3. WHEN `tsc --noEmit` roda THEN SHALL terminar sem erros de tipo.

**Independent Test**: abrir no Expo Go e ver qualquer conteúdo renderizado pela rota raiz.

---

### P1: Design tokens em código (`theme.ts`) ⭐ MVP

**User Story**: Como desenvolvedor, quero os tokens do `DESIGN_SYSTEM.md` §9 em `theme.ts` para que toda UI futura consuma a identidade visual de um único lugar.

**Acceptance Criteria**:

1. WHEN `theme.ts` é comparado ao `DESIGN_SYSTEM.md` §9 THEN os objetos `colors`, `spacing`, `radius` e `type` SHALL ter exatamente as mesmas chaves e valores (cores hex/rgba, números, nomes de fonte).
2. WHEN o teste unitário de tokens roda THEN SHALL passar, comparando cada valor com o esperado do §9.

**Independent Test**: `npm test` verde no teste de tokens.

---

### P1: Fontes carregadas + tela placeholder estilizada ⭐ MVP

**User Story**: Como desenvolvedor (e dono do produto), quero ver Cormorant e Archivo renderizadas numa tela com os tokens para confirmar que a identidade editorial funciona no dispositivo real.

**Acceptance Criteria**:

1. WHEN o app inicia THEN a splash screen SHALL permanecer visível até as fontes (`Cormorant_400Regular`, `Cormorant_500Medium`, `Archivo_300Light`, `Archivo_400Regular`) estarem carregadas — nunca renderizar texto com fonte do sistema.
2. WHEN a tela placeholder renderiza THEN SHALL usar fundo `canvas` (#FFFFFF), título em Archivo (token `display` ou `title`) e corpo em Cormorant (token `body`), com gutter lateral 24.
3. WHEN o usuário observa a tela no Expo Go THEN as duas fontes SHALL ser visivelmente distintas (serifa no corpo, grotesca no título) — **UAT interativo (AD-003)**.

**Independent Test**: UAT — abrir no Expo Go e confirmar visualmente com o usuário.

---

## Edge Cases

- WHEN o carregamento de fontes falha (erro do `useFonts`) THEN o app SHALL esconder a splash e renderizar mesmo assim (fallback de sistema), sem travar em splash infinita — logando o erro no console.
- WHEN o projeto é aberto em outro clone/máquina THEN `npm install && npx expo start` SHALL bastar (nenhum passo manual não documentado).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| FUND-01 | P1: Projeto Expo executável | Execute | Verified (UAT pendente) — commit 18eb9f3 |
| FUND-02 | P1: Design tokens em código | Execute | Verified — commit 6acc87a |
| FUND-03 | P1: Fontes + tela placeholder | Execute | Verified (UAT pendente) — commit 9309e07 |

**Coverage:** 3 total, 0 mapped to tasks (tasks implícitas no Execute — escopo Medium), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] **App abre no Expo Go com a tela estilizada e as duas fontes visíveis** — verificado por UAT interativo com o usuário (AD-003). ⏳ pendente
- [x] Gate automatizado verde: `tsc --noEmit` + lint + 4/4 testes de tokens (Verifier PASS, sensor 3/3 killed — ver `validation.md`).
- [x] Commits atômicos por task (AD-005): f083aba, 18eb9f3, 6acc87a, 9309e07.
