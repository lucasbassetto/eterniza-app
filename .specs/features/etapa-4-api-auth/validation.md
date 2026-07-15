# Etapa 4 — Cliente da API + Auth do Host: Validation

**Date**: 2026-07-14
**Spec**: `.specs/features/etapa-4-api-auth/spec.md`
**Diff range**: `327b10a..29f512f` (commits `3341a00`, `601cc9e`, `225a9c2`, `29f512f`)
**Verifier**: independent sub-agent (author ≠ verifier), evidence-or-zero

---

## Task Completion

Escopo Medium — sem tasks.md formal. Os 4 commits atômicos mapeiam 1:1 aos requisitos (AD-005):

| Commit | Requisito | Status |
| --- | --- | --- |
| `3341a00` — cliente http com envelope da api | API-01 | ✅ Done |
| `601cc9e` — tanstack query no root | API-02 | ✅ Done |
| `225a9c2` — login real do host com sessão persistida | API-03 | ✅ Done (AC5 = UAT) |
| `29f512f` — re-login automático na expiração | API-04 | ✅ Done (ver sensor: mutante sobrevivente no elo listener→UI) |

---

## Spec-Anchored Acceptance Criteria

Formatos mockados conferidos contra `APP_BRIEF.md` §3: envelope `{success, message, data, timestamp}`, 400 com `errors` (campo → mensagem, exemplo literal do brief `{ name: 'Nome do evento é obrigatório' }`), 401 corpo vazio tratado por status, header `Authorization: Bearer <token>`, corpo do login `{email, password}`, corpo do register `{name, email, password}`.

### API-01 — Cliente da API com envelope

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: resposta 2xx retorna `data` tipado do envelope | `data` do envelope `{success, message, data, timestamp}` | `src/api/__tests__/client.test.ts:29-43` — envelope completo do brief §3 mockado; `expect(request(...)).resolves.toEqual({ id: 'uuid-1', name: 'Casamento Ana & João' })` (só o `data`) | ✅ PASS |
| AC2: 400 com `errors` expõe `message` + mapa campo→mensagem | `message` e `errors` utilizáveis direto no Input | `src/api/__tests__/client.test.ts:45-59` — `expect(error.status).toBe(400)`, `expect(error.message).toBe('Erro de validação')`, `expect(error.errors).toEqual({ name: 'Nome do evento é obrigatório' })` (exemplo literal do brief) | ✅ PASS |
| AC3: 401 corpo vazio tratado pelo status, sem parse | sem crash, sem `json()` | `src/api/__tests__/client.test.ts:61-70` — `json()` rejeita com `SyntaxError`; `expect(error.status).toBe(401)` + `expect(jsonSpy).not.toHaveBeenCalled()` | ✅ PASS |
| AC4: falha de rede lança erro distinguível de erro de API | `NetworkError` ≠ `ApiError` | `src/api/__tests__/client.test.ts:72-78` — `expect(error).toBeInstanceOf(NetworkError)` + `expect(error).not.toBeInstanceOf(ApiError)` | ✅ PASS |
| AC5: base URL vem de `EXPO_PUBLIC_API_URL` | URL do env usada no fetch | `src/api/__tests__/config.test.ts:13-16` — `expect(getBaseUrl()).toBe('http://test.local:8080')` (env do jest.setup.js); `src/api/__tests__/client.test.ts:97-104` — `expect(url).toBe('http://test.local:8080/api/events/my')` + `expect(init.headers.Authorization).toBe('Bearer tok-123')` | ✅ PASS |

### API-02 — TanStack Query configurado

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: `QueryClientProvider` envolve a árvore (useQuery funciona numa tela) | `useQuery` resolve dados mockados sob o `_layout` real | `src/__tests__/query-provider.test.tsx:19-22` — rota-sonda sob `RootLayout` real; `expect(await screen.findByText('dados-ok')).toBeOnTheScreen()` (sem provider, `useQuery` lançaria) | ✅ PASS |

