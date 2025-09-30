import React from 'react';
import { render, screen, fireEvent } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { FormInput } from '../FormInput';

describe('FormInput', () => {
  describe('Basic Rendering', () => {
    it('should render label', () => {
      render(<FormInput label="Email" />);
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
    });

    it('should render input field', () => {
      render(<FormInput label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute('type', 'text');
    });

    it('should render with custom placeholder', () => {
      render(<FormInput label="Email" placeholder="tu@email.com" />);
      expect(screen.getByPlaceholderText('tu@email.com')).toBeInTheDocument();
    });

    it('should render as required when required prop is true', () => {
      render(<FormInput label="Email" required />);
      expect(screen.getByText('*')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toHaveAttribute('aria-required', 'true');
    });

    it('should apply custom type attribute', () => {
      render(<FormInput label="Email" type="email" />);
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error prop is provided', () => {
      render(<FormInput label="Email" error="El correo es inválido" />);
      expect(screen.getByText('El correo es inválido')).toBeInTheDocument();
    });

    it('should have error role when error is present', () => {
      render(<FormInput label="Email" error="El correo es inválido" />);
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toBeInTheDocument();
    });

    it('should apply error styling when error is present', () => {
      render(<FormInput label="Email" error="El correo es inválido" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('border-destructive');
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('should display error icon when error is present', () => {
      const { container } = render(<FormInput label="Email" error="El correo es inválido" />);
      const errorIcon = container.querySelector('svg');
      expect(errorIcon).toBeInTheDocument();
    });

    it('should not display helper text when error is present', () => {
      render(
        <FormInput
          label="Email"
          error="El correo es inválido"
          helperText="Formato: tu@email.com"
        />
      );
      expect(screen.queryByText('Formato: tu@email.com')).not.toBeInTheDocument();
      expect(screen.getByText('El correo es inválido')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    it('should display helper text when provided', () => {
      render(<FormInput label="Email" helperText="Formato: tu@email.com" />);
      expect(screen.getByText('Formato: tu@email.com')).toBeInTheDocument();
    });

    it('should not display helper text when not provided', () => {
      render(<FormInput label="Email" />);
      expect(screen.queryByText(/Formato:/)).not.toBeInTheDocument();
    });
  });

  describe('Password Toggle', () => {
    it('should render password toggle button when showPasswordToggle is true', () => {
      render(<FormInput label="Contraseña" type="password" showPasswordToggle />);
      const toggleButton = screen.getByRole('button', { name: 'Mostrar contraseña' });
      expect(toggleButton).toBeInTheDocument();
    });

    it('should not render password toggle when showPasswordToggle is false', () => {
      render(<FormInput label="Contraseña" type="password" />);
      expect(screen.queryByRole('button', { name: 'Mostrar contraseña' })).not.toBeInTheDocument();
    });

    it('should toggle password visibility when toggle button is clicked', async () => {
      const user = userEvent.setup();
      render(<FormInput label="Contraseña" type="password" showPasswordToggle />);

      const input = screen.getByLabelText('Contraseña');
      const toggleButton = screen.getByRole('button', { name: 'Mostrar contraseña' });

      expect(input).toHaveAttribute('type', 'password');

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();

      await user.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
      expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should handle onChange events', async () => {
      const user = userEvent.setup();
      const handleChange = jest.fn();
      render(<FormInput label="Email" onChange={handleChange} />);

      const input = screen.getByLabelText('Email');
      await user.type(input, 'test@email.com');

      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test@email.com');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<FormInput label="Email" disabled />);
      const input = screen.getByLabelText('Email');
      expect(input).toBeDisabled();
    });

    it('should allow keyboard navigation', async () => {
      const user = userEvent.setup();
      render(
        <div>
          <FormInput label="Email" />
          <FormInput label="Password" type="password" />
        </div>
      );

      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');

      await user.tab();
      expect(emailInput).toHaveFocus();

      await user.tab();
      expect(passwordInput).toHaveFocus();
    });
  });

  describe('Accessibility', () => {
    it('should have correct ARIA attributes', () => {
      render(<FormInput label="Email" required />);
      const input = screen.getByLabelText('Email');

      expect(input).toHaveAttribute('aria-required', 'true');
    });

    it('should link error message with input via aria-describedby', () => {
      render(<FormInput label="Email" error="El correo es inválido" />);
      const input = screen.getByLabelText('Email');
      const errorId = input.getAttribute('aria-describedby');

      expect(errorId).toBeTruthy();
      const errorMessage = document.getElementById(errorId!);
      expect(errorMessage).toHaveTextContent('El correo es inválido');
    });

    it('should link helper text with input via aria-describedby', () => {
      render(<FormInput label="Email" helperText="Formato: tu@email.com" />);
      const input = screen.getByLabelText('Email');
      const helperId = input.getAttribute('aria-describedby');

      expect(helperId).toBeTruthy();
      const helperText = document.getElementById(helperId!);
      expect(helperText).toHaveTextContent('Formato: tu@email.com');
    });

    it('should have aria-label for password toggle button', () => {
      render(<FormInput label="Contraseña" type="password" showPasswordToggle />);
      const toggleButton = screen.getByRole('button', { name: 'Mostrar contraseña' });
      expect(toggleButton).toHaveAttribute('aria-label', 'Mostrar contraseña');
    });
  });

  describe('Spanish Language', () => {
    it('should display Spanish labels and messages', () => {
      render(
        <FormInput
          label="Correo Electrónico"
          error="El correo electrónico es requerido"
          required
        />
      );

      expect(screen.getByText('Correo Electrónico')).toBeInTheDocument();
      expect(screen.getByText('El correo electrónico es requerido')).toBeInTheDocument();
      expect(screen.getByText('*')).toHaveAttribute('aria-label', 'requerido');
    });

    it('should have Spanish password toggle labels', async () => {
      const user = userEvent.setup();
      render(<FormInput label="Contraseña" type="password" showPasswordToggle />);

      expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
      expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('should apply focus styles', async () => {
      const user = userEvent.setup();
      render(<FormInput label="Email" />);

      const input = screen.getByLabelText('Email');
      await user.click(input);

      expect(input).toHaveFocus();
      expect(input).toHaveClass('focus:ring-2', 'focus:ring-primary');
    });

    it('should have 48px height for touch-friendly interaction', () => {
      render(<FormInput label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('h-12'); // 48px in Tailwind
    });

    it('should have 16px font size to prevent iOS zoom', () => {
      render(<FormInput label="Email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveClass('text-base'); // 16px in Tailwind
    });
  });

  describe('Custom ID Generation', () => {
    it('should generate ID from label when no ID is provided', () => {
      render(<FormInput label="Email Address" />);
      const input = screen.getByLabelText('Email Address');
      expect(input).toHaveAttribute('id', 'input-email-address');
    });

    it('should use custom ID when provided', () => {
      render(<FormInput label="Email" id="custom-email-id" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('id', 'custom-email-id');
    });
  });

  describe('AutoComplete', () => {
    it('should support autoComplete attribute', () => {
      render(<FormInput label="Email" autoComplete="email" />);
      const input = screen.getByLabelText('Email');
      expect(input).toHaveAttribute('autocomplete', 'email');
    });
  });
});