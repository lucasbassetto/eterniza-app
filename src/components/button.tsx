import { Pressable, PressableProps, Text as RNText, StyleSheet } from 'react-native';

import { colors, radius, spacing, type } from '@/theme/theme';

export type ButtonVariant = 'primary' | 'highlight' | 'text' | 'destructive';

export interface ButtonProps extends Omit<PressableProps, 'children' | 'style'> {
  title: string;
  /** Variante do design system (§5). Default: primary (outline). */
  variant?: ButtonVariant;
  /** Contexto escuro (shell editorial): borda/texto viram editorialText. */
  onDark?: boolean;
}

export function Button({ title, variant = 'primary', onDark = false, disabled, ...rest }: ButtonProps) {
  const inkColor = onDark ? colors.editorialText : colors.ink;

  const textColor = disabled
    ? colors.border
    : variant === 'destructive'
      ? colors.error
      : variant === 'highlight'
        ? colors.editorialText
        : inkColor;

  const variantStyle = {
    primary: { borderWidth: 2, borderColor: disabled ? colors.border : inkColor },
    highlight: { backgroundColor: colors.editorial },
    text: {},
    destructive: { borderWidth: 1, borderColor: disabled ? colors.border : colors.error },
  }[variant];

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [styles.base, variantStyle, pressed && styles.pressed]}
      {...rest}
    >
      {({ pressed }) => (
        <RNText
          style={[
            type.label,
            { color: textColor },
            variant === 'text' &&
              pressed && { borderBottomWidth: 1, borderBottomColor: textColor },
          ]}
        >
          {title}
        </RNText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.none,
    backgroundColor: 'transparent',
    alignSelf: 'stretch',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ translateY: 1 }],
  },
});
