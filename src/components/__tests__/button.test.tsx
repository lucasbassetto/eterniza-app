/**
 * COMP-02 — Button com as 4 variantes do DESIGN_SYSTEM.md §5.
 * Valores esperados transcritos do §5/§9: outline 2px ink, destaque fundo
 * editorial (#121212), destrutivo borda 1px error (#8C3B2E), raio 0, sem
 * sombra, pressed 0.85 + 1px, disabled = border (rgba(0,0,0,0.5)).
 */
import { fireEvent, render, screen } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { Button } from '../button';
import { type } from '@/theme/theme';

describe('Button (COMP-02)', () => {
  it('primary: fundo transparente, borda 2px ink, texto ink em type.label (AC1)', async () => {
    await render(<Button title="Entrar" />);
    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderColor: '#000000',
    });
    expect(screen.getByText('Entrar')).toHaveStyle({ ...type.label, color: '#000000' });
  });

  it('primary onDark: borda/texto editorialText (AC1)', async () => {
    await render(<Button title="Entrar" onDark />);
    expect(screen.getByRole('button')).toHaveStyle({ borderColor: '#FFFFFF' });
    expect(screen.getByText('Entrar')).toHaveStyle({ color: '#FFFFFF' });
  });

  it('highlight: fundo editorial, texto editorialText (AC2)', async () => {
    await render(<Button title="Revelar agora" variant="highlight" />);
    expect(screen.getByRole('button')).toHaveStyle({ backgroundColor: '#121212' });
    expect(screen.getByText('Revelar agora')).toHaveStyle({ color: '#FFFFFF' });
  });

  it('text: transparente e sem borda (AC3)', async () => {
    await render(<Button title="Cancelar" variant="text" />);
    const button = screen.getByRole('button');
    expect(StyleSheet.flatten(button.props.style).borderWidth).toBeUndefined();
    expect(button).toHaveStyle({ backgroundColor: 'transparent' });
  });

  it('text pressed: exibe sublinhado 1px (AC3)', async () => {
    // testOnly_pressed é o mecanismo do RN para forçar o estado pressed em teste
    await render(<Button title="Cancelar" variant="text" testOnly_pressed />);
    expect(screen.getByText('Cancelar')).toHaveStyle({
      borderBottomWidth: 1,
      borderBottomColor: '#000000',
    });
  });

  it('destructive: transparente, borda 1px error, texto error — nunca fundo vermelho (AC4)', async () => {
    await render(<Button title="Apagar foto" variant="destructive" />);
    expect(screen.getByRole('button')).toHaveStyle({
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: '#8C3B2E',
    });
    expect(screen.getByText('Apagar foto')).toHaveStyle({ color: '#8C3B2E' });
  });

  it.each(['primary', 'highlight', 'text', 'destructive'] as const)(
    '%s: raio 0 e sem sombra/elevation (AC5)',
    async (variant) => {
      await render(<Button title="Ação" variant={variant} />);
      const flat = StyleSheet.flatten(screen.getByRole('button').props.style);
      expect(flat.borderRadius).toBe(0);
      expect(flat.elevation).toBeUndefined();
      expect(flat.shadowOpacity).toBeUndefined();
      expect(flat.shadowRadius).toBeUndefined();
    },
  );

  it('pressed: opacidade 0.85 + translação vertical 1px (AC6)', async () => {
    await render(<Button title="Entrar" testOnly_pressed />);
    expect(screen.getByRole('button')).toHaveStyle({
      opacity: 0.85,
      transform: [{ translateY: 1 }],
    });
  });

  it('disabled: borda/texto usam colors.border e onPress não dispara (AC7 + edge case)', async () => {
    const onPress = jest.fn();
    await render(<Button title="Entrar" disabled onPress={onPress} />);
    const button = screen.getByRole('button');
    expect(button).toHaveStyle({ borderColor: 'rgba(0,0,0,0.5)' });
    expect(screen.getByText('Entrar')).toHaveStyle({ color: 'rgba(0,0,0,0.5)' });

    await fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('área de toque com altura mínima 44 (AC8)', async () => {
    await render(<Button title="Entrar" />);
    expect(screen.getByRole('button')).toHaveStyle({ minHeight: 44 });
  });

  it('onPress dispara quando habilitado', async () => {
    const onPress = jest.fn();
    await render(<Button title="Entrar" onPress={onPress} />);
    await fireEvent.press(screen.getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