### API-03 — Login do host com sessão persistida

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: login válido chama `POST /api/auth/login`, guarda token+credenciais no secure store e navega para `/host/events` | URL, corpo `{email, password}` (brief §3), 3 chaves no secure store, pathname `/host/events` | `src/__tests__/host-auth.test.tsx:43-61` — `expect(url).toBe('http://test.local:8080/api/auth/login')`, `expect(JSON.parse(init.body)).toEqual({ email: 'ana@eterniza.app', password: 'segredo' })`, `__get('eterniza.host.token') === 'tok-novo'` + email + password, `findByText('Meus eventos')` + `getPathname() === '/host/events'` | ✅ PASS |
| AC2: 400/erro de credencial exibe erros por campo (Input), sem navegar | mensagem por campo visível, pathname inalterado, nada guardado | `src/__tests__/host-auth.test.tsx:63-83` — `findByText('E-mail inválido')`, `getPathname() === '/host/login'`, `__get('eterniza.host.token')` undefined | ✅ PASS |
| AC3: backend inacessível exibe erro de rede elegante, sem crash/travamento | mensagem de rede visível, tela responsiva | `src/__tests__/host-auth.test.tsx:85-97` — `findByText('Não foi possível falar com o servidor. Verifique sua conexão.')` + `getPathname() === '/host/login'` | ✅ PASS |
| AC4: sessão guardada → `/host/login` redireciona para eventos; sem sessão → `/host/events` redireciona para login | redirects nos dois sentidos | `src/__tests__/host-auth.test.tsx:99-106` — sessão semeada, `findByText('Meus eventos')` + `expect(fetchMock).not.toHaveBeenCalled()` (sem re-login desnecessário); `:108-113` — sem sessão, `findByText('Login do host')` | ✅ PASS |
| AC5: login real + fechar/reabrir o app mantém a sessão (backend local) | comportamento em dispositivo | — | ⏳ UAT pendente (AD-003, = "✅ Verificar" do roadmap) |

### API-04 — Re-login automático na expiração

