# Efeito assinatura — "Polaroid": impressão na captura + química na revelação

> Origem: prompt de design fornecido pelo usuário (2026-07-15), adaptado para respeitar o
> pilar nº 3 do brief (surpresa: ninguém vê foto nítida antes do reveal). Decisão AD-009.
> **Regra de ouro**: a animação da captura TERMINA NO BORRADO; a nitidez só existe na
> tela de Revelação, depois do reveal do evento.

## Conceito

Ao fotografar, o telefone "vira" uma câmera instantânea que **imprime** a fotografia. A
impressão sai um filme que **não termina de revelar** — a química para no borrado
irreconhecível (a foto trancada do produto). Na festa, quando o álbum é revelado (Etapa 9),
a química **completa**: o borrado dissolve até a foto nítida. O efeito mais forte do prompt
vira o clímax do produto, no momento em que a surpresa deve acontecer.

Nada deve parecer animação de UI comum: movimento tátil, realista, cinematográfico —
mas contido (DS §7: sem bounce exagerado, sem cartoon; easing suave, Apple-level).

## Sequência da captura (Etapa 8 — junto das "fotos trancadas")

1. **Clique** — flash/piscada do visor (já existe desde a Etapa 6), frame congelado
   ~100–200ms, som suave de obturador, haptic leve. Nunca mostrar a imagem final.
2. **Impressão** — a Polaroid emerge de baixo do telefone, vertical, velocidade constante
   com ease-out no final, 0.9–1.2s. Proporções realistas: borda branca grossa, borda
   inferior maior, textura sutil de papel, sombra suave, rotação de 1–2° no máximo.
   Ao terminar: haptic mínimo + assentamento natural com bounce muito pequeno.
3. **Filme virgem** — área da imagem **branca pura** (não transparente, não fade, não
   blur). Segurar 400–600ms. A pausa é a antecipação.
4. **Química (parcial)** — revelação orgânica ~3s, NUNCA fade linear: regiões revelam em
   velocidades diferentes (manchas nubladas se espalhando — ruído Perlin/Simplex de baixa
   frequência dirigindo a máscara), brilho flutuando sutilmente, granulação de filme leve,
   pequenas imperfeições. Sombras → médios → altas-luzes... **e PARA no estado borrado
   irreconhecível** (cores/formas sugeridas, nada identificável). Legenda possível na
   borda inferior: "guardada para a revelação 🎞️".
5. **Interação** — a Polaroid pode ser arrastada/girada levemente/dispensada, com física
   sutil (inércia leve, sem overshoot). Depois, a foto vira mais uma trancada na tira de
   filme (spec da Etapa 8).

## Sequência da revelação (Etapa 9)

As fotos trancadas completam a química: do borrado, contraste sobe, saturação constrói,
detalhes afiam, pretos aprofundam — até nítida, ~3s, orgânica (mesma máscara de ruído).
A transição para a imagem final deve ser quase imperceptível. Haptic no momento do reveal
(DS §7). É a metáfora visual do produto acontecendo (DS §6).

## Mapa técnico (o que exige o quê)

| Peça | Ferramenta | Entra em |
|---|---|---|
| Máscara de ruído Perlin/Simplex, granulação, textura de papel, blur animado | `@shopify/react-native-skia` | Rebuild da Etapa 7 (Skia já é dependência dos filtros) |
| Haptics (clique, fim da impressão, reveal) | `expo-haptics` | Mesmo rebuild da Etapa 7 |
| Som de obturador | `expo-audio` | Mesmo rebuild da Etapa 7 (avaliar se vale o módulo só para isso) |
| Arrastar/girar/pinçar com física | `react-native-gesture-handler` + `react-native-reanimated` | Mesmo rebuild da Etapa 7 (avaliar custo/benefício na spec da Etapa 8) |
| Movimento da impressão, pausas, assentamento | `Animated` (RN core) | Já disponível |
| 60fps constantes | GPU (Skia/native driver) | — |

**Implicação prática**: a spec da Etapa 7 deve decidir a lista definitiva de módulos
nativos do rebuild ÚNICO no Mac (Skia obrigatório; haptics recomendado; audio e
gesture-handler/reanimated a decidir), para não rebuildar de novo na Etapa 8.

## O que NÃO fazer

- Nunca revelar a foto nítida na captura (nem congelar o frame nítido por mais que um
  instante — o freeze do passo 1 deve usar o frame borrado ou a piscada preta)
- Nada de fade linear/uniforme na química
- Nada de filtro "fake Instagram", ruído pesado, spring/cartoon, overshoot
- Não substituir a piscada atual antes do efeito completo existir — ela é o fallback
