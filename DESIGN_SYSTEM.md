# Eterniza — Design System (v2)

> Documento de handoff para o desenvolvimento do app. Define identidade visual,
> tokens e componentes base. **v2**: paleta, tipografia e formas atualizadas para
> a direção editorial de luxo (referência: monocromático, cantos retos, serifa
> Cormorant, fotografia protagonista). O produto e as telas continuam os mesmos.

---

## 1. Essência da marca

**Editorial, sensual na medida, sereno.** O produto vive dentro de casamentos: a
interface é monocromática e de alto contraste — preto-editorial, branco, marfim —
com cantos retos e muito espaço vazio, para que **a fotografia carregue toda a
emoção**. Regra de ouro: **a UI é a moldura escura da galeria de arte, a foto é a
obra**.

- Contraste alto e poucos elementos por tela; nada de ornamento
- Espaço vazio generoso é inegociável — comprimir o respiro rebaixa a marca
- Nenhuma sombra decorativa: profundidade vem do contraste entre superfícies

---

## 2. Cores

Filosofia: **monocromático primeiro**. Preto sobre branco, branco sobre
preto-editorial. Existe **um único acento cromático** (`#136F99`, azul-petróleo)
e ele só tem valor porque é **raro** — usar em pouquíssimos lugares.

### Superfícies

| Token | Hex | Uso |
|---|---|---|
| `canvas` | `#FFFFFF` | Fundo padrão das telas claras (formulários, listas, host) |
| `ivory` | `#F2F0EA` | Superfície secundária: cards de destaque, banners, áreas de apoio |
| `editorial` | `#121212` | O "shell" escuro: câmera, visualização de foto, galeria em foco, revelação |
| `overlay` | `rgba(0,0,0,0.55)` | Scrims sobre fotos, fundos de modal/drawer |

### Texto e traços

| Token | Valor | Uso |
|---|---|---|
| `ink` | `#000000` | Títulos, corpo, ícones e bordas sobre superfícies claras |
| `ink-muted` | `rgba(18,18,18,0.75)` | Texto secundário, metadados, preços sobre claro |
| `border` | `rgba(0,0,0,0.5)` | Bordas de inputs, divisores fortes, contorno de botões |
| `border-subtle` | `rgba(0,0,0,0.08)` | Divisores sutis, separação de linhas de lista |
| `editorial-text` | `#FFFFFF` | Texto/ícones sobre o shell escuro |
| `editorial-text-muted` | `rgba(255,255,255,0.75)` | Texto secundário sobre escuro |
| `editorial-border` | `rgba(255,255,255,0.5)` | Bordas e divisores sobre escuro |

### Acento (usar com extrema parcimônia)

| Token | Hex | Uso |
|---|---|---|
| `accent` | `#136F99` | **Só** em: anel da última pose do obturador, foco de acessibilidade, e no máximo um marcador crítico por fluxo. Nunca em fundos grandes, nunca como cor de botão padrão |

### Feedback (extensão necessária do app — a referência não define)

| Token | Hex | Uso |
|---|---|---|
| `success` | `#3D5A3D` | Confirmações (verde profundo, dessaturado) |
| `error` | `#8C3B2E` | Erros (vinho-terracota) — texto/borda, nunca fundo cheio |
| `warning` | `#8A6D1F` | Avisos (ocre escuro) |

### Mapa de superfícies por contexto

| Contexto | Fundo | Texto |
|---|---|---|
| Telas de fluxo (login, criar evento, formulários) | `canvas` | `ink` / `ink-muted` |
| Cards e áreas de destaque | `ivory` | `ink-muted` |
| Câmera, foto em tela cheia, revelação, galeria em foco | `editorial` | `editorial-text` / `-muted` |
| Modais e drawers | `overlay` por trás, conteúdo em `canvas` | `ink` |

---

## 3. Tipografia

Par da referência: **serifa para o corpo e a UI, grotesca leve para títulos** —
a inversão do óbvio é o que dá o tom editorial.

| Papel | Fonte | Uso |
|---|---|---|
| **Corpo & UI (serifa)** | **Cormorant** (Google Fonts) | Corpo de texto, botões, labels, captions, metadados |
| **Títulos (grotesca leve)** | **Archivo** Light/Regular (Google Fonts) — substituta gratuita da *Akzidenz-Grotesk Prolight* da referência (comercial; usar a original se houver licença) | Títulos de tela, nome do evento, números grandes |

⚠️ **Nunca misturar os papéis**: título em Cormorant ou corpo em Archivo colapsa a
hierarquia. A distinção serifa/grotesca é estrutural, não decorativa.

### Escala

| Token | Fonte/peso | Tamanho/linha | Uso |
|---|---|---|---|
| `display` | Archivo 300 | 32/38, tracking +0.5 | Nome do evento, tela de revelação |
| `title` | Archivo 300 | 24/30, tracking +0.5 | Título de tela |
| `heading` | Archivo 400 | 18/24, tracking +1, **caixa alta** | Seções, rótulos editoriais ("SUAS POSES") |
| `body` | Cormorant 500 | 17/24 | Texto padrão |
| `label` | Cormorant 500 | 16/16 | Botões (texto de botão é Cormorant 500, como na referência) |
| `caption` | Cormorant 400 | 12/14.5 | Metadados ("por Ana, 21:03"), contador de poses |

Notas de legibilidade mobile:
- Cormorant é delicada em tamanhos pequenos — **mínimo 12**, preferir peso 500 abaixo de 16
- Contador de poses ("3/10") em Archivo 400 com `fontVariant: ['tabular-nums']` (números estáveis)

Pacotes: `@expo-google-fonts/cormorant` e `@expo-google-fonts/archivo`.

---

## 4. Espaço, forma e profundidade

- **Grade de 4pt**: espaçamentos `4, 8, 12, 16, 20, 24, 32, 48, 64`. Padding lateral padrão de tela: `24` (o "gutter" que nunca deixa conteúdo encostar na borda — inegociável em qualquer viewport).
- **Cantos retos são a assinatura**: raio **`0`** em botões, cards, inputs e **fotos**. Exceções funcionais apenas: `4` para arredondamento mínimo raríssimo, `999`/círculo **só** para controles circulares (obturador, miniaturas de filtro, dots de paginação) e `pill` (raio alto) só para badges/chips pequenos (ex.: chip do contador de poses).
- **Profundidade plana**: `box-shadow: none` por padrão. Feedback de interação vem de borda, sublinhado ou opacidade — nunca de sombra decorativa.
- **Fotos**: cantos retos, sem moldura; sobre `canvas`, borda `1px border-subtle` para foto clara não "vazar".
- Ritmo vertical generoso entre blocos (gap `32`–`48`) — seções respiram, não empilham.

---

## 5. Componentes base

### Botões (todos com raio `0`)
| Variante | Estilo | Uso |
|---|---|---|
| Primário | fundo transparente, **borda 2px `ink`**, texto `ink` (Cormorant 500 16) — sobre escuro: borda/texto `editorial-text` | 1 por tela, ação principal |
| Destaque (raro) | fundo `editorial`, texto `editorial-text` | Só para o momento máximo do fluxo (ex.: "Revelar agora") |
| Texto | transparente, texto `ink`; pressed = sublinhado (borda inferior 1px) | ações de apoio, links |
| Destrutivo | transparente, borda 1px `error`, texto `error` (nunca fundo vermelho cheio) | apagar foto |

Estados: pressed = opacidade 0.85 + leve translação vertical (1px); disabled = borda/texto `border` (50%); foco de acessibilidade = outline `accent`.

### Inputs
Fundo `canvas`, borda `1px border`, raio `0`, altura 52, label acima em `caption`/`ink-muted` **em caixa alta com tracking**.
Foco: borda `ink` (2px). Erro: borda `error` + mensagem `caption`/`error` abaixo
(o backend devolve `errors` por campo — usar direto).

### Ícones
**Lucide** (stroke 1.5) — traço fino, coerente com a leveza editorial. Tamanho padrão 22.

### Cards
Fundo `canvas` ou `ivory`, raio `0`, **sem sombra**; separação por espaço e, quando preciso, borda `1px border-subtle`. Grade editorial, não "tiles" de app.

---

## 6. As telas-assinatura

### Câmera (o coração do app)
- Shell `editorial`; preview em **cantos retos**, full-bleed quando possível — a foto domina, a UI recua
- **Contador de poses** no topo: "7 de 10" em `caption`/`editorial-text` (números em Archivo tabular) — sempre visível, é a mecânica do produto
- Barra de filtros: carrossel horizontal de miniaturas **circulares** com nome embaixo (`caption`); filtro ativo com **anel `1px editorial-text`** (branco — seleção monocromática, como na referência)
- Obturador: círculo 76px, anel branco fino, centro `canvas`; **quando restar 1 pose, o anel vira `accent`** — o único momento cromático da câmera (raridade = significado)
- Ao zerar as poses: obturador desabilitado (anel `editorial-border`) + mensagem serena ("Suas fotos estão guardadas até a revelação ✨") — **nunca** deixar fotografar para receber erro

### Fotos trancadas (estado pré-revelação)
O símbolo do produto. Toda foto, antes do reveal, aparece **trancada**:
- **Miniatura borrada** (fotos do próprio convidado — o app gera o blur localmente na captura; blur forte, cores apenas sugeridas, nada reconhecível) ou **placeholder** com textura `ivory` sutil (fotos dos outros, das quais não existe imagem)
- **Cadeado** (Lucide `lock`, stroke 1.5) centralizado em `editorial-text` sobre um scrim `overlay`; cantos retos como qualquer foto
- Ao tocar: micro-shake do cadeado + haptic leve + tooltip "Revela em 3 dias 🎞️" — a recusa também é experiência
- A "tira de filme" do convidado (suas poses gastas) usa esse estado na parte inferior da câmera

### Revelação (o clímax)
- É cerimônia, não navegação: tela cheia, fundo `editorial`, nome do evento em `display`/`editorial-text`
- Antes do reveal: contagem regressiva + "47 fotos aguardando" — expectativa
- No reveal, as fotos trancadas **destrancam**: o blur dissolve e o cadeado some (é a metáfora visual do produto acontecendo)
- Depois: grade da galeria (2 colunas, gap 12, cantos retos), tocar = foto cheia + botão "Salvar na galeria"

### Filtros (nomear como filmes)
Os filtros são identidade visual: nomes de filme, não de efeito. Sugestão de
lançamento: `Original` · `Nupcial` (soft/bright) · `Ouro` (warm gold) · `Sépia` ·
`P&B Clássico` (protagonista natural nesta identidade monocromática) · `Vintage 94`
(grain + fade). A curva exata de cada um é trabalho de design/engenharia no Skia —
os nomes e a intenção ficam definidos aqui.

---

## 7. Movimento

- Durações: `fast 150–300ms` (pressed, toggles, feedback imediato) · `moderate 500–700ms` (transições estéticas, navegação, sheets) · `slow 600ms+` reservado à revelação
- Easing padrão: `easeOutCubic`. Nada de bounce/spring — o registro é contido e preciso
- Feedback tátil discreto: sublinhado que surge, opacidade, translação de 1px — nunca sombras animadas chamativas
- Haptics (leve) em: tirar foto, gastar a última pose, momento do reveal

---

## 8. Acessibilidade

- Sobre `canvas`/`ivory`: usar `ink` ou `ink-muted` (ambos ≥ 4.5:1). `border` (50%) nunca para texto
- Sobre `editorial`: `editorial-text` para conteúdo; `editorial-text-muted` só para secundário
- `accent #136F99` sobre branco ≈ 4.8:1 — passa para texto normal, mas o uso previsto é traço/anel, não texto corrido
- Alvos de toque ≥ 44pt; obturador e filtros bem acima disso
- Suportar Dynamic Type/font scaling do sistema no corpo de texto (atenção redobrada: Cormorant pequena degrada rápido — respeitar o mínimo de 12)

---

## 9. Tokens prontos para o código

```ts
// theme.ts
export const colors = {
  canvas: '#FFFFFF',
  ivory: '#F2F0EA',
  editorial: '#121212',
  overlay: 'rgba(0,0,0,0.55)',
  ink: '#000000',
  inkMuted: 'rgba(18,18,18,0.75)',
  border: 'rgba(0,0,0,0.5)',
  borderSubtle: 'rgba(0,0,0,0.08)',
  editorialText: '#FFFFFF',
  editorialTextMuted: 'rgba(255,255,255,0.75)',
  editorialBorder: 'rgba(255,255,255,0.5)',
  accent: '#136F99',
  success: '#3D5A3D',
  error: '#8C3B2E',
  warning: '#8A6D1F',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;

// Cantos retos são a assinatura — 'minor' e 'pill'/'circle' são exceções funcionais
export const radius = { none: 0, minor: 4, pill: 64, circle: 999 } as const;

export const type = {
  display: { fontFamily: 'Archivo_300Light',    fontSize: 32, lineHeight: 38, letterSpacing: 0.5 },
  title:   { fontFamily: 'Archivo_300Light',    fontSize: 24, lineHeight: 30, letterSpacing: 0.5 },
  heading: { fontFamily: 'Archivo_400Regular',  fontSize: 18, lineHeight: 24, letterSpacing: 1, textTransform: 'uppercase' },
  body:    { fontFamily: 'Cormorant_500Medium', fontSize: 17, lineHeight: 24 },
  label:   { fontFamily: 'Cormorant_500Medium', fontSize: 16, lineHeight: 16 },
  caption: { fontFamily: 'Cormorant_400Regular', fontSize: 12, lineHeight: 14.5 },
} as const;
```

Pacotes de fonte: `@expo-google-fonts/cormorant` e `@expo-google-fonts/archivo`.

---

## 10. Faça / Não faça

**Faça**
- Cantos retos em botões, cards, inputs e fotos — sempre
- Círculo apenas em controles (obturador, miniaturas de filtro, dots)
- Espaço vazio generoso entre blocos; gutter lateral de 24 em toda tela
- Feedback de interação por borda/sublinhado/opacidade
- Deixar a fotografia dominar: shell escuro nos contextos de imagem

**Não faça**
- Não usar o `accent` em mais de um elemento por fluxo — a raridade é o valor
- Não introduzir sombras decorativas ou profundidade sem função
- Não arredondar cantos "só para suavizar" — quebra a linguagem
- Não usar Cormorant em títulos nem Archivo em corpo — os papéis são fixos
- Não preencher botões com cor sólida fora da variante Destaque
- Não comprimir o espaço vazio para caber mais conteúdo — corte conteúdo, não respiro
