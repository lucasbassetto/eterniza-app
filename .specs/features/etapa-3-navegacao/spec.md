# Etapa 3 — Navegação e Deep Link: Specification

> Fonte: `ROADMAP.md` Etapa 3 + `APP_BRIEF.md` §2/§5. Escopo: **Medium** (rotas em esqueleto, sem lógica de negócio; sem decisão arquitetural além da árvore de rotas → Design dispensado; passos atômicos no Execute).

## Problem Statement

O app precisa da espinha dorsal de navegação antes de qualquer fluxo real: as rotas do convidado (`/e/[slug]`, câmera, galeria) e do host (login, eventos, evento, moderação), e o deep link que faz o QR do casamento abrir direto a tela do convidado com o slug certo. Tudo em esqueleto — só título + navegação — para as próximas etapas preencherem.

## Goals

- [ ] Árvore de rotas do convidado e do host criada com `expo-router`, telas em esqueleto (título + navegação, usando `Screen`/`Text`/`Button` da Etapa 2)
- [ ] Deep link por scheme (`eterniza://e/{slug}`) e por caminho (`/e/{slug}`) abrindo a rota do convidado com o slug lido
- [ ] Home vira hub de navegação esqueleto (entrada do host) e o link temporário "componentes →" é removido conforme prometido na Etapa 2

## Out of Scope

| Feature | Reason |
|---|---|
| Qualquer chamada à API (buscar evento por slug, login real) | Etapas 4–5 |
| Conteúdo real das telas (câmera, galeria, moderação) | Etapas 6–10 |
| Guarda de autenticação nas rotas do host | Etapa 4 (aqui não há sessão) |
| Universal link **funcionando** (`https://eterniza.app/e/{slug}`) | Exige domínio + HTTPS + AASA (radar do brief, pré-lançamento). A rota `/e/[slug]` implementada aqui é a mesma que ele usará; falta só a associação de domínio |
| Tela 404/unmatched customizada | Etapa 11 (polimento) — o unmatched padrão do expo-router basta |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| Árvore de rotas | Convidado: `e/[slug]/index` (convite), `e/[slug]/camera`, `e/[slug]/gallery`. Host: `host/login`, `host/events` (lista), `host/events/[id]` (evento), `host/events/[id]/moderation` | Espelha os dois fluxos do brief §5; slug/id sempre no caminho para deep link e restauração | n |
| Teste automatizado do deep link | `expo-router/testing-library` (`renderRouter` com `initialUrl`) assertando que a URL `/e/teste-slug` renderiza a tela do convidado com o slug lido | Testa exatamente o mapeamento URL→tela que o `uri-scheme` exercita, sem dispositivo | n |
| **Adaptação do "✅ Verificar" do roadmap** | O comando `npx uri-scheme open "eterniza://..."` exige simulador ou dev build — não existe no ambiente atual (PC Windows + iPhone físico com Expo Go, que não registra scheme customizado). UAT: abrir `exp://<host-do-tunnel>/--/e/teste-slug` no iPhone (mesmo mapeamento de rota). O `eterniza://` literal será re-verificado na Etapa 6, quando o dev build existir | Mesma semântica (URL com slug → tela certa), único caminho testável hoje; scheme `eterniza` já está no `app.json` desde a Etapa 1 | n |
| Home | Esqueleto: título + botão "Sou host" → `/host/login`; link dev para a galeria mantido, mas discreto e apenas em `__DEV__` | O link "componentes →" seria removido nesta etapa; a galeria continua útil para validação visual das próximas etapas | n |
| Navegação esqueleto | Cada tela mostra título (e o slug/id lido, quando houver) + botões `Button` levando às rotas vizinhas do fluxo | "Só título + navegação" (roadmap); provar a árvore inteira navegável | n |

**Open questions:** none — tudo resolvido ou logado acima.

**Dimensões implícitas:** persistência, chamadas externas, auth, pagamentos, concorrência — N/A (telas estáticas sem I/O; auth boundary explicitamente adiada para a Etapa 4, ver Out of Scope). Presente: **integridade do parâmetro de rota** (slug/id lidos e exibidos — coberta nos ACs e edge cases).

---

## User Stories

### P1: Rotas do convidado em esqueleto ⭐ MVP

**User Story**: Como convidado, quero que o link do evento me leve a telas próprias do evento (convite → câmera → galeria) para que o fluxo do QR exista de ponta a ponta, mesmo que vazio.

