# Etapa 4 — Cliente da API + Auth do Host: Specification

> Fonte: `ROADMAP.md` Etapa 4 + `APP_BRIEF.md` §3/§4/§7. Escopo: **Medium** (contrato da API já documentado no brief; sem decisão arquitetural nova além do módulo `api/` → Design dispensado; passos atômicos no Execute).

## Problem Statement

Nenhuma tela fala com o backend ainda. Antes dos fluxos reais (convidado na Etapa 5, upload na 6, host na 10), o app precisa de um cliente HTTP que entenda o envelope da API (`{success, message, data, errors}`), trate o 401 de corpo vazio, e de uma sessão de host que sobreviva a reaberturas do app e à expiração do token (24h) — sem o usuário perceber.

## Goals

- [ ] Módulo `src/api/` — fetch com envelope, erros por campo, 401 corpo vazio tratado por status, base URL por env
- [ ] TanStack Query configurado no app
- [ ] Login real do host contra o backend local, com token **e credenciais** em `expo-secure-store`
- [ ] Re-login automático transparente quando o hostToken expira (24h) — máx. 1 tentativa por request, sem loop
- [ ] Sessão persiste entre reaberturas: abrir o app logado cai direto em "Meus eventos"

## Out of Scope

| Feature | Reason |
|---|---|
| Sessão do convidado (`POST /auth/guest/session`, `deviceId`) | Etapa 5 |
| Upload de fotos e demais endpoints (events, photos) | Etapas 5–10 — o módulo `api/` nasce com o núcleo + auth; endpoints entram nas etapas que os usam |
| Tela de registro de conta | Conta de host é criada/entregue pelo serviço (brief §7); a função `register` existe no módulo para criar a conta de teste, sem UI |
| Recuperação de senha | Decisão de produto (brief §7) — reset manual |
| Conteúdo real de "Meus eventos" | Etapa 10 — a tela continua esqueleto, só prova a sessão |
| HTTPS/produção | Pré-lançamento (radar do brief); dev usa HTTP local |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Base URL por env | `EXPO_PUBLIC_API_URL` em `.env` (gitignored) + `.env.example` versionado. Para o iPhone físico: IP da máquina na rede (ex.: `http://192.168.100.x:8080`) | Mecanismo nativo do Expo para env público; device físico não enxerga `localhost` | n |
| **Risco de ambiente (UAT)** | O firewall do Windows que bloqueou o Metro (por isso usamos tunnel) pode bloquear a porta 8080 também. Plano: liberar a porta 8080 no firewall na preparação do UAT; alternativa: túnel para o backend | O tunnel do Expo cobre só o Metro, não a API | n |
| Persistir credenciais | E-mail+senha em `expo-secure-store` junto com o token, para o re-login automático | Sancionado pelo brief §7 ("guardar credenciais em secure storage"); único jeito de re-logar sem UX de senha a cada 24h | n |
| Estratégia do re-login | Interceptador no client: response 401 (corpo vazio) em rota de host → `POST /auth/login` com credenciais guardadas → repete o request original **uma única vez**; segundo 401 → limpa sessão e volta ao login | Regra do brief §7; limite de 1 evita loop | n |
| Guarda de rotas do host | `/host/events*` sem sessão redireciona para `/host/login`; login com sessão válida pula direto para eventos | Torna o critério "token persiste entre reaberturas" observável no UAT | n |
| Estado de auth | Módulo próprio leve (`src/api/auth.ts` + contexto/hook) — sem Redux/Zustand; TanStack Query cuida das chamadas | Poucas telas (brief §2): não precisa de mais | n |
| Conta de teste | Criada via função `register` chamada por script/curl na preparação do UAT (sem tela) | Registro não tem UI por decisão de produto | n |
| Pacotes novos | `@tanstack/react-query`, `expo-secure-store` | Stack definida no brief §2 | n |
| Testes | Client e re-login testados com `fetch` mockado; `expo-secure-store` mockado em memória; fluxo de login de tela com renderRouter + mocks. Login real contra backend = UAT | AD-003; backend não roda no CI | n |

**Open questions:** none — tudo resolvido ou logado acima.

**Dimensões implícitas** (várias presentes — cobertas nos ACs/edge cases): **auth boundaries** (token host, guarda de rotas), **falha externa** (backend offline → erro elegante), **validação de input** (erros por campo do envelope 400), **retry/idempotência** (re-login com máx. 1 retry), **lifecycle** (token 24h, logout limpa secure store). N/A: concorrência (single-user), pagamentos, observabilidade (console em dev basta neste escopo).

**Lessons aplicadas:** L-001 ainda é candidate (não carregada como guidance), mas seu princípio — testar a ação, não só o estado final — orientou os ACs de navegação pós-login.

---

## User Stories

### P1: Cliente da API com envelope ⭐ MVP

**User Story**: Como desenvolvedor, quero um client HTTP único que entenda o envelope da API para que nenhuma tela reimplemente parsing/erros.

**Acceptance Criteria**:

1. WHEN uma resposta 2xx chega THEN o client SHALL retornar `data` tipado do envelope `{success, message, data, timestamp}`.
2. WHEN uma resposta 400 chega com `errors` THEN o client SHALL expor `message` e o mapa `errors` (campo → mensagem) para a UI usar direto (spec do Input, Etapa 2).
3. WHEN uma resposta 401 chega **com corpo vazio** THEN o client SHALL tratá-la pelo status HTTP sem tentar fazer parse do JSON (sem crash).
4. WHEN a rede falha (fetch rejeita/timeout) THEN o client SHALL lançar um erro de rede distinguível de erro de API.
5. WHEN o client é criado THEN a base URL SHALL vir de `EXPO_PUBLIC_API_URL`.

**Independent Test**: `npm test` — client com fetch mockado cobrindo os 4 formatos de resposta.

---

### P1: TanStack Query configurado ⭐ MVP

**User Story**: Como desenvolvedor, quero o QueryClientProvider no root para que as etapas seguintes consumam a API com cache/estados prontos.

**Acceptance Criteria**:

1. WHEN o app renderiza THEN um `QueryClientProvider` SHALL envolver a árvore (verificável por um hook `useQuery` funcionando numa tela).

**Independent Test**: teste de rota em que um componente com `useQuery` resolve dados mockados.

---

### P1: Login do host com sessão persistida ⭐ MVP

**User Story**: Como host, quero entrar com e-mail e senha uma vez e continuar logado nas próximas aberturas do app.

**Acceptance Criteria**:

1. WHEN submeto e-mail+senha válidos em `/host/login` THEN o app SHALL chamar `POST /api/auth/login`, guardar token+credenciais em `expo-secure-store` e navegar para `/host/events`.
2. WHEN o backend responde 400/erro de credencial THEN a tela SHALL exibir a mensagem/erros por campo (componente `Input` da Etapa 2), sem navegar.
3. WHEN o backend está inacessível THEN a tela SHALL exibir erro de rede elegante (sem crash, sem tela travada em loading).
4. WHEN abro o app com sessão guardada THEN `/host/login` SHALL redirecionar para `/host/events`; WHEN não há sessão THEN `/host/events` SHALL redirecionar para `/host/login`.
5. WHEN o UAT roda com backend local THEN login real + fechar/reabrir o app SHALL manter a sessão — **UAT interativo (AD-003, = "✅ Verificar" do roadmap)**.

**Independent Test**: renderRouter + fetch/secure-store mockados (login ok, login inválido, redirects); UAT para o real.

---

### P1: Re-login automático na expiração ⭐ MVP

**User Story**: Como host, não quero digitar senha a cada 24h — o app deve renovar a sessão sozinho quando o token expira.

**Acceptance Criteria**:

1. WHEN um request autenticado recebe 401 (corpo vazio) THEN o client SHALL re-logar com as credenciais guardadas e repetir o request original **uma única vez**.
2. WHEN o re-login tem sucesso THEN o novo token SHALL substituir o antigo no secure store e o request original SHALL resolver normalmente (transparente para a UI).
3. WHEN o re-login também falha (401/400) THEN o client SHALL limpar a sessão e a navegação SHALL voltar para `/host/login`.
4. WHEN múltiplos 401 se encadeiam THEN o client SHALL NOT entrar em loop (máx. 1 re-login por request original).

**Independent Test**: `npm test` — sequência 401→login→retry com fetch mockado; loop guard; falha dupla limpa sessão.

---

## Edge Cases

- WHEN o `.env` não define `EXPO_PUBLIC_API_URL` THEN o client SHALL falhar com mensagem clara em dev (não uma URL silenciosamente errada).
- WHEN o login retorna envelope `success: false` com 200/4xx sem `errors` THEN a `message` geral SHALL ser exibida.
- WHEN logout (limpar sessão) ocorre THEN token e credenciais SHALL ser removidos do secure store.
- WHEN a resposta não é JSON válido (ex.: HTML de proxy) THEN o client SHALL lançar erro de rede/parse distinguível, sem crash.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| API-01 | P1: Cliente da API | Execute | Verified — commit 3341a00 |
| API-02 | P1: TanStack Query | Execute | Verified — commit 601cc9e |
| API-03 | P1: Login com sessão persistida | Execute | Verified (UAT pendente) — commit 225a9c2 |
| API-04 | P1: Re-login automático | Execute | Verified — commit 29f512f + fix |

**Coverage:** 4 total, 0 mapped to tasks (tasks implícitas no Execute — escopo Medium), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] **Com o backend rodando, logar de verdade e ver o token persistir entre reaberturas do app** — UAT interativo no iPhone (AD-003).
- [ ] Gate automatizado verde: `tsc --noEmit` + lint + testes (client, re-login, fluxo de login mockado).
- [ ] Commits atômicos (AD-005).
