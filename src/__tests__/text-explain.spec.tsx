import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import TextExplain from '@/components/common/TextExplain/TextExplain';

describe('text-explain.tsx', () => {
  it('renders', () => {
    const { container, getByText } = render(<TextExplain title="Testing" />);
    expect(container).toMatchSnapshot();
  });

  it('renders the provided title prop to the DOM', () => {
    const { getByText } = render(<TextExplain title="Testing" />);
    expect(getByText('Testing')).toBeInTheDocument();
  });

  it('matches snapshot', () => {
    const { container } = render(<TextExplain title="Testing" />);
    expect(container).toMatchSnapshot();
  });
});
