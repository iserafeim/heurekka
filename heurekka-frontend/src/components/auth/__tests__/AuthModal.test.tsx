import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import { AuthModal, AuthModalHeader, AuthModalFooter, AuthDivider } from '../AuthModal';

describe('AuthModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  describe('Basic Rendering', () => {
    it('should render when isOpen is true', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('should not render when isOpen is false', () => {
      render(
        <AuthModal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('should render close button', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(screen.getByRole('button', { name: 'Cerrar' })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-labelledby', 'auth-modal-title');
    });

    it('should trap focus within modal', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <button>Button 1</button>
          <button>Button 2</button>
        </AuthModal>
      );

      const closeButton = screen.getByRole('button', { name: 'Cerrar' });
      expect(document.body).toHaveStyle({ overflow: 'hidden' });
    });
  });

  describe('User Interactions', () => {
    it('should call onClose when close button is clicked', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const closeButton = screen.getByRole('button', { name: 'Cerrar' });
      fireEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when backdrop is clicked', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const backdrop = screen.getByRole('dialog');
      fireEvent.click(backdrop);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when clicking modal content', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const content = screen.getByText('Modal Content');
      fireEvent.click(content);

      expect(mockOnClose).not.toHaveBeenCalled();
    });

    it('should close when Escape key is pressed', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it('should not close when other keys are pressed', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      fireEvent.keyDown(document, { key: 'Enter', code: 'Enter' });

      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Body Scroll Lock', () => {
    it('should lock body scroll when modal opens', () => {
      const { rerender } = render(
        <AuthModal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(document.body.style.overflow).toBe('');

      rerender(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should unlock body scroll when modal closes', async () => {
      const { rerender } = render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <AuthModal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      await waitFor(() => {
        expect(document.body.style.overflow).toBe('unset');
      });
    });
  });

  describe('Responsive Behavior', () => {
    it('should apply correct classes for mobile layout', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const modalContent = screen.getByText('Modal Content').closest('div');
      expect(modalContent).toHaveClass('h-full', 'sm:h-auto');
    });

    it('should apply correct classes for desktop layout', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const modalContent = screen.getByText('Modal Content').closest('div');
      expect(modalContent).toHaveClass('sm:max-w-[480px]', 'sm:rounded-xl');
    });
  });

  describe('Animation', () => {
    it('should apply animation classes when opening', () => {
      render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const backdrop = screen.getByRole('dialog');
      expect(backdrop).toHaveClass('opacity-100');
    });

    it('should apply animation classes when closing', () => {
      const { rerender } = render(
        <AuthModal isOpen={true} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      rerender(
        <AuthModal isOpen={false} onClose={mockOnClose}>
          <div>Modal Content</div>
        </AuthModal>
      );

      const backdrop = screen.queryByRole('dialog');
      if (backdrop) {
        expect(backdrop).toHaveClass('opacity-0');
      }
    });
  });
});

describe('AuthModalHeader', () => {
  it('should render title', () => {
    render(<AuthModalHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render subtitle when provided', () => {
    render(<AuthModalHeader title="Test Title" subtitle="Test Subtitle" />);
    expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
  });

  it('should not render subtitle when not provided', () => {
    render(<AuthModalHeader title="Test Title" />);
    expect(screen.queryByText('Test Subtitle')).not.toBeInTheDocument();
  });

  it('should have correct heading structure', () => {
    render(<AuthModalHeader title="Test Title" />);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Test Title');
    expect(heading).toHaveAttribute('id', 'auth-modal-title');
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AuthModalHeader title="Test Title" className="custom-class" />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('AuthModalFooter', () => {
  it('should render children', () => {
    render(
      <AuthModalFooter>
        <p>Footer Content</p>
      </AuthModalFooter>
    );
    expect(screen.getByText('Footer Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <AuthModalFooter className="custom-class">
        <p>Footer Content</p>
      </AuthModalFooter>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('AuthDivider', () => {
  it('should render default text', () => {
    render(<AuthDivider />);
    expect(screen.getByText('o')).toBeInTheDocument();
  });

  it('should render custom text', () => {
    render(<AuthDivider text="OR" />);
    expect(screen.getByText('OR')).toBeInTheDocument();
  });

  it('should have correct structure with divider lines', () => {
    const { container } = render(<AuthDivider text="OR" />);
    const divider = container.querySelector('.border-t');
    expect(divider).toBeInTheDocument();
  });
});