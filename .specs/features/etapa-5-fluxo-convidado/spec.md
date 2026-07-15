# Etapa 5 — Fluxo de Entrada do Convidado: Specification

> Fonte: `ROADMAP.md` Etapa 5 + `APP_BRIEF.md` §3/§4/§5 (fluxo do convidado). Escopo: **Medium**
> (contrato da API e regras de produto já documentados; decisão nova é só a forma de persistir
> a sessão do convidado por evento — sem decisão arquitetural maior → Design dispensado).

## Problem Statement

O convidado escaneia o QR do casamento e cai numa tela de convite que hoje é só esqueleto
(título fixo + slug cru). Antes da câmera de verdade (Etapa 6), o app precisa: buscar o evento
pelo slug, coletar o nome do convidado, gerar e persistir um `deviceId` que **nunca muda** (é
ele que identifica o convidado para o limite de poses), abrir uma sessão de convidado
(`guestToken`, 7 dias) e navegar para a câmera — tratando com elegância o caso do slug que não
existe.

## Goals

- [ ] `/e/[slug]` real: `GET /api/events/slug/{slug}` — loading, sucesso ("Você foi convidado
      para {name}" + campo nome), e erro elegante (slug inexistente/evento não encontrado)
- [ ] `deviceId`: gerar UUID **uma única vez** por instalação, persistir em secure store,
      **nunca regenerar** (regra 1 do brief)
- [ ] `POST /api/auth/guest/session` (`displayName`, `eventId`, `deviceId`) → guarda
      `guestToken` em secure store **por evento** e navega para a câmera (ainda esqueleto)
- [ ] Reabrir o convite de um evento em que o convidado já tem sessão pula direto para a
      câmera (não pede o nome de novo) — mesma lógica de persistência do host (Etapa 4)

## Out of Scope

| Feature | Reason |
|---|---|
| Câmera real (VisionCamera, filtros, upload) | Etapa 6–7 — a tela de câmera continua esqueleto, só recebe a sessão pronta |
| Galeria real (fotos trancadas, revelação) | Etapas 8–9 |
| Re-login/renovação do `guestToken` ao expirar (7 dias) | Fora do radar do brief para o convidado (diferente do host, que expira em 24h e precisa reabrir o app durante o evento); reavaliar se surgir caso de uso |
| Editar nome após a sessão criada | Não previsto no brief; `displayName` é fixado na criação da sessão |
| Deep link `eterniza://e/{slug}` chamando a API automaticamente sem passar pela tela | Já coberto na Etapa 3 (a rota abre; a etapa 5 é o *conteúdo* da rota) |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Geração do `deviceId` | `expo-crypto` (`Crypto.randomUUID()`) — pacote novo | Nativo do ecossistema Expo, sem dependência extra de polyfill de `crypto` | n |
| Persistência do `deviceId` | Secure store, chave global (`eterniza.guest.deviceId`) — **um por instalação do app**, não por evento | Regra 1 do brief: identifica "essa pessoa" através de todos os eventos que ela visitar | n |
| Persistência da sessão de convidado | Secure store, chave **por evento** (ex.: `eterniza.guest.session.{eventId}`) guardando `{token, displayName}` | Um mesmo device pode visitar vários casamentos; a sessão de um evento não pode sobrescrever a de outro | n |
| Resumir sessão existente | Ao abrir `/e/[slug]`, depois do `GET /events/slug/{slug}`, checar se já existe sessão salva para aquele `eventId`; se sim, pular a tela de nome e ir direto pra câmera | Evita pedir o nome de novo a cada reabertura do link, consistente com "zero fricção" (pilar 1 do brief) | n |
| Composição visual do convite | Referência `landing_6` (AD-007) tem foto de casal de fundo — **fora do escopo**: `EventResponse` não traz nenhuma URL de foto do evento. Adaptar: fundo `canvas` do design system, nome do evento em `display`, subtítulo convite, campo nome, CTA "Ir para a câmera" | Hierarquia do AD-007: a imagem define composição/conteúdo, o `DESIGN_SYSTEM.md` prevalece na identidade visual; sem asset de foto disponível, a composição vira tipográfica | n |
| Validação do nome | Campo obrigatório, máx. 30 caracteres (limite do backend: `displayName` máx 30) — validação client-side antes do POST, espelhando o erro 400 do backend se escapar | Evita round-trip óbvio; o backend já valida, mas o Input (Etapa 2) já sabe exibir erro de campo | n |
| Erro de slug inexistente | `GET /events/slug/{slug}` 404 → tela de erro dedicada ("Convite não encontrado") com texto explicativo, sem campo nome nem CTA de câmera | Regra do roadmap ("slug inexistente mostra erro elegante"); não crashar nem mostrar tela em branco | n |
| Testes | `GET /events/slug/{slug}` e `POST /auth/guest/session` testados com `fetch` mockado; `expo-secure-store` mockado (mesmo mock do host); fluxo de tela com `renderRouter`. Contra o backend real = UAT | AD-003; backend não roda no CI | n |

**Open questions:** nenhuma bloqueante — defaults acima seguem o brief; sinalizar se algum não for o esperado.

**Dimensões implícitas**: **validação de input** (nome obrigatório, máx 30), **falha externa**
(slug inexistente, backend fora), **lifecycle** (deviceId nunca regenera; sessão por evento
persiste), **idempotência** (reabrir o link com sessão existente não recria sessão). N/A:
concorrência, pagamentos, auth boundaries além do guestToken (não há guarda de rota aqui — a
câmera ainda é esqueleto).

**Lessons aplicadas**: L-002 (elo registrado entre módulos precisa de teste ponta-a-ponta
próprio) orienta o teste do fluxo completo `/e/[slug]` → sessão salva → navegação, não só as
peças isoladas (`api/guest.ts` e a tela).

---

## User Stories

### P1: Convite do evento carrega dados reais ⭐ MVP

**User Story**: Como convidado, quero ver o nome do casamento para o qual fui convidado ao
abrir o link, para confirmar que estou no lugar certo antes de fotografar.

**Acceptance Criteria**:

1. WHEN `/e/[slug]` monta THEN o app SHALL chamar `GET /api/events/slug/{slug}` e mostrar um
   estado de carregamento até a resposta chegar.
2. WHEN o evento existe THEN a tela SHALL mostrar "Você foi convidado para {name}" e um campo
   de nome.
3. WHEN o slug não corresponde a nenhum evento (404) THEN a tela SHALL mostrar um erro elegante
   ("Convite não encontrado" ou similar), sem campo nome nem botão de câmera.
4. WHEN o backend está inacessível THEN a tela SHALL mostrar erro de rede elegante (sem crash,
   sem loading infinito).

**Independent Test**: `npm test` — `renderRouter` com fetch mockado cobrindo 200/404/erro de rede.

---

### P1: `deviceId` persistente ⭐ MVP

**User Story**: Como desenvolvedor, quero um identificador estável do dispositivo para que o
limite de poses do convidado funcione entre sessões do app.

**Acceptance Criteria**:

1. WHEN o app precisa do `deviceId` e nenhum existe no secure store THEN o app SHALL gerar um
   UUID novo e persisti-lo antes de usá-lo.
2. WHEN o app precisa do `deviceId` e já existe um salvo THEN o app SHALL reutilizar o mesmo
   valor, **nunca gerando um novo**.

**Independent Test**: `npm test` — secure store mockado, uma chamada gera e salva, chamada
seguinte reutiliza (sem nova escrita).

---

### P1: Sessão do convidado ⭐ MVP

**User Story**: Como convidado, quero digitar meu nome uma vez e ser levado direto para a
câmera, sem senha nem cadastro.

**Acceptance Criteria**:

1. WHEN submeto o nome no convite de um evento sem sessão prévia THEN o app SHALL chamar
   `POST /api/auth/guest/session` com `{displayName, eventId, deviceId}`, guardar o
   `guestToken` retornado em secure store (associado a este `eventId`) e navegar para
   `/e/[slug]/camera`.
2. WHEN o nome está vazio ou excede 30 caracteres THEN o app SHALL bloquear o envio e mostrar
   o erro no campo, sem chamar a API.
3. WHEN o backend rejeita o payload (400) THEN a tela SHALL exibir a mensagem/erros do envelope,
   sem navegar.
4. WHEN reabro `/e/[slug]` de um evento em que já tenho sessão salva THEN o app SHALL pular a
   tela de nome e navegar direto para `/e/[slug]/camera`.

**Independent Test**: `npm test` — `renderRouter` com fetch/secure-store mockados (sessão nova,
erro de validação, sessão existente pulando direto pra câmera); fluxo real contra backend = UAT.

---

## Edge Cases

- WHEN o `eventId` do evento buscado é usado no `POST /auth/guest/session` THEN o app SHALL
  usar o `id` do `EventResponse` (nunca o `slug`) — regra 8 do brief.
- WHEN duas chamadas concorrentes tentam gerar o `deviceId` ao mesmo tempo (ex.: dois hooks
  montando junto) THEN o app SHALL evitar gravar dois UUIDs diferentes (single-flight/memoização
  da geração).
- WHEN a resposta do evento vem com `status: "REVEALED"` THEN o fluxo de entrada **não muda**
  nesta etapa (a tela pós-reveal é da Etapa 9) — o convidado ainda pode entrar e fotografar se
  quiser, sem tratamento especial aqui.
- WHEN o nome tem espaços nas pontas THEN o app SHALL aparar (`trim`) antes de validar o
  tamanho e antes de enviar.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| GUEST-01 | P1: Convite do evento carrega dados reais | Execute | Verified — commit 9e498f7 |
| GUEST-02 | P1: `deviceId` persistente | Execute | Verified — commit cd92639 |
| GUEST-03 | P1: Sessão do convidado | Execute | Verified — commit 7723853 |

**Coverage:** 3 total, 0 mapped to tasks (tasks implícitas no Execute — escopo Medium), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] Fluxo completo contra o backend local: abrir `/e/[slug]` com um slug real, ver o nome do
      evento, digitar nome, cair na câmera (esqueleto) — UAT interativo no iPhone (AD-003).
- [ ] Slug inexistente mostra erro elegante — verificável no mesmo UAT.
- [x] Gate automatizado verde: `tsc --noEmit` + lint + testes — 91/91, Verifier PASS
      (sensor 6/6 mutações detectadas).
- [x] Commits atômicos (AD-005): cd92639, 9e498f7, 7723853.
