/**
 * COMP-03 — Input com a anatomia do DESIGN_SYSTEM.md §5.
 * Valores do §5/§9: label caption/inkMuted caixa alta; campo canvas com
 * borda 1px border, raio 0, altura 52; foco ink 2px; erro #8C3B2E.
 */
import { fireEvent, render, screen } from '@testing-library/react-native';

import { Input } from '../input';
import { type } from '@/theme/theme';

describe('Input (COMP-03)', () => {
  it('label acima em caption/inkMuted, caixa alta com tracking (AC1)', async () => {
    await render(<Input label="Seu nome" placeholder="Digite" />);
    expect(screen.getByText('Seu nome')).toHaveStyle({
      ...type.caption,
      color: 'rgba(18,18,18,0.75)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    });
  });

  it('repouso: fundo canvas, borda 1px border, raio 0, altura 52 (AC2)', async () => {
    await render(<Input placeholder="Digite" />);
    expect(screen.getByPlaceholderText('Digite')).toHaveStyle({
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: 'rgba(0,0,0,0.5)',
      borderRadius: 0,
      height: 52,
    });
  });

  it('focado: borda vira ink 2px (AC3)', async () => {
    await render(<Input placeholder="Digite" />);
    const field = screen.getByPlaceholderText('Digite');
    await fireEvent(field, 'focus');
    expect(field).toHaveStyle({ borderColor: '#000000', borderWidth: 2 });
  });

  it('erro: borda error e mensagem abaixo em caption/error (AC4)', async () => {
    await render(<Input placeholder="Digite" error="Nome do evento é obrigatório" />);
    expect(screen.getByPlaceholderText('Digite')).toHaveStyle({ borderColor: '#8C3B2E' });
    expect(screen.getByText('Nome do evento é obrigatório')).toHaveStyle({
      ...type.caption,
      color: '#8C3B2E',
    });
  });

  it('sem erro: não renderiza texto de erro (AC5)', async () => {
    await render(<Input placeholder="Digite" />);
    expect(screen.queryByTestId('input-error')).toBeNull();
  });

  it('foco seguido de blur sem erro volta à borda 1px border (edge case)', async () => {
    await render(<Input placeholder="Digite" />);
    const field = screen.getByPlaceholderText('Digite');
    await fireEvent(field, 'focus');
    await fireEvent(field, 'blur');
    expect(field).toHaveStyle({ borderColor: 'rgba(0,0,0,0.5)', borderWidth: 1 });
  });
});
