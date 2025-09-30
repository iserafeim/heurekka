import React from 'react';
import { render, screen, waitFor } from '@/test/utils/test-utils';
import { SuccessAnimation, LoadingAnimation } from '../SuccessAnimation';

describe('SuccessAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic Rendering', () => {
    it('should render with default title', () => {
      render(<SuccessAnimation />);
      expect(screen.getByText('¡Perfil Creado!')).toBeInTheDocument();
    });

    it('should render with default message', () => {
      render(<SuccessAnimation />);
      expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
    });

    it('should render with custom title', () => {
      render(<SuccessAnimation title="¡Éxito!" />);
      expect(screen.getByText('¡Éxito!')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<SuccessAnimation message="Tu cuenta ha sido creada" />);
      expect(screen.getByText('Tu cuenta ha sido creada')).toBeInTheDocument();
    });

    it('should render checkmark icon', () => {
      const { container } = render(<SuccessAnimation />);
      const checkIcon = container.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should start invisible and become visible', async () => {
      const { container } = render(<SuccessAnimation />);

      // Initially should have scale-0 opacity-0
      const circle = container.querySelector('.bg-green-500');
      expect(circle).toHaveClass('scale-0', 'opacity-0');

      // After animation triggers
      jest.advanceTimersByTime(150);

      await waitFor(() => {
        expect(circle).toHaveClass('scale-100', 'opacity-100');
      });
    });

    it('should animate checkmark with delay', async () => {
      const { container } = render(<SuccessAnimation />);

      const checkmark = container.querySelector('.text-white');
      expect(checkmark).toHaveClass('scale-0', 'opacity-0');

      jest.advanceTimersByTime(450); // 100ms mount + 300ms delay + 50ms buffer

      await waitFor(() => {
        expect(checkmark).toHaveClass('scale-100', 'opacity-100');
      });
    });

    it('should have pinging background animation', () => {
      const { container } = render(<SuccessAnimation />);
      const pingElement = container.querySelector('.animate-ping');
      expect(pingElement).toBeInTheDocument();
    });
  });

  describe('Auto-close Functionality', () => {
    it('should call onComplete after default delay', async () => {
      const mockOnComplete = jest.fn();
      render(<SuccessAnimation onComplete={mockOnComplete} />);

      expect(mockOnComplete).not.toHaveBeenCalled();

      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should call onComplete after custom delay', async () => {
      const mockOnComplete = jest.fn();
      render(<SuccessAnimation onComplete={mockOnComplete} autoCloseDelay={3000} />);

      jest.advanceTimersByTime(2000);
      expect(mockOnComplete).not.toHaveBeenCalled();

      jest.advanceTimersByTime(1000);

      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalledTimes(1);
      });
    });

    it('should not auto-close when autoCloseDelay is 0', async () => {
      const mockOnComplete = jest.fn();
      render(<SuccessAnimation onComplete={mockOnComplete} autoCloseDelay={0} />);

      jest.advanceTimersByTime(5000);

      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should not call onComplete if onComplete is not provided', () => {
      render(<SuccessAnimation autoCloseDelay={1000} />);

      jest.advanceTimersByTime(1000);

      // Should not throw error
      expect(screen.getByText('¡Perfil Creado!')).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should render progress bar when autoCloseDelay > 0', () => {
      const { container } = render(<SuccessAnimation autoCloseDelay={2000} />);
      const progressBar = container.querySelector('.bg-neutral-200');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not render progress bar when autoCloseDelay is 0', () => {
      const { container } = render(<SuccessAnimation autoCloseDelay={0} />);
      const progressBar = container.querySelector('.bg-neutral-200');
      expect(progressBar).not.toBeInTheDocument();
    });

    it('should animate progress bar width', async () => {
      const { container } = render(<SuccessAnimation autoCloseDelay={2000} />);

      jest.advanceTimersByTime(150); // Wait for visibility

      await waitFor(() => {
        const progressFill = container.querySelector('.bg-primary');
        expect(progressFill).toHaveStyle({ width: '100%' });
      });
    });

    it('should have correct transition duration matching autoCloseDelay', () => {
      const { container } = render(<SuccessAnimation autoCloseDelay={3000} />);

      const progressFill = container.querySelector('.bg-primary');
      expect(progressFill).toHaveStyle({ transitionDuration: '3000ms' });
    });
  });

  describe('Spanish Language', () => {
    it('should display Spanish text by default', () => {
      render(<SuccessAnimation />);
      expect(screen.getByText('¡Perfil Creado!')).toBeInTheDocument();
      expect(screen.getByText('Redirigiendo...')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should center content', () => {
      const { container } = render(<SuccessAnimation />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should have green success color', () => {
      const { container } = render(<SuccessAnimation />);
      const circle = container.querySelector('.bg-green-500');
      expect(circle).toBeInTheDocument();
    });

    it('should have correct text styling', () => {
      render(<SuccessAnimation />);
      const title = screen.getByText('¡Perfil Creado!');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-neutral-900');
    });
  });
});

describe('LoadingAnimation', () => {
  describe('Basic Rendering', () => {
    it('should render with default message', () => {
      render(<LoadingAnimation />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });

    it('should render with custom message', () => {
      render(<LoadingAnimation message="Procesando..." />);
      expect(screen.getByText('Procesando...')).toBeInTheDocument();
    });

    it('should render spinner', () => {
      const { container } = render(<LoadingAnimation />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Animation', () => {
    it('should have spinning animation', () => {
      const { container } = render(<LoadingAnimation />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('animate-spin');
    });

    it('should have pulsing text animation', () => {
      render(<LoadingAnimation />);
      const message = screen.getByText('Cargando...');
      expect(message).toHaveClass('animate-pulse');
    });
  });

  describe('Styling', () => {
    it('should center content', () => {
      const { container } = render(<LoadingAnimation />);
      const wrapper = container.firstChild;
      expect(wrapper).toHaveClass('flex', 'flex-col', 'items-center', 'justify-center');
    });

    it('should have correct spinner styling', () => {
      const { container } = render(<LoadingAnimation />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toHaveClass('w-16', 'h-16', 'border-4', 'rounded-full');
      expect(spinner).toHaveClass('border-neutral-200', 'border-t-primary');
    });
  });

  describe('Spanish Language', () => {
    it('should display Spanish text by default', () => {
      render(<LoadingAnimation />);
      expect(screen.getByText('Cargando...')).toBeInTheDocument();
    });
  });
});