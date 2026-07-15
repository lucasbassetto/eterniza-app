import { ScrollView, StyleSheet, View } from 'react-native';

import { Button } from '@/components/button';
import { Input } from '@/components/input';
import { Screen } from '@/components/screen';
import { Text, TextVariant } from '@/components/text';
import { colors, spacing } from '@/theme/theme';

const TYPE_SAMPLES: { variant: TextVariant; sample: string }[] = [
  { variant: 'display', sample: 'Casamento Ana & João' },
  { variant: 'title', sample: 'Título de tela' },
  { variant: 'heading', sample: 'Suas poses' },
  { variant: 'body', sample: 'Texto padrão do corpo, em Cormorant 500.' },
  { variant: 'label', sample: 'Texto de botão' },
  { variant: 'caption', sample: 'por Ana, 21:03' },
];

export default function ComponentsGallery() {
  return (
    <Screen>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text variant="title">Design System</Text>

        <View style={styles.section}>
          <Text variant="heading">Tipografia</Text>
          {TYPE_SAMPLES.map(({ variant, sample }) => (
            <View key={variant} style={styles.item}>
              <Text variant="caption" style={styles.itemLabel}>
                {variant}
              </Text>
              <Text variant={variant}>{sample}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text variant="heading">Botões</Text>
          <Button title="Primário (outline 2px)" />
          <Button title="Destaque — Revelar agora" variant="highlight" />
          <Button title="Texto (pressione: sublinhado)" variant="text" />
          <Button title="Destrutivo — Apagar foto" variant="destructive" />
          <Button title="Primário desabilitado" disabled />
        </View>

        <View style={styles.section}>
          <Text variant="heading">Inputs</Text>
          <Input label="Seu nome" placeholder="Como você quer aparecer" />
          <Input
            label="E-mail"
            placeholder="voce@exemplo.com"
            error="Nome do evento é obrigatório"
          />
          <Text variant="caption" style={styles.itemLabel}>
            toque num campo para ver o foco (borda ink 2px)
          </Text>
        </View>

        <View style={[styles.section, styles.darkSection]}>
          <Text variant="heading" onDark>
            Contexto escuro
          </Text>
          <Text variant="display" onDark>
            Eterniza
          </Text>
          <Text onDark>Corpo sobre o shell editorial, em Cormorant.</Text>
          <Button title="Primário sobre escuro" onDark />
          <Button title="Texto sobre escuro" variant="text" onDark />
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: spacing.huge,
    gap: spacing.xxxl,
  },
  section: {
    gap: spacing.lg,
  },
  item: {
    gap: spacing.xs,
  },
  itemLabel: {
    color: colors.inkMuted,
  },
  darkSection: {
    backgroundColor: colors.editorial,
    padding: spacing.xxl,
  },
});
