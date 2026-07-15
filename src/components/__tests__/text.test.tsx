/**
 * COMP-01 — Text com as variantes tipográficas do design system.
 * Tokens de `type` já são verificados 1:1 contra o DESIGN_SYSTEM.md §9
 * em src/theme/__tests__/theme.test.ts; aqui asserta-se que o componente
 * aplica o token certo e a cor certa por contexto.
 */
import { render, screen } from '@testing-library/react-native';

import { Text } from '../text';
import { type } from '@/theme/theme';

const VARIANTS = ['display', 'title', 'heading', 'body', 'label', 'caption'] as const;

describe('Text (COMP-01)', () => {
  it.each(VARIANTS)('variant="%s" aplica exatamente o token type.%s', async (variant) => {
    await render(<Text variant={variant}>amostra</Text>);
    expect(screen.getByText('amostra')).toHaveStyle(type[variant]);
  });

  it('sem variant usa body (AC2)', async () => {
    await render(<Text>padrão</Text>);
    expect(screen.getByText('padrão')).toHaveStyle(type.body);
  });

  it('cor default é ink sobre claro (AC3)', async () => {
    await render(<Text>claro</Text>);
    expect(screen.getByText('claro')).toHaveStyle({ color: '#000000' });
  });

  it('onDark usa editorialText (AC3)', async () => {
    await render(<Text onDark>escuro</Text>);
    expect(screen.getByText('escuro')).toHaveStyle({ color: '#FFFFFF' });
  });

  it('heading renderiza em caixa alta via token (AC1)', async () => {
    await render(<Text variant="heading">Suas Poses</Text>);
    expect(screen.getByText('Suas Poses')).toHaveStyle({ textTransform: 'uppercase' });
  });
});
