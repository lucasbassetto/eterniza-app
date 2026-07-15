import { Text as RNText, TextProps as RNTextProps } from 'react-native';

import { colors, type } from '@/theme/theme';

export type TextVariant = keyof typeof type;

export interface TextProps extends RNTextProps {
  /** Variante tipográfica do design system (§3). Default: body. */
  variant?: TextVariant;
  /** Contexto escuro (shell editorial): cor default vira editorialText. */
  onDark?: boolean;
}

export function Text({ variant = 'body', onDark = false, style, ...rest }: TextProps) {
  return (
    <RNText
      {...rest}
      style={[type[variant], { color: onDark ? colors.editorialText : colors.ink }, style]}
    />
  );
}
