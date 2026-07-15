# Eterniza — Brief do Aplicativo

> Documento de handoff para o projeto do app. Autossuficiente: contém o conceito,
> a stack recomendada, o contrato da API e as regras de produto necessárias para
> implementar o cliente sem acesso ao repositório do backend.
> Backend: Spring Boot, contrato completo em `API_CONTRACT.md` (repo eterniza-mono).

---

## 1. O produto em uma frase

**Câmera descartável digital para casamentos**: o host cria o evento e imprime um
QR; os convidados escaneiam, ganham um número limitado de "poses", fotografam com
filtros aplicados ao vivo — e **ninguém vê nada** até o momento da revelação,
quando a galeria abre para todos.

### Pilares da experiência
1. **Zero fricção para o convidado** — escaneou o QR, digitou o nome, já está fotografando. Sem conta, sem senha.
2. **Escassez** — poses limitadas (padrão 10 por convidado). Foto tirada é pose gasta; apagar não devolve.
3. **Surpresa** — a galeria fica bloqueada até o `revealAt` (ou até o host revelar manualmente). O contador de fotos aparece, as imagens não.
4. **Estética** — filtro escolhido e aplicado **ao vivo na câmera** (client-side, estilo Instagram). O servidor recebe a imagem final.
5. **Qualidade** — a foto é salva em alta resolução (4K) e o convidado salva direto na galeria do celular. **Nunca comprimir/redimensionar antes do upload** (limite: 20 MB, um JPEG 4K de qualidade fica em 3–6 MB).

---

## 2. Stack recomendada

### App (convidado + host): **React Native + Expo (TypeScript)**

| Necessidade | Solução |
|---|---|
| Base do app | Expo SDK + `expo-router` (TypeScript) |
| Câmera com filtro **ao vivo** | `react-native-vision-camera` + `@shopify/react-native-skia` (frame processors — filtro em tempo real na GPU) |
| Salvar 4K na galeria do celular | `expo-media-library` |
| Upload multipart | `fetch` + `FormData` (nativo) |
| QR / deep link | `expo-linking` + universal links (`https://eterniza.app/e/{slug}`) |
| Persistência do `deviceId` e tokens | `expo-secure-store` |
| Estado/servidor | TanStack Query (poucas telas, não precisa de mais) |
| Geração da imagem do QR (host) | `react-native-qrcode-svg` (o backend fornece só a URL) |

**Por que RN/Expo e não nativo ou Flutter:** um código para iOS+Android, ecossistema
TypeScript (alinhado ao restante do projeto), e o par VisionCamera+Skia resolve o
requisito mais difícil (filtro ao vivo) com performance nativa. Flutter também
resolveria, mas sem vantagem que justifique trocar de ecossistema.

### Escopo do cliente

**Foco único: o aplicativo** (convidado + host no mesmo app RN). O QR abre o app
via deep link; se não estiver instalado, o link leva à loja.

Ideias registradas para **depois** (fora do escopo atual): App Clip iOS (target
nativo Swift, exige HTTPS + `apple-app-site-association` no domínio) e uma versão
web do link do QR (exigiria CORS no backend). Nenhuma das duas bloqueia o MVP.

---

## 3. API — o que o app precisa saber

### Base
- Dev: `http://localhost:8080` (emulador Android: `http://10.0.2.2:8080`; dispositivo físico: IP da máquina na rede)
- Produção: HTTPS obrigatório (iOS ATS bloqueia HTTP)

### Envelope de resposta (todas as rotas)
```json
{ "success": true, "message": "...", "data": { }, "timestamp": "..." }
```
Erro de validação de payload (400) traz também `errors` (campo → mensagem):
```json
{ "success": false, "message": "...", "errors": { "name": "Nome do evento é obrigatório" } }
```
⚠️ **401 do filtro de segurança vem com corpo vazio** (sem envelope). Trate 401 pelo status HTTP.

### Dois tokens
| | hostToken | guestToken |
|---|---|---|
| Obtém em | `POST /api/auth/register` ou `/login` | `POST /api/auth/guest/session` |
| Validade | 24h (app deve re-logar automaticamente) | 7 dias |
| Header | `Authorization: Bearer <token>` | idem |

### Endpoints

