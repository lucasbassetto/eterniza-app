# Etapa 6 — Câmera Básica (sem filtros): Specification

> Fonte: `ROADMAP.md` Etapa 6 + `APP_BRIEF.md` §1/§3/§4 + `DESIGN_SYSTEM.md` §6 (câmera) +
> refs. landing_2/3 (AD-007). Escopo: **Large** (primeira etapa com código nativo e mudança de
> ambiente de teste — dev build; ainda assim sem Design doc separado: as decisões estão
> documentadas nas assumptions e o design visual da câmera já está especificado no DS §6).

## Problem Statement

O convidado entra no evento (Etapa 5) e cai numa tela de câmera que é só um título. O coração
do produto — fotografar com poses limitadas — não existe. Para existir, o app precisa da
`react-native-vision-camera`, que **não roda no Expo Go**: esta etapa introduz o **dev build**
(`expo-dev-client`, compilado no Mac via Xcode) e entrega a câmera funcional sem filtros:
permissão, preview full-bleed, obturador do design system, captura em resolução máxima, upload
multipart real e o contador de poses que desabilita o obturador **antes** do erro de limite.

## Goals

- [ ] **Dev build**: `expo-dev-client` + VisionCamera compilados no Mac (`expo run:ios`),
      instalados no iPhone, conectando no Metro do Windows — o fluxo de dev diário não muda
- [ ] **Câmera**: permissão pedida com contexto, preview full-bleed em shell `editorial`,
      obturador 76px (DS §6), captura na resolução máxima do dispositivo (nunca comprimir)
- [ ] **Upload real**: `POST /api/photos/upload` multipart (`file` + `eventId`) com o
      guestToken; erros do brief tratados (limite, 404, 401, rede)
- [ ] **Contador de poses**: "7 de 10" sempre visível; anel `accent` na última pose; obturador
      desabilitado ao zerar com mensagem serena — nunca deixar fotografar para receber 400
- [ ] Deep link `eterniza://` re-verificado no dev build (pendência da Etapa 3)

## Out of Scope

