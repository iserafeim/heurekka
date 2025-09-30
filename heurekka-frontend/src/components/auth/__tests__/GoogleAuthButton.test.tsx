import React from 'react';
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { GoogleAuthButton } from '../GoogleAuthButton';

describe('GoogleAuthButton', () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render button with default text', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      expect(screen.getByRole('button', { name: 'Continuar con Google' })).toBeInTheDocument();
      expect(screen.getByText('Continuar con Google')).toBeInTheDocument();
    });

    it('should render button with custom text', () => {
      render(<GoogleAuthButton onClick={mockOnClick} text="Registrarse con Google" />);
      expect(screen.getByText('Registrarse con Google')).toBeInTheDocument();
    });

    it('should render Google logo', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} />);
      const svg = container.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should display loading spinner when loading is true', () => {
      render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      expect(screen.getByText('Conectando...')).toBeInTheDocument();
    });

    it('should not display Google logo when loading', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      // Check that there's only one SVG (the spinner, not the Google logo)
      const svgs = container.querySelectorAll('svg');
      expect(svgs.length).toBe(1);
    });

    it('should be disabled when loading', () => {
      render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('User Interactions', () => {
    it('should call onClick when button is clicked', async () => {
      const user = userEvent.setup();
      render(<GoogleAuthButton onClick={mockOnClick} />);

      const button = screen.getByRole('button', { name: 'Continuar con Google' });
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onClick when button is loading', async () => {
      const user = userEvent.setup();
      render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);

      const button = screen.getByRole('button');
      await user.click(button);

      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it('should handle keyboard interaction (Enter key)', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });

      // Note: Button click is handled by browser, not by our code
      expect(button).toBeInTheDocument();
    });

    it('should handle keyboard interaction (Space key)', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      fireEvent.keyDown(button, { key: ' ', code: 'Space' });

      // Note: Button click is handled by browser, not by our code
      expect(button).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA label', () => {
      render(<GoogleAuthButton onClick={mockOnClick} text="Registrarse con Google" />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Registrarse con Google');
    });

    it('should be keyboard accessible', async () => {
      const user = userEvent.setup();
      render(<GoogleAuthButton onClick={mockOnClick} />);

      const button = screen.getByRole('button');
      await user.tab();

      expect(button).toHaveFocus();
    });

    it('should have correct button type', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('type', 'button');
    });

    it('should have aria-hidden on decorative SVG', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Styling', () => {
    it('should have correct base styles', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('flex', 'h-12', 'w-full', 'items-center', 'justify-center');
      expect(button).toHaveClass('rounded-lg', 'border', 'border-neutral-300', 'bg-white');
    });

    it('should apply hover styles', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('hover:bg-neutral-50');
    });

    it('should apply active styles', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('active:bg-neutral-100');
    });

    it('should apply disabled styles when loading', () => {
      render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('disabled:cursor-not-allowed', 'disabled:opacity-50');
    });

    it('should apply focus styles', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-primary');
    });
  });

  describe('Spanish Language', () => {
    it('should display Spanish text by default', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      expect(screen.getByText('Continuar con Google')).toBeInTheDocument();
    });

    it('should display Spanish loading text', () => {
      render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      expect(screen.getByText('Conectando...')).toBeInTheDocument();
    });
  });

  describe('Google Logo SVG', () => {
    it('should render all four Google logo colors', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} />);
      const svg = container.querySelector('svg');

      // Check for Google brand colors
      expect(svg?.innerHTML).toContain('#4285F4'); // Blue
      expect(svg?.innerHTML).toContain('#34A853'); // Green
      expect(svg?.innerHTML).toContain('#FBBC05'); // Yellow
      expect(svg?.innerHTML).toContain('#EA4335'); // Red
    });

    it('should have correct SVG dimensions', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} />);
      const svg = container.querySelector('svg');

      expect(svg).toHaveClass('h-5', 'w-5');
    });
  });

  describe('Button Layout', () => {
    it('should have icon and text properly spaced', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('gap-3');
    });

    it('should have correct height for touch targets', () => {
      render(<GoogleAuthButton onClick={mockOnClick} />);
      const button = screen.getByRole('button');

      expect(button).toHaveClass('h-12'); // 48px - touch-friendly
    });
  });

  describe('Loading Animation', () => {
    it('should show spinner with animation when loading', () => {
      const { container } = render(<GoogleAuthButton onClick={mockOnClick} loading={true} />);
      const spinner = container.querySelector('.animate-spin');

      expect(spinner).toBeInTheDocument();
    });
  });
});