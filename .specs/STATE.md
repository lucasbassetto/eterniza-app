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

## Handoff

- **Etapa 1 (`etapa-1-fundacao`):** ✅ CONCLUÍDA — Verifier PASS + UAT aprovado (2026-07-14). Commits f083aba..c89ae5e.
- **Feature ativa:** `etapa-2-componentes` — spec em elaboração, aguardando aprovação do usuário.
- **Notas de ambiente:** teste em iPhone físico via `npx expo start --tunnel` (LAN bloqueada por firewall); Expo Go da App Store = SDK 54 (AD-006). Projeto em `src/app` (expo-router); tokens em `src/theme/theme.ts`; gate = `npx tsc --noEmit` + `npm run lint` + `npm test` (jest-expo). Adaptive icon do template mantido (Etapa 11).