| Criterion | Spec-defined outcome | Evidência (`file:line` + asserção) | Result |
| --- | --- | --- | --- |
| AC1: 401 → re-loga com credenciais guardadas e repete o request original uma única vez | `POST /api/auth/login` com credenciais do secure store, retry único | `src/api/__tests__/host-client.test.ts:48-63` — `expect(fetchMock).toHaveBeenCalledTimes(3)`, `expect(loginUrl).toBe('http://test.local:8080/api/auth/login')`, `expect(JSON.parse(loginInit.body)).toEqual({ email: 'ana@eterniza.app', password: 'segredo' })` | ✅ PASS |
| AC2: re-login ok → novo token substitui o antigo no secure store e o request original resolve | retry com `Bearer tok-novo`, store atualizado, `data` resolvido | `src/api/__tests__/host-client.test.ts:54-68` — `resolves.toEqual([{ id: 'ev-1' }])`, `expect(retryInit.headers.Authorization).toBe('Bearer tok-novo')`, `__get('eterniza.host.token') === 'tok-novo'` | ✅ PASS |
| AC3: re-login falha → limpa a sessão e a navegação volta para `/host/login` | secure store vazio + volta ao login | Limpeza + notificação: `src/api/__tests__/host-client.test.ts:71-80` — `rejects.toBeInstanceOf(SessionExpiredError)`, `__get(...)` undefined para token/email/password, `expiredListener` chamado 1×. Navegação por composição: `src/__tests__/host-auth.test.tsx:108-113` (signedOut → login). **O elo do meio — `AuthProvider` registra o listener e flipa `status` (`src/api/auth-context.tsx:34-38`) — não tem teste: mutante que remove o registro SOBREVIVEU (sensor #5)** | ⚠️ Parcial (limpeza ✅; cláusula de navegação sem evidência ponta-a-ponta — evidence-or-zero) |
| AC4: múltiplos 401 encadeados não geram loop (máx. 1 re-login) | 2º 401 propaga, nunca um 2º login | `src/api/__tests__/host-client.test.ts:82-93` — `expect(error.status).toBe(401)` + `expect(fetchMock).toHaveBeenCalledTimes(3)` (original, 1 login, 1 retry) | ✅ PASS |
| (borda) sem sessão guardada | falha imediata sem fetch | `src/api/__tests__/host-client.test.ts:102-108` — `rejects.toBeInstanceOf(SessionExpiredError)` + `expect(fetchMock).not.toHaveBeenCalled()` | ✅ PASS |
| (borda) falha de rede não dispara re-login | passthrough | `src/api/__tests__/host-client.test.ts:95-100` — `rejects.toBeInstanceOf(NetworkError)` + 1 chamada só | ✅ PASS |

**Status**: ⚠️ 14/15 ACs automatizáveis com evidência completa; API-04 AC3 parcial (cláusula de navegação coberta só por composição com elo não testado); API-03 AC5 → UAT (AD-003)

---

## Edge Cases

- [x] `.env` sem `EXPO_PUBLIC_API_URL` → falha com mensagem clara: `src/api/__tests__/config.test.ts:18-21` — `expect(() => getBaseUrl()).toThrow('EXPO_PUBLIC_API_URL não definida')`
- [x] Envelope `success: false` com 200 sem `errors` → message geral: `src/api/__tests__/client.test.ts:87-95` — `expect(error.message).toBe('Operação não permitida')`. Exibição na tela por composição: `src/app/host/login.tsx:34-35` renderiza `generalMessage` para qualquer erro sem `errors`, ramo exercitado por `src/__tests__/host-auth.test.tsx:93-95` (nota: cenário exato "envelope success:false na tela" não tem teste próprio de tela — mesmo ramo de render, risco baixo)
- [x] Logout limpa token e credenciais do secure store: `src/api/__tests__/host-client.test.ts:76-78` — as 3 chaves removidas via `clearSession()` (não há UI de logout nesta etapa; `signOut` do contexto usa a mesma `clearSession`)
- [x] Resposta não-JSON (HTML de proxy) → erro de rede/parse sem crash: `src/api/__tests__/client.test.ts:80-85` — `expect(error).toBeInstanceOf(NetworkError)` num 502 com corpo não parseável

---

## Discrimination Sensor

Estado descartável (editar → rodar → `git checkout --`); árvore real intacta ao final (`git status` limpo). Auth = caminho P0 → 5 mutações.

| # | Mutação | File:line | Descrição | Killed? |
| --- | --- | --- | --- | --- |
| 1 | 401 sem throw antes do parse | `src/api/client.ts:64-66` | Removido o `throw ApiError(401)` — 401 cai no `json()` e viraria `NetworkError` | ✅ Morto (4 testes falharam: client AC3 + host-client AC1/AC3/AC4) |
| 2 | Retry com token velho | `src/api/host-client.ts:54` | `token: newToken` → `token: session.token` | ✅ Morto (host-client AC1/AC2: `Bearer tok-novo` esperado) |
| 3 | Sessão não limpa no re-login falho | `src/api/host-client.ts:48` | Removido `await clearSession()` | ✅ Morto (host-client AC3: chaves ainda presentes no store) |
| 4 | Chave errada no `updateToken` | `src/api/session.ts:35` | `TOKEN_KEY` → `'eterniza.host.token.novo'` | ✅ Morto (host-client AC1/AC2: `__get('eterniza.host.token')` ainda `tok-expirado`) |
| 5 | Listener de expiração não registrado | `src/api/auth-context.tsx:36` | Removido `setSessionExpiredListener(() => setStatus('signedOut'))` | ❌ **SOBREVIVEU** (75/75 passaram) → fix task |

**Sensor depth**: P0-full (5 mutações manuais)
**Result**: 4/5 killed — ⚠️ 1 sobrevivente (elo listener→status→guarda sem teste; mesma lacuna do API-04 AC3 parcial)

---

## Code Quality

| Principle | Status |
| --- | --- |
| Minimum code (sem abstração especulativa; contexto leve em vez de Redux/Zustand, como decidido na spec) | ✅ |
| Surgical changes (só arquivos da feature; host-routes.test.tsx atualizado com justificativa documentada no commit `225a9c2`) | ✅ |
| No scope creep (register sem UI, endpoints futuros fora, conforme Out of Scope) | ✅ |
| Matches patterns (renderRouter + app real, mocks globais em jest.setup.js, testes fora de `src/app`) | ✅ |
| Spec-anchored outcome check (valores asseridos = brief §3: envelope, errors, Bearer, corpo do login) | ✅ |
| Per-layer Coverage Expectation (domínio 1:1 com ACs; telas com happy+edge+error) | ⚠️ (elo auth-context sem teste — ver sensor #5) |
| Todo teste mapeia a um AC/edge/Done-when — sem testes órfãos | ✅ |
| Documented guidelines seguidas | ✅ AGENTS.md (docs Expo v57*); AD-003 (real = UAT); AD-005 (commits atômicos) |

\* Nota: AGENTS.md aponta docs do SDK 57, mas AD-006 fixa o projeto no SDK 54 — divergência pré-existente, fora do escopo desta validação.

**Integridade de testes (host-routes.test.tsx)**: o teste do login esqueleto da Etapa 3 (NAV-02 AC1: press "Entrar" → `Meus eventos` + pathname `/host/events`) foi substituído porque a spec da Etapa 4 trocou o esqueleto pelo login real. A cobertura antiga **existe fortalecida** em `src/__tests__/host-auth.test.tsx:43-61` (mesma ação + mesmas asserções de navegação, mais chamada de API e persistência). Nenhuma asserção enfraquecida; nenhum teste perdido.

---

## Gate Check

- **Comandos**: `npx tsc --noEmit` + `npm run lint` + `npm test`
- **Resultado**: tsc limpo · lint limpo · **75 passed, 0 failed, 0 skipped** (14 suítes)
- **Test count antes da feature**: 55
- **Test count depois**: 75
- **Delta**: +20 novos testes
- **Skipped**: nenhum
- **Failures**: nenhum

---

## Fix Plans

### Fix 1: Elo `AuthProvider` → expiração de sessão sem teste (sensor #5 sobreviveu)

- **Root cause**: nenhum teste dispara `setSessionExpiredListener` através da UI real. `host-client.test.ts` prova que o listener é chamado; `host-auth.test.tsx` prova que `signedOut` redireciona — mas remover o registro do listener em `src/api/auth-context.tsx:34-38` não quebra nada. Em produção, se esse efeito regredir, o re-login falho deixaria o usuário numa tela quebrada em vez de voltar ao login.
- **Fix task**: teste de tela (renderRouter no app real, sessão semeada) que monta uma tela sob a guarda, simula `hostRequest` recebendo 401 + re-login falho (fetch mock: `empty401` → `loginFail`) e assere que a navegação termina em `/host/login`. Done when: mutação #5 (remover o registro do listener) passa a ser morta.
- **Priority**: Major (único elo não testado de um fluxo P0 de auth; código atual está correto por inspeção — `auth-context.tsx:36`)

---

## UAT Pendente (AD-003 — backend real, iPhone físico)

Preparação:
1. **Criar conta de teste** via `register` (sem UI): `curl -X POST http://<ip>:8080/api/auth/register -H "Content-Type: application/json" -d '{"name":"...","email":"...","password":"..."}'` (ou script equivalente)
2. **Firewall**: liberar a porta **8080** no firewall do Windows (mesmo bloqueio que afetou o Metro); alternativa: túnel para o backend. Confirmar `EXPO_PUBLIC_API_URL` no `.env` com o IP da máquina na rede (`.env.example`)

Testes interativos:
1. **Login real** (API-03 AC1): entrar com a conta de teste em `/host/login` → cair em "Meus eventos"
2. **Sessão persiste** (API-03 AC5 / Success Criteria): fechar o app completamente e reabrir → cair direto em "Meus eventos", sem pedir senha

---

## Requirement Traceability Update

| Requirement | Previous Status | New Status |
| --- | --- | --- |
| API-01 | Pending | ✅ Verified |
| API-02 | Pending | ✅ Verified |
| API-03 | Pending | ✅ Verified (código) · ⏳ AC5 = UAT |
| API-04 | Pending | ⚠️ Needs Fix (AC3, cláusula de navegação — Fix 1) |

---

## Summary

**Overall**: ⚠️ Issues (1 fix task Major) — código correto por inspeção; lacuna é de cobertura, não de comportamento

**Spec-anchored check**: 14/15 ACs automatizáveis com evidência exata do brief §3; 1 parcial (API-04 AC3, navegação) · 4/4 edge cases cobertos (1 por composição, risco baixo)
**Sensor**: 4/5 mutações mortas; #5 (listener do auth-context) sobreviveu → Fix 1
**Gate**: tsc ✅ · lint ✅ · 75/75 testes ✅ (baseline 55, +20)

**What works**: cliente com envelope fiel ao brief (2xx/400/401 vazio/rede/não-JSON), TanStack Query no root provado com sonda, login real com persistência tripla no secure store e redirects nos dois sentidos, re-login automático com retry único, sem loop, token substituído e limpeza na falha.

**Issues found**: Fix 1 — teste de tela para o fluxo "re-login falho → volta ao login" (mata a mutação #5).

**Next steps**: implementar Fix 1 → re-verificar (matar mutação #5) → UAT interativo (conta de teste via register, porta 8080 no firewall, login real, fechar/reabrir mantém sessão).

---

## Fix 1 → Re-Verify (iteração 1 de 3) — 2026-07-14

**Fix aplicado**: teste ponta-a-ponta em `src/__tests__/host-auth.test.tsx` ("sessão expirada irrecuperável durante o uso") — app renderizado em `/host/events` com sessão semeada; `hostRequest` encontra 401 e o re-login falha; asserta `SessionExpiredError`, tela final "Login do host" e `getPathname() === '/host/login'`. Exercita a fiação real listener→AuthProvider→guarda.

**Re-verificação empírica da mutação #5**: mesma mutação re-injetada (`setSessionExpiredListener(null)` em vez de registrar o handler em `src/api/auth-context.tsx:36`) → `npm test -- host-auth` → **1 failed** (o novo teste) → arquivo restaurado, working tree limpo. **Mutante morto (5/5)**.

**Gate pós-fix**: tsc ✅ · lint ✅ · jest **76/76** ✅ (75 → +1).

**Lesson registrada**: L-002 (candidate, signal `surviving_mutant`) — "testar as duas pontas de um efeito cross-módulo em suítes separadas não prova a fiação; o elo registrado (listener/callback) precisa de teste ponta-a-ponta próprio".

**Traceability final**: API-01 ✅ · API-02 ✅ · API-03 ✅ (código; AC5 = UAT) · API-04 ✅ Verified

**Overall final (automatizável)**: ✅ **PASS** — pendente apenas o UAT interativo (AD-003).
