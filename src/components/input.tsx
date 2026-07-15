import { useState } from 'react';
import { Text as RNText, StyleSheet, TextInput, TextInputProps, View } from 'react-native';

import { colors, radius, spacing, type } from '@/theme/theme';

export interface InputProps extends TextInputProps {
  /** Label acima do campo, em caption/inkMuted, caixa alta com tracking (§5). */
  label?: string;
  /** Mensagem de erro: borda vira error e a mensagem aparece abaixo em caption/error. */
  error?: string;
}

export function Input({ label, error, onFocus, onBlur, style, ...rest }: InputProps) {
  const [focused, setFocused] = useState(false);

  const borderStyle = {
    borderColor: error ? colors.error : focused ? colors.ink : colors.border,
    borderWidth: focused ? 2 : 1,
  };

  return (
    <View>
      {label ? <RNText style={styles.label}>{label}</RNText> : null}
      <TextInput
        {...rest}
        style={[styles.field, borderStyle, style]}
        placeholderTextColor={colors.inkMuted}
        onFocus={(event) => {
          setFocused(true);
          onFocus?.(event);
        }}
        onBlur={(event) => {
          setFocused(false);
          onBlur?.(event);
        }}
      />
      {error ? (
        <RNText testID="input-error" style={styles.error}>
          {error}
        </RNText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...type.caption,
    color: colors.inkMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.sm,
  },
  field: {
    ...type.body,
    color: colors.ink,
    height: 52,
    backgroundColor: colors.canvas,
    borderRadius: radius.none,
    paddingHorizontal: spacing.lg,
  },
  error: {
    ...type.caption,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