| Feature | Reason |
|---|---|
| Filtros ao vivo (Skia, carrossel de miniaturas) | Etapa 7 — a barra de filtros nem aparece ainda |
| Miniatura borrada local + "tira de filme" de poses gastas | Etapa 8 |
| Galeria/revelação | Etapa 9 |
| Flash, zoom (0.5x/1x/2x da referência landing_2/3) | Polimento (Etapa 11) — o essencial é capturar; adicionar controles depois não muda a arquitetura |
| Build Android do dev client | Device de teste é iPhone (AD-006); Android entra quando houver device/necessidade |
| Upgrade do Expo SDK | Reavaliado nesta etapa (ver assumptions): **mantém SDK 54** |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|---|---|---|---|
| **AD-006 reavaliada — SDK** | **Manter SDK 54.** O motivo original (Expo Go da App Store) morre com o dev build, mas trocar de SDK no meio do projeto adiciona risco sem ganho concreto: tudo verde em 54 e a VisionCamera o suporta. Upgrade vira item de pré-lançamento | Estabilidade > novidade no meio do roadmap; Expo Go continua útil como fallback para telas sem câmera | n |
| Transporte do código até o Mac | Repositório **privado no GitHub** (o repo local não tem remote). Mac clona; builds futuros = `git pull` | Caminho padrão, também prepara CI/EAS futuro | n |
| Fluxo de build no Mac | `npx expo run:ios --device` (prebuild automático + Xcode). Assinatura com Apple ID gratuito (personal team) — app expira a cada 7 dias, reinstala do Mac | Decisão do usuário (tem Mac); custo zero | y (usuário, 2026-07-15) |
| Pastas nativas `ios/`/`android/` | **Não versionadas** (CNG/prebuild puro; ficam no .gitignore) | Config nativa mora no `app.json` (plugins); menos diff, menos drift | n |
| Versão da VisionCamera | v4.x (a estável atual compatível com RN 0.81/SDK 54), instalada com config plugin no `app.json` + `NSCameraUsageDescription` | Par recomendado pela própria lib para Expo | n |
| Microfone | **Não pedir** permissão de microfone (`enableMicrophonePermission: false`) — o produto é foto, não vídeo | Pedir permissão sem uso é atrito e reprovação em review | n |
| Câmera frontal/traseira | Botão de flip **incluído** (selfie é caso de uso central em festa), começa na traseira | Barato agora; a referência landing_2/3 o mostra | n |
| Estado do contador na (re)entrada | `photosRemaining` persiste junto da sessão do convidado (secure store) e é a fonte local; valor inicial = `photoLimitPerGuest` do evento em sessão nova; cada upload atualiza com o `photosRemaining` da resposta (fonte da verdade = servidor). 400 de limite → força 0 | O backend não expõe "poses restantes" fora da resposta de upload (brief §3); persistir o último valor conhecido cobre reaberturas | n |
| Foto tirada: confirmar antes de subir? | **Não** — capturou, subiu (upload começa imediato; pose é gasta na captura). Sem tela de preview/retake | Pilar da escassez: "foto tirada é pose gasta" + zero fricção. É o comportamento de câmera descartável | n |
| Falha de upload (rede) | A pose NÃO é gasta localmente se o upload falhar: erro discreto + obturador volta a habilitar (o servidor só conta o que recebeu) | O contador local segue o servidor; gastar pose numa foto que não subiu quebraria a promessa das N fotos | n |
| Upload em andamento | Obturador desabilitado durante o upload (1 foto por vez nesta etapa) | Simplicidade; fila/paralelismo só se o UAT mostrar lentidão real | n |
| Permissão negada | Tela dedicada no shell editorial explicando o porquê + botão "Abrir ajustes" (`Linking.openSettings()`) | Sem câmera o fluxo não existe; guiar em vez de travar | n |
| Composição da tela | Ref. landing_2/3 adaptada (AD-007): topo = nome do evento (`caption`/`editorial-text`) + contador "7 de 10"; base = obturador central 76px + flip à direita; sem barra de filtros (Etapa 7), sem tira de filme (Etapa 8) | Hierarquia AD-007: composição da referência, identidade do DS (§6) | n |
| Testes automatizados | VisionCamera **mockada** no jest (módulo nativo): testam-se o contador (init/decremento/zero), o gating do obturador, o client de upload (FormData, erros 400/401/404) e a integração tela↔upload com fetch mockado. Captura real, permissão real e qualidade de imagem = UAT (AD-003) | Câmera física não existe no CI | n |
| Guest token no upload | `request()` já aceita `token`; upload usa o guestToken da sessão do evento. **Sem** re-login automático de guest (token dura 7 dias > duração de qualquer festa); 401 → mensagem para reabrir o link do convite | Envelope pronto; complexidade de refresh não se paga | n |

**Open questions:** criar o repositório GitHub privado requer uma conta GitHub do usuário —
confirmar no início da implementação (alternativa: transferir por pendrive/AirDrop, pior para
iterar).

**Dimensões implícitas**: **permissões/lifecycle** (negada, "perguntar depois", background),
**falha externa** (upload com rede ruim de festa), **retry/idempotência** (pose não gasta em
falha; sem duplo upload), **limite/validação** (contador, 400 de limite, 20MB improvável em
JPEG), **auth boundary** (guestToken por evento). N/A: concorrência multiusuário (deviceId
isola), pagamentos.

**Lessons aplicadas**: L-002 — o elo câmera→upload→contador→obturador será testado
ponta-a-ponta numa suíte própria (não só as peças).

---

## User Stories

### P1: Dev build funcionando ⭐ MVP (infra)

**User Story**: Como desenvolvedor, quero o app compilado com os módulos nativos rodando no
iPhone e conectado ao Metro do Windows, para desenvolver a câmera com o mesmo ciclo rápido de
sempre.

