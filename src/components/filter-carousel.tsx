import { Canvas, ColorMatrix, Image as SkiaImage, useImage } from '@shopify/react-native-skia';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { FILTERS, type CameraFilter } from '@/camera/filters';
import { Text } from '@/components/text';
import { colors, radius, spacing } from '@/theme/theme';

const THUMB_SIZE = 52;

export interface FilterCarouselProps {
  selectedKey: string;
  onSelect: (filter: CameraFilter) => void;
  /** Poses zeradas: carrossel desabilita junto do obturador (FILT-04 AC4). */
  disabled?: boolean;
}

/**
 * Carrossel de filtros da câmera (DS §6): miniaturas circulares com a matriz
 * aplicada numa amostra neutra, nome embaixo em caption, anel 1px
 * editorial-text no ativo. Círculo é exceção funcional do DS (controles).
 */
export function FilterCarousel({ selectedKey, onSelect, disabled = false }: FilterCarouselProps) {
  const sample = useImage(require('../../assets/images/filter-sample.jpg'));

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {FILTERS.map((filter) => {
        const active = filter.key === selectedKey;
        return (
          <Pressable
            key={filter.key}
            testID={`filter-${filter.key}`}
            accessibilityRole="button"
            accessibilityLabel={`Filtro ${filter.name}`}
            accessibilityState={{ selected: active, disabled }}
            disabled={disabled}
            onPress={() => onSelect(filter)}
            style={[styles.item, disabled && styles.itemDisabled]}
          >
            <View style={[styles.ring, active && styles.ringActive]}>
              <Canvas style={styles.thumb}>
                {sample ? (
                  <SkiaImage
                    image={sample}
                    fit="cover"
                    x={0}
                    y={0}
                    width={THUMB_SIZE}
                    height={THUMB_SIZE}
                  >
                    <ColorMatrix matrix={filter.matrix} />
                  </SkiaImage>
                ) : null}
              </Canvas>
            </View>
            <Text
              variant="caption"
              numberOfLines={1}
              style={[styles.name, active && styles.nameActive]}
            >
              {filter.name}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: spacing.lg,
    paddingHorizontal: spacing.xxl,
    alignItems: 'flex-start',
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
    width: THUMB_SIZE + spacing.lg, // área de toque confortável (≥44pt)
  },
  itemDisabled: {
    opacity: 0.4,
  },
  // Anel do ativo: 1px editorial-text (DS §6); gap para o anel "respirar"
  ring: {
    width: THUMB_SIZE + 8,
    height: THUMB_SIZE + 8,
    borderRadius: radius.circle,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringActive: {
    borderColor: colors.editorialText,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: radius.circle,
    overflow: 'hidden',
  },
  name: {
    color: colors.editorialTextMuted,
  },
  nameActive: {
    color: colors.editorialText,
  },
});
