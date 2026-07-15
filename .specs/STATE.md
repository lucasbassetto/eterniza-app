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
- **Feature ativa:** `etapa-3-navegacao` — implementada e verificada (Verifier FAIL→fix→PASS, 55 testes, sensor 5/5 após fix, lesson L-001); commits 6c09f42..4179496 + fix. **Pendente: UAT interativo** (deep link exp:// + fluxos esqueleto no iPhone).
- **Notas de ambiente:** teste em iPhone físico via `npx expo start --tunnel` (LAN bloqueada por firewall); Expo Go da App Store = SDK 54 (AD-006). Projeto em `src/app` (expo-router); tokens em `src/theme/theme.ts`; gate = `npx tsc --noEmit` + `npm run lint` + `npm test` (jest-expo). Adaptive icon do template mantido (Etapa 11).