**Acceptance Criteria**:

1. WHEN o projeto compila no Mac (`expo run:ios --device`) THEN o app "Eterniza" SHALL instalar
   e abrir no iPhone com todas as telas existentes funcionando (regressão zero das Etapas 1–5).
2. WHEN o Metro roda no Windows THEN o dev build SHALL conectar e recarregar JS sem novo build.
3. WHEN `eterniza://e/{slug}` abre no dispositivo THEN a tela do convite SHALL abrir com o slug
   certo (pendência da Etapa 3 — agora com o scheme real).

**Independent Test**: majoritariamente UAT (AD-003 — é ambiente físico). Automatizável: config
do `app.json` (plugin da VisionCamera + `NSCameraUsageDescription` + scheme) coberta por teste
de snapshot da config.

---

### P1: Câmera com preview e captura ⭐ MVP

**User Story**: Como convidado, quero apontar e fotografar em tela cheia, para viver a festa em
vez de operar um app.

**Acceptance Criteria**:

1. WHEN abro a câmera pela primeira vez THEN o app SHALL pedir permissão de câmera; WHEN nego
   THEN uma tela no shell editorial SHALL explicar e oferecer "Abrir ajustes" (sem crash, sem
   tela preta).
2. WHEN a permissão existe THEN o preview SHALL ocupar a tela (full-bleed, shell `editorial`)
   com o nome do evento e o contador de poses visíveis no topo.
3. WHEN toco o obturador THEN a foto SHALL ser capturada na resolução máxima disponível e o
   upload SHALL começar imediatamente (sem tela de confirmação).
4. WHEN toco o botão de flip THEN a câmera SHALL alternar entre traseira e frontal.

**Independent Test**: render da tela com VisionCamera mockada (permissão concedida/negada,
elementos visíveis); captura e qualidade real = UAT.

---

### P1: Upload real com erros tratados ⭐ MVP

**User Story**: Como convidado, quero que minha foto chegue ao evento na hora, e que problemas
apareçam como mensagens claras — não como travamentos.

**Acceptance Criteria**:

1. WHEN a captura termina THEN o app SHALL enviar `POST /api/photos/upload` multipart com
   `file` (imagem original, sem compressão/redimensionamento) e `eventId`, autenticado com o
   guestToken do evento.
2. WHEN o upload responde 201 THEN o contador SHALL atualizar com o `photosRemaining` da
   resposta (fonte da verdade).
3. WHEN o upload falha por rede THEN a pose SHALL NOT ser gasta localmente, uma mensagem
   discreta SHALL aparecer e o obturador SHALL voltar a habilitar.
4. WHEN o backend responde 400 de limite ("já usou todas as N fotos") THEN o contador SHALL ir
   a zero e o estado de esgotado SHALL aparecer.
5. WHEN o backend responde 401 THEN o app SHALL orientar a reabrir o link do convite (sem
   re-login automático de guest).

**Independent Test**: `npm test` — client de upload com fetch mockado (FormData montado, 201,
400 limite, 401, rede); integração tela↔upload com câmera mockada.

---

### P1: Contador de poses e obturador que respeita o limite ⭐ MVP

**User Story**: Como convidado, quero ver quantas poses me restam e ser impedido *com
elegância* de passar do limite — nunca ver um erro de servidor.

**Acceptance Criteria**:

1. WHEN entro na câmera THEN o contador SHALL mostrar "{restantes} de {photoLimitPerGuest}"
   (semântica de filme restante, como na câmera descartável — DS §6 "7 de 10"), partindo do
   último `photosRemaining` conhecido (persistido com a sessão) ou do limite do evento em
   sessão nova.
2. WHEN resta exatamente 1 pose THEN o anel do obturador SHALL ficar `accent` (único momento
   cromático — DS §6).
3. WHEN as poses zeram THEN o obturador SHALL desabilitar (anel `editorial-border`) e a
   mensagem "Suas fotos estão guardadas até a revelação ✨" SHALL aparecer — **antes** de
   qualquer 400 do servidor.
