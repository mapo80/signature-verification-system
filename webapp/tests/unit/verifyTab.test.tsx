import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import App from '../../src/App';
import { DefaultService } from '../../src/api';

// Minimal VerifyTab test ensuring temperature param is sent

describe('VerifyTab', () => {
  it('sends temperature in verify request', async () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });

      const spy = vi
        .spyOn(DefaultService, 'verifySignature')
        .mockResolvedValue({ forged: false });

    const { getByRole, getByTestId } = render(<App />);
    await fireEvent.click(getByRole('tab', { name: 'Verifica' }));

    const file = new File([''], 'sample.png', { type: 'image/png' });
    (window as any).__setRefFile(file);
    (window as any).__setCandFile(file);

    const input = getByTestId('temperature-input');
    fireEvent.change(input, { target: { value: '2.5' } });

    await fireEvent.click(getByRole('button', { name: 'Verifica' }));

      expect(spy).toHaveBeenCalled();
      const args = spy.mock.calls[0][0];
      expect(args.temperature).toBeCloseTo(2.5);
    });
  });
