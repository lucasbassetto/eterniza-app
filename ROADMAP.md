# Eterniza App — Roteiro de Desenvolvimento por Etapas

> Regras de trabalho: **uma etapa por vez**. Cada etapa termina com o critério de
> verificação cumprido (rodando de verdade, não "deveria funcionar") e **um commit
> atômico**. Não adiantar trabalho de etapas futuras. Em dúvida de produto ou
> design, consultar `APP_BRIEF.md` e `DESIGN_SYSTEM.md` — se a resposta não
> estiver lá, **perguntar antes de assumir**.

---

## Etapa 1 — Fundação do projeto
- Criar projeto Expo + TypeScript (`create-expo-app`), estrutura de pastas, `expo-router`
- Implementar `theme.ts` exatamente como está no `DESIGN_SYSTEM.md` §9
- Carregar as fontes (`@expo-google-fonts/cormorant` e `/archivo`) com splash até carregar
- Uma tela placeholder usando os tokens (fundo `canvas`, título em Archivo, corpo em Cormorant)

✅ **Verificar**: app abre no Expo Go com a tela estilizada e as duas fontes visíveis.

## Etapa 2 — Componentes base do design system
- `Text` (variantes display/title/heading/body/label/caption), `Button` (primário outline, destaque, texto, destrutivo), `Input` (label caixa alta, estados foco/erro), `Screen` (gutter 24, safe area)
- Tela interna `/dev/components` exibindo todos (galeria de componentes para validação visual)

✅ **Verificar**: galeria de componentes confere com o `DESIGN_SYSTEM.md` (cantos retos, sem sombra, botão outline 2px).

## Etapa 3 — Navegação e deep link
- Rotas: convidado (`/e/[slug]`, câmera, galeria) e host (login, eventos, evento, moderação) — **telas em esqueleto**, só título + navegação
- Deep link `eterniza://` + universal link `/e/{slug}` abrindo a rota do convidado

✅ **Verificar**: `npx uri-scheme open "eterniza://e/teste-slug" --android` (ou iOS) abre a tela certa com o slug lido.

## Etapa 4 — Cliente da API + auth do host
- Módulo `api/` (fetch + envelope `{success, message, data, errors}`, tratamento de 401 corpo vazio, base URL por env)
- TanStack Query configurado
- Login/registro do host contra o backend local; token em `expo-secure-store`; re-login automático ao expirar (24h)

✅ **Verificar**: com o backend rodando, logar de verdade e ver o token persistir entre reaberturas do app.

## Etapa 5 — Fluxo de entrada do convidado
- `/e/[slug]`: busca `GET /api/events/slug/{slug}`, tela "Você foi convidado para {name}" + campo nome
- `deviceId`: gerar UUID **uma única vez**, persistir em secure store (regra 1 do brief — nunca regenerar)
- `POST /api/auth/guest/session` e navegação para a câmera (ainda esqueleto)

✅ **Verificar**: fluxo completo contra o backend local — slug inexistente mostra erro elegante.

## Etapa 6 — Câmera básica (sem filtros)
- ⚠️ Esta etapa exige **dev build** (`expo-dev-client`) — VisionCamera não roda no Expo Go
- `react-native-vision-camera`: permissões, preview full-bleed, obturador (spec §6 do design system), captura em máxima resolução
- Upload multipart real (`file` + `eventId`), tratando os erros do brief (limite, 404, 401)
- Contador de poses ("7 de 10") alimentado por `photoLimitPerGuest` + `photosRemaining`

✅ **Verificar**: foto tirada no celular aparece no backend (conferir via Postman na galeria/moderação); ao estourar o limite, o obturador desabilita **antes** do erro.

## Etapa 7 — Filtros ao vivo (Skia)
- `@shopify/react-native-skia` frame processors: os 6 filtros do design system (`Original`, `Nupcial`, `Ouro`, `Sépia`, `P&B Clássico`, `Vintage 94`)
- Carrossel de miniaturas circulares, anel branco no ativo; filtro aplicado no preview **e** na imagem final enviada
- Anel `accent` no obturador na última pose

✅ **Verificar**: preview com filtro em tempo real fluido (≥30fps) e a foto no backend já filtrada.

## Etapa 8 — Fotos trancadas
- Na captura: gerar miniatura borrada local (blur forte) e guardar no dispositivo; a nítida não fica acessível
- "Tira de filme" na câmera com as poses gastas trancadas (blur + cadeado, spec §6)
- Toque na trancada: micro-shake + haptic + "Revela em {tempo} 🎞️"

✅ **Verificar**: após fotografar, a miniatura aparece trancada e irreconhecível; fechar e reabrir o app mantém as trancadas.

## Etapa 9 — Galeria e revelação
- Galeria pública (`GET /api/photos/gallery/{eventId}`): antes do reveal, placeholders trancados + `totalPhotos` + contagem regressiva; depois, grade 2 colunas
- A cerimônia da revelação (animação de destrancar, spec §6)
- Foto em tela cheia + "Salvar na galeria" (`expo-media-library`)

✅ **Verificar**: revelar o evento via Postman (`POST /reveal`) e ver o app transicionar; foto salva aparece na galeria nativa do celular em alta resolução.

## Etapa 10 — Telas do host
- Meus eventos, criar evento (**planos como opções**: "Essencial — 10 fotos", "Premium — 16" → `photoLimitPerGuest`; regra 9 do brief)
- Tela do evento: QR gerado de `qrCodeUrl` (`react-native-qrcode-svg`), `photoCount` ao vivo, botão "Revelar agora" (variante Destaque + confirmação)
- Moderação: grade com fotos visíveis (host vê sempre), apagar com confirmação (aviso: pose do convidado não volta)

✅ **Verificar**: ciclo completo só pelo app — host cria evento → convidado (outro device/perfil) fotografa → host modera → revela → galeria abre.

## Etapa 11 — Polimento
- Haptics, estados vazios, telas de erro/offline, loading states, ícone e splash do app

✅ **Verificar**: passada completa pelos dois fluxos sem tela "crua".

---

### Fora do escopo (não implementar sem pedir)
App Clip, versão web, notificações push, pagamentos/planos no backend, modo escuro global.