| Método/Rota | Token | Para quê |
|---|---|---|
| `POST /api/auth/register` | — | Criar conta host: `{name, email, password}` → `data.token` |
| `POST /api/auth/login` | — | Login host: `{email, password}` → `data.token` |
| `POST /api/auth/guest/session` | — | Sessão convidado: `{displayName (máx 30), eventId, deviceId}` → `data` = guestToken (string) |
| `POST /api/events` | host | Criar evento: `{name, revealAt (ISO, futuro), photoLimitPerGuest? (1–100, padrão 10)}` → EventResponse |
| `GET /api/events/slug/{slug}` | — | O que o app chama ao abrir o link do QR → EventResponse |
| `GET /api/events/my` | host | Meus eventos → lista de EventResponse |
| `POST /api/events/{id}/reveal` | host (dono) | Revelar agora (idempotente) → EventResponse |
| `POST /api/events/{id}/cover` | host (dono) | Multipart: `file` (foto dos noivos, JPEG/PNG/WebP ≤20MB) → EventResponse com `coverImageUrl`. Reenviar substitui |
| `POST /api/photos/upload` | guest | Multipart: `file` (imagem **já filtrada**, JPEG/PNG/WebP, ≤20MB) + `eventId` → `{photoId, message, photosRemaining}` |
| `GET /api/photos/gallery/{eventId}` | — | Galeria pública → `{revealed, totalPhotos, photoUrls[]}` |
| `GET /api/photos/event/{eventId}` | host (dono) | Moderação → `[{photoId, guestName, createdAt, url}]` (url **sempre** presente, mesmo antes do reveal) |
| `DELETE /api/photos/{photoId}` | host (dono) | Apagar foto (soft delete, idempotente; **não devolve a pose** do convidado) |

### EventResponse
```json
{
  "id": "uuid", "name": "Casamento Ana & João",
  "slug": "casamento-ana-joao-x7k2",
  "qrCodeUrl": "https://eterniza.app/e/casamento-ana-joao-x7k2",
  "status": "ACTIVE | REVEALED",
  "revealAt": "2026-08-01T20:00:00Z",
  "photoLimitPerGuest": 10, "photoCount": 3,
  "coverImageUrl": "https://<bucket>.r2.dev/events/.../cover.jpg",
  "createdAt": "..."
}
```
- `qrCodeUrl` é o **link**, não a imagem — o app gera o QR a partir dela.
- `photoCount` é a contagem real de fotos visíveis do evento.
- `coverImageUrl` é a capa do convite (foto dos noivos): fundo full-bleed da tela `/e/{slug}` e da revelação, com scrim `overlay` por cima. **`null` = usar fundo padrão** (`editorial`).

### Erros que o app deve tratar no upload
| Status | Situação |
|---|---|
| 400 | Arquivo vazio / formato inválido / >20MB / **"Você já usou todas as suas N fotos neste evento"** |
| 401 | Token ausente/inválido (corpo vazio) |
| 404 | Evento não existe |

---

## 4. Regras de produto que moram no cliente

1. **`deviceId`**: o app gera um UUID **uma vez** e persiste em storage seguro. É ele que identifica o convidado para o limite de poses. Se regenerar, o convidado "vira outra pessoa" (e perde o histórico) — nunca regenerar.
2. **Contador de poses**: use `photosRemaining` da resposta do upload + `photoLimitPerGuest` do evento. Desabilite o obturador quando zerar — não deixe o usuário fotografar para receber 400.
3. **Filtro é client-side**: o convidado escolhe o filtro na câmera e a imagem enviada já é a final. O servidor não processa nada (`201` = pronto, sem polling).
4. **Não comprimir**: enviar a foto na resolução máxima da câmera. O que subir degradado fica degradado para sempre.
5. **Galeria bloqueada — fotos "trancadas" (blur + cadeado)**: antes do reveal, a foto tirada não some — ela aparece **trancada**: miniatura **borrada** com um **cadeado** sobreposto. Importante: o backend não entrega nenhuma imagem antes do reveal (`photoUrls` vazio), então o blur é responsabilidade do app:
   - **Fotos do próprio convidado**: logo após a captura, o app gera localmente uma miniatura borrada (blur forte, irreconhecível) e a guarda no dispositivo — é ela que aparece trancada na "tira de filme" do convidado. A imagem nítida **não** fica acessível no app.
   - **Fotos dos outros convidados**: não existe imagem nenhuma — renderizar cartões-placeholder (textura neutra + cadeado), na quantidade de `totalPhotos`.
   - Junto, mostrar `totalPhotos` ("já foram tiradas 47 fotos 🎞️") e a contagem regressiva para o reveal.
