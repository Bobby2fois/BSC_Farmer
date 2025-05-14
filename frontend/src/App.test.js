import { render, screen } from '@testing-library/react';
import App from './App';

test('renders BSC Miner title', () => {
  render(<App />);
  const titleElement = screen.getByText(/BakedPizza BSC Miner/i);
  expect(titleElement).toBeInTheDocument();
});