4. WHEN há upload em andamento THEN o obturador SHALL ficar desabilitado até a resposta.
5. WHEN fecho e reabro o app no meio do evento THEN o contador SHALL continuar do valor
   persistido (não volta ao limite cheio).

**Independent Test**: `npm test` — reducer/estado do contador + gating do obturador em todos os
estados; persistência com secure store mockado; suíte E2E tela↔upload↔contador (L-002).

---

## Edge Cases

- WHEN a permissão está "negada para sempre" (iOS não re-pergunta) THEN a tela de permissão
  SHALL continuar oferecendo "Abrir ajustes" em vez de re-pedir em loop.
- WHEN o app vai a background durante um upload THEN o resultado ao voltar SHALL ser
  consistente (sucesso atualiza contador; falha devolve a pose) — sem estado "fantasma".
- WHEN o upload responde 404 (evento apagado) THEN mensagem clara, sem gastar pose local.
- WHEN o dispositivo não tem câmera disponível (simulador) THEN a tela SHALL degradar com
  mensagem em vez de crash (dev build roda em simulador sem câmera).
- WHEN `photosRemaining` persistido diverge do servidor (ex.: fotos apagadas pelo host NÃO
  devolvem pose — regra do brief) THEN a resposta do próximo upload corrige o valor local.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|---|---|---|---|
| CAM-01 | P1: Dev build funcionando | Execute | Implementado (config) — commit 6fd8262; build/UAT pendente no Mac |
| CAM-02 | P1: Câmera com preview e captura | Execute | Verified (código) — commit 3aa8283; captura real = UAT |
| CAM-03 | P1: Upload real com erros tratados | Execute | Verified — commit 9524005 |
| CAM-04 | P1: Contador de poses e obturador | Execute | Verified — commit 0aa8d66 + 3aa8283 |

**Coverage:** 4 total, 0 mapped to tasks (tasks implícitas no Execute), 0 unmapped.

---

## Preparação de ambiente (uma vez, antes do UAT)

1. **Windows**: criar repo GitHub privado, `git remote add origin … && git push -u origin master`
2. **Windows**: instalar `expo-dev-client` + `react-native-vision-camera`, configurar plugin no
   `app.json` (permissão de câmera, sem microfone), commit + push
3. **Mac**: instalar Xcode (App Store) + aceitar licença; `git clone`, `npm install`,
   `npx expo run:ios --device` com o iPhone no cabo; assinar com Apple ID pessoal (personal
   team) no Xcode na primeira vez
4. **iPhone**: confiar no certificado (Ajustes → Geral → VPN e Gerenciamento de Dispositivo)
5. **Windows**: `npx expo start --tunnel` — o dev build (não o Expo Go) conecta e o ciclo
   normal recomeça. Lembrete: assinatura gratuita expira em 7 dias → reinstalar do Mac.

## Success Criteria (= "✅ Verificar" do ROADMAP, por AD-002)

- [ ] **Foto tirada no iPhone aparece no backend** (conferida via Postman em
      `GET /api/photos/event/{eventId}` com hostToken) — UAT interativo (AD-003).
- [ ] **Ao estourar o limite, o obturador desabilita ANTES do erro** — UAT: tirar as 10 fotos
      do evento de teste e observar o estado esgotado sem nenhum erro de servidor.
- [ ] Deep link `eterniza://e/{slug}` abre o convite no dev build — UAT (fecha a pendência da
      Etapa 3).
- [x] Gate automatizado verde: `tsc --noEmit` + lint + 114/114 testes. Verificação com sensor
      6/6 (lastPose, isLimitError amplo, uri sem file://, pose gasta em falha, obturador sem
      disabled, sem persistência — todas detectadas). Verificação inline (agente Verifier
      indisponível por limite de sessão).
- [x] Commits atômicos (AD-005): 6fd8262, 9524005, 0aa8d66, 3aa8283.
