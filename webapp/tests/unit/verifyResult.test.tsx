import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import VerifyResult from '../../src/components/VerifyResult';
import type { VerifyResponseDto } from '../../src/api';

describe('VerifyResult', () => {
  const base: VerifyResponseDto = {
    forged: false,
    similarity: 0.8,
  };

  it('shows check icon when not forged', () => {
    render(<VerifyResult result={base} threshold={0.5} />);
    expect(screen.getByText(/similarity:/i)).toBeTruthy();
    expect(document.querySelector('.anticon-check-circle')).toBeTruthy();
  });

  it('shows cross icon when forged', () => {
    render(
      <VerifyResult result={{ ...base, forged: true }} threshold={0.5} />
    );
    expect(document.querySelector('.anticon-close-circle')).toBeTruthy();
  });
});