**Acceptance Criteria**:

1. WHEN navego para `/e/teste-slug` THEN SHALL renderizar a tela de convite exibindo o slug `teste-slug` lido da URL.
2. WHEN toco em "Câmera" na tela de convite THEN SHALL navegar para `/e/teste-slug/camera`, que exibe título e o mesmo slug.
3. WHEN toco em "Galeria" THEN SHALL navegar para `/e/teste-slug/gallery`, que exibe título e o mesmo slug.

**Independent Test**: `npm test` — `renderRouter` nas três URLs assertando título + slug.

---

### P1: Rotas do host em esqueleto ⭐ MVP

**User Story**: Como host, quero navegar login → meus eventos → evento → moderação para que a estrutura do meu fluxo exista antes da API.

**Acceptance Criteria**:

1. WHEN navego para `/host/login` THEN SHALL ver a tela esqueleto de login com botão levando a `/host/events`.
2. WHEN estou em `/host/events` THEN SHALL poder navegar para um evento (`/host/events/[id]` com id de exemplo) e dele para `/host/events/[id]/moderation`.
3. WHEN estou na tela do evento ou moderação THEN o `id` lido da URL SHALL ser exibido.

**Independent Test**: `npm test` — `renderRouter` nas URLs do host assertando títulos e id.

---

### P1: Deep link abre a rota do convidado ⭐ MVP

**User Story**: Como convidado que escaneou o QR, quero que o link abra o app direto na tela do evento certo — é o pilar "zero fricção" do produto.

**Acceptance Criteria**:

1. WHEN o app é aberto com a URL `/e/{slug}` (via scheme `eterniza://e/{slug}`, link `exp://.../--/e/{slug}` no Expo Go, ou futuro universal link) THEN SHALL renderizar a tela de convite com o slug exato lido.
2. WHEN o slug contém hífens e números (ex.: `casamento-ana-joao-x7k2`) THEN SHALL ser lido integralmente, sem truncar.
3. WHEN o usuário abre o link em dispositivo físico (UAT) THEN o app SHALL abrir já na tela do convite do slug — **UAT interativo (AD-003)**, via `exp://` no Expo Go.

**Independent Test**: `npm test` (initialUrl) + UAT no iPhone com link do tunnel.

---

### P1: Home como hub esqueleto ⭐ MVP

**User Story**: Como usuário que abriu o app sem QR, quero um ponto de entrada mínimo (host) para que nenhuma rota fique órfã.

**Acceptance Criteria**:

1. WHEN a home renderiza THEN SHALL exibir botão "Sou host" navegando para `/host/login`.
2. WHEN a home renderiza THEN o link "componentes →" da Etapa 2 SHALL ter sido removido; o acesso à galeria SHALL existir apenas em `__DEV__`.

**Independent Test**: `npm test` — render da home assertando navegação e ausência do link antigo.

---

## Edge Cases

- WHEN a URL é `/e/` (sem slug) THEN SHALL cair no unmatched padrão do expo-router (não crashar).
- WHEN a URL contém slug URL-encoded THEN o slug exibido SHALL ser o decodificado.
- WHEN o usuário navega convite → câmera → volta THEN o slug SHALL permanecer o mesmo (stack preserva parâmetros).

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| NAV-01 | P1: Rotas do convidado | Execute | Verified (UAT pendente) — commits 6c09f42 + fix |
| NAV-02 | P1: Rotas do host | Execute | Verified (UAT pendente) — commit db69a24 |
| NAV-03 | P1: Deep link | Execute | Verified (UAT pendente) — commit 6917705 |
| NAV-04 | P1: Home hub | Execute | Verified (UAT pendente) — commit 4179496 |

**Coverage:** 4 total, 0 mapped to tasks (tasks implícitas no Execute — escopo Medium), 0 unmapped.

---

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002, adaptado ao ambiente)

- [ ] **URL com slug abre a tela certa com o slug lido** — automatizado via `renderRouter` + UAT no iPhone com `exp://<tunnel>/--/e/teste-slug` (o comando `uri-scheme open "eterniza://..."` literal fica para a Etapa 6, quando houver dev build).
- [ ] Gate automatizado verde: `tsc --noEmit` + lint + testes de rota/navegação.
- [ ] Commits atômicos (AD-005).
