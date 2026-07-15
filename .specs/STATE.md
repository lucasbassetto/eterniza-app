# STATE — Eterniza App

## Decisions

| ID | Decisão | Data | Origem |
|---|---|---|---|
| AD-001 | Desenvolvimento segue o `ROADMAP.md` etapa por etapa via spec-driven; **uma etapa = uma feature**; nunca adiantar trabalho de etapas futuras. | 2026-07-14 | Usuário |
| AD-002 | Os critérios "✅ Verificar" de cada etapa do roadmap **são os acceptance criteria** da feature. | 2026-07-14 | Usuário |
| AD-003 | Verificação **visual/de dispositivo é UAT interativo com o usuário** — nunca teste automatizado. Testes automatizados cobrem apenas o que é verificável em código (tokens, lógica, tipos). | 2026-07-14 | Usuário |
| AD-004 | Stack: React Native + Expo (TypeScript), `expo-router`, conforme `APP_BRIEF.md` §2. Design tokens conforme `DESIGN_SYSTEM.md` §9 — copiar exatamente, não reinterpretar. | 2026-07-14 | APP_BRIEF / DESIGN_SYSTEM |
| AD-005 | Cada etapa termina com o critério de verificação cumprido de verdade + **um commit atômico** (regra do ROADMAP.md). | 2026-07-14 | ROADMAP |
| AD-006 | Projeto fixado no **Expo SDK 54**: o dispositivo de teste é iPhone e o Expo Go da App Store está travado no SDK 54 (revisão da Apple pendente para 55+). Reavaliar upgrade na Etapa 6, quando o dev build (`expo-dev-client`) eliminar a dependência do Expo Go. | 2026-07-14 | Usuário (UAT Etapa 1) |
| AD-007 | **As telas usam como referência de composição/UX as imagens de `stitch_digital_disposable_social_camera/`** (screenshots do app Scene). Mapa: landing_6 = convite `/e/[slug]` (Etapa 5); landing_2/3 = câmera (Etapas 6–7); landing_4 = escolha de filtro (Etapa 7); landing_1/7/8 = evento/álbum com fotos trancadas + countdown + stats (Etapas 8–9); landing_5 = QR do host (Etapa 10); landing_9/10 = home/eventos do host (Etapa 10). **Hierarquia**: as imagens definem composição e conteúdo das telas; o `DESIGN_SYSTEM.md` prevalece na identidade visual (tipografia, cores, cantos retos — o Scene usa cantos arredondados; nós não). | 2026-07-14 | Usuário |

## Handoff

- **Etapa 1 (`etapa-1-fundacao`):** ✅ CONCLUÍDA — Verifier PASS + UAT aprovado (2026-07-14). Commits f083aba..c89ae5e.
- **Etapa 2 (`etapa-2-componentes`):** ✅ CONCLUÍDA — Verifier PASS (38 testes, sensor 4/4) + UAT aprovado (2026-07-14). Commits 20a31e6..a05e932.
- **Etapa 3 (`etapa-3-navegacao`):** ✅ CONCLUÍDA — Verifier FAIL→fix→PASS (55 testes, sensor 5/5, lesson L-001) + UAT aprovado (2026-07-14). Commits 6c09f42..f9fc748. `eterniza://` literal re-verifica na Etapa 6.
- **Etapa 4 (`etapa-4-api-auth`):** ✅ CONCLUÍDA — Verifier ISSUES→fix→PASS (76 testes, sensor 5/5, lesson L-002) + UAT aprovado (2026-07-14): login real no iPhone com sessão persistida. Commits 3341a00..29f512f + fix.
- **Etapa 5 (`etapa-5-fluxo-convidado`):** ✅ CONCLUÍDA — Verifier PASS de primeira (91 testes, sensor 6/6) + UAT aprovado (2026-07-15). Commits cd92639..7723853. Evento de teste no backend: slug `casamento-ana-joao-1fuf`.
- **Feature ativa:** `etapa-6-camera-basica` — código implementado e verificado (114 testes, sensor 6/6, verificação inline); commits 6fd8262 (CAM-01), 9524005 (CAM-03), 0aa8d66 (CAM-04), 3aa8283 (CAM-02). **Pendente: build no Mac + UAT** (foto real no backend; limite esgota o obturador antes do 400; deep link `eterniza://`). Decisões: usuário tem Mac (Xcode + personal team, app expira 7 dias); VisionCamera **v4** (v5 = Nitro, sem config plugin, cedo demais); **AD-006 mantida** — SDK 54 fica, upgrade vira item de pré-lançamento; repo GitHub privado `lucasbassetto/eterniza-app` (origin).
- **Build no Mac (roteiro):** clone + `npm install` + `cp .env.example .env` (IP real) + `npx expo run:ios --device`; Xcode → Signing → Personal Team na 1ª vez; iPhone com Modo Desenvolvedor ativo; confiar no certificado em Ajustes. CocoaPods se faltar: `brew install cocoapods`.
- **UAT do fluxo convidado (checklist):** link `exp://<url-do-tunnel>/--/e/{slug}` simula o QR; o `/--/` é obrigatório (sem ele o Expo Go abre a home). Gerar QR no terminal para escanear: `npx qrcode-terminal "<link>"`.
- **Ambiente de UAT com backend (checklist para as próximas etapas):** iPhone físico alcança a API em `http://<IP-da-máquina>:8080` desde que: (1) porta 8080 liberada no firewall do Windows (`New-NetFirewallRule ... -LocalPort 8080`); (2) `.env` com o IP de rede **atual** da máquina (DHCP muda — conferir com `ipconfig` e reiniciar o Metro com `--clear` após editar); (3) **permissão "Rede Local" do iOS ativada para o Expo Go** (Ajustes → Privacidade e Segurança → Rede Local) — sem ela o Safari alcança a API mas o fetch do app falha com "Network request failed".
- **Notas de ambiente:** teste em iPhone físico via `npx expo start --tunnel` (LAN bloqueada por firewall); Expo Go da App Store = SDK 54 (AD-006). Projeto em `src/app` (expo-router); tokens em `src/theme/theme.ts`; gate = `npx tsc --noEmit` + `npm run lint` + `npm test` (jest-expo). Conta de teste do host: `host@teste.com` / `eterniza123`. Adaptive icon do template mantido (Etapa 11).