6. **Host vê tudo, sempre**: a tela de moderação do host (`GET /api/photos/event/{id}`) mostra as imagens mesmo antes do reveal. Só o dono acessa (a conta do evento é compartilhada com o casal — decisão de produto: uma conta de host por casamento).
7. **Salvar na galeria**: pós-reveal, tocar na foto salva a imagem (URL pública, alta resolução) direto na galeria do celular via `expo-media-library`. Sem ZIP, sem download em lote.
8. **Sessão de guest não valida o evento** — antes de criar a sessão, o app **deve** buscar `GET /api/events/slug/{slug}` (que é o fluxo natural do QR de qualquer forma) e usar o `id` retornado.
9. **Planos = `photoLimitPerGuest`**: a quantidade de fotos por convidado vem do contrato/plano vendido (ex.: Essencial — 10 fotos, Premium — 16 fotos). O conceito de plano mora **na UI e no comercial**, não no backend: a tela de criação de evento mostra os planos e envia o número correspondente em `photoLimitPerGuest`. O backend aceita qualquer valor de 1 a 100, o que permite criar planos novos sem mudança de código.

---

## 5. Fluxos

### Convidado
```
QR → app abre /e/{slug} → GET /events/slug/{slug}
  → tela-convite: coverImageUrl como fundo full-bleed (scrim overlay)
    + "Você foi convidado para {name}" + campo nome
  → POST /auth/guest/session (deviceId persistido)
  → CÂMERA (filtros ao vivo, contador de poses)
  → upload a cada foto (photosRemaining atualiza o contador)
  → depois do reveal: galeria aberta, salvar fotos na galeria do celular
```

### Host
```
Login (conta criada/entregue pelo serviço)
  → meus eventos → evento: QR para imprimir/compartilhar, photoCount ao vivo,
    enviar/trocar a capa do convite (foto dos noivos, da galeria do celular)
  → moderação: grade de fotos (visível pré-reveal), apagar as impróprias
  → botão "Revelar agora" (confirmação!) ou espera o revealAt
```

---

## 6. Design

Este produto **vende estética e emoção**; o design não é acabamento, é núcleo.

➡️ **A identidade visual está definida em `DESIGN_SYSTEM.md`** (entregar junto com
este brief): linguagem editorial de luxo — monocromática (branco, marfim,
preto-editorial), cantos retos, acento raro azul-petróleo, tipografia Cormorant
(corpo/UI) + Archivo Light (títulos) — com tokens prontos em TypeScript,
componentes base e a especificação das telas-assinatura (câmera, fotos trancadas
e revelação), incluindo os nomes dos filtros de lançamento.

O que ainda é trabalho de design durante o desenvolvimento: curvas exatas dos
filtros (Skia), telas do host, estados vazios e microinterações.

---

## 7. Pendências do backend que afetam o app (radar)

| Pendência | Impacto | Quando resolver |
|---|---|---|
| **URLs do storage local vêm como `http://localhost:9000/...`** | O PC carrega, mas o **celular físico não** (para ele, `localhost` é ele mesmo). Não afeta o upload (Etapa 6) — afeta **exibir** as imagens no aparelho (Etapas 8–10: fotos trancadas com capa, galeria, moderação) | Antes da Etapa 8: definir a env var `R2_PUBLIC_URL=http://<IP-da-máquina-na-rede>:9000/eterniza-photos` na run config do backend (ex.: `http://192.168.100.x:9000/...`) e reiniciar. Liberar a porta 9000 no Firewall do Windows, como a 8080. O default `localhost` do `application.yml` fica como está — o IP muda por rede, é config de ambiente |
| CORS não configurado | **Nenhum para o app** (apps nativos não usam CORS); só importa se um dia existir cliente web | Se/quando houver front web |
| HTTPS + domínio | Necessário para produção (iOS ATS bloqueia HTTP) e para os deep links universais | Antes do lançamento |
| guestToken em rota de host → 500 (em vez de 403) | Cosmético; não afeta fluxo correto | Qualquer hora |
| Sem recuperação de senha | Conta é criada/entregue pelo serviço; reset é manual | Aceito por decisão |
| hostToken expira em 24h | App do host deve re-logar automaticamente (guardar credenciais em secure storage) | Regra do app |
