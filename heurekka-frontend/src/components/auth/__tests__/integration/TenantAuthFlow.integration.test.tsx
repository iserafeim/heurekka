import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TenantAuthFlow } from '../../TenantAuthFlow';

// Mock dependencies
const mockSignUp = jest.fn();
const mockSignIn = jest.fn();
const mockSignInWithGoogle = jest.fn();
const mockSignupMutateAsync = jest.fn();
const mockLoginMutateAsync = jest.fn();
const mockCreateProfileMutateAsync = jest.fn();

jest.mock('@/lib/stores/auth', () => ({
  useAuthStore: () => ({
    signUp: mockSignUp,
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
  }),
}));

jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    auth: {
      signup: {
        useMutation: () => ({
          mutateAsync: mockSignupMutateAsync,
          isLoading: false,
        }),
      },
      login: {
        useMutation: () => ({
          mutateAsync: mockLoginMutateAsync,
          isLoading: false,
        }),
      },
    },
    tenantProfile: {
      create: {
        useMutation: () => ({
          mutateAsync: mockCreateProfileMutateAsync,
          isLoading: false,
        }),
      },
    },
  },
}));

describe('TenantAuthFlow Integration', () => {
  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();
  const mockPropertyDetails = {
    title: 'Casa en Tegucigalpa',
    price: 15000,
    location: 'Col. Loma Linda',
    landlordPhone: '9999-9999',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Complete Signup Flow', () => {
    it('should complete full tenant signup and profile creation flow', async () => {
      const user = userEvent.setup();
      mockSignupMutateAsync.mockResolvedValue({
        success: true,
        data: { user: { id: '123', email: 'test@test.com' } },
      });
      mockSignUp.mockResolvedValue(undefined);
      mockCreateProfileMutateAsync.mockResolvedValue({ success: true });

      render(
        <TenantAuthFlow
          isOpen={true}
          onClose={mockOnClose}
          propertyId="prop-123"
          propertyDetails={mockPropertyDetails}
          onSuccess={mockOnSuccess}
        />
      );

      // Step 1: Signup
      expect(screen.getByText('Crea tu Cuenta para Contactar al Propietario')).toBeInTheDocument();
      expect(screen.getByText('Casa en Tegucigalpa')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'password123');

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      await waitFor(() => {
        expect(mockSignupMutateAsync).toHaveBeenCalledWith({
          email: 'tenant@test.com',
          password: 'password123',
          intent: 'tenant',
        });
      });

      // Step 2: Profile Creation
      await waitFor(() => {
        expect(screen.getByText('Completa tu Perfil de Inquilino')).toBeInTheDocument();
      });

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);
      const budgetMaxInput = screen.getByLabelText(/Presupuesto Máximo/i);

      await user.type(nameInput, 'María García');
      await user.type(phoneInput, '99998888');
      await user.type(budgetMaxInput, '20000');

      const createProfileButton = screen.getByRole('button', {
        name: /Crear Perfil y Contactar/i,
      });
      await user.click(createProfileButton);

      await waitFor(() => {
        expect(mockCreateProfileMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'María García',
            phone: '9999-8888',
            budgetMax: 20000,
          })
        );
      });

      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should show property context during signup', () => {
      render(
        <TenantAuthFlow
          isOpen={true}
          onClose={mockOnClose}
          propertyId="prop-123"
          propertyDetails={mockPropertyDetails}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Casa en Tegucigalpa')).toBeInTheDocument();
      expect(screen.getByText(/L.15,000\/mes • Col. Loma Linda/i)).toBeInTheDocument();
    });
  });

  describe('Complete Login Flow', () => {
    it('should complete full tenant login flow', async () => {
      const user = userEvent.setup();
      mockLoginMutateAsync.mockResolvedValue({
        success: true,
        data: { user: { id: '123', email: 'test@test.com' } },
      });
      mockSignIn.mockResolvedValue(undefined);

      render(
        <TenantAuthFlow
          isOpen={true}
          onClose={mockOnClose}
          onSuccess={mockOnSuccess}
        />
      );

      // Switch to login
      const loginLink = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(loginLink);

      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();
      expect(screen.getByText('Bienvenido de vuelta')).toBeInTheDocument();

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'password123');

      const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginMutateAsync).toHaveBeenCalledWith({
          email: 'tenant@test.com',
          password: 'password123',
        });
      });

      expect(mockSignIn).toHaveBeenCalledWith('tenant@test.com', 'password123');
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockOnClose).toHaveBeenCalled();
    });

    it('should toggle between signup and login modes', async () => {
      const user = userEvent.setup();
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      // Start on signup
      expect(screen.getByText('Crea tu Cuenta para Contactar al Propietario')).toBeInTheDocument();

      // Switch to login
      const loginLink = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(loginLink);

      expect(screen.getByText('Iniciar Sesión')).toBeInTheDocument();

      // Switch back to signup
      const signupLink = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(signupLink);

      expect(screen.getByText('Crea tu Cuenta para Contactar al Propietario')).toBeInTheDocument();
    });
  });

  describe('Google OAuth Flow', () => {
    it('should initiate Google OAuth', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockResolvedValue({ error: null });

      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const googleButton = screen.getByRole('button', {
        name: /Continuar con Google/i,
      });
      await user.click(googleButton);

      expect(mockSignInWithGoogle).toHaveBeenCalled();
    });

    it('should handle Google OAuth error', async () => {
      const user = userEvent.setup();
      mockSignInWithGoogle.mockRejectedValue(new Error('OAuth failed'));

      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const googleButton = screen.getByRole('button', {
        name: /Continuar con Google/i,
      });
      await user.click(googleButton);

      await waitFor(() => {
        expect(screen.getByText(/Error al conectar con Google/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation Flow', () => {
    it('should validate email format', async () => {
      const user = userEvent.setup();
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'invalid-email');
      await user.type(passwordInput, 'password123');

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      expect(await screen.findByText(/Ingresa un correo electrónico válido/i)).toBeInTheDocument();
      expect(mockSignupMutateAsync).not.toHaveBeenCalled();
    });

    it('should validate password length', async () => {
      const user = userEvent.setup();
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'short');

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      expect(
        await screen.findByText(/La contraseña debe tener al menos 8 caracteres/i)
      ).toBeInTheDocument();
      expect(mockSignupMutateAsync).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const user = userEvent.setup();
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      expect(await screen.findByText(/El correo electrónico es requerido/i)).toBeInTheDocument();
      expect(await screen.findByText(/La contraseña es requerida/i)).toBeInTheDocument();
      expect(mockSignupMutateAsync).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should display signup error', async () => {
      const user = userEvent.setup();
      mockSignupMutateAsync.mockRejectedValue(new Error('Email already exists'));

      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'password123');

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      expect(await screen.findByText(/Email already exists/i)).toBeInTheDocument();
    });

    it('should display login error', async () => {
      const user = userEvent.setup();
      mockLoginMutateAsync.mockRejectedValue(new Error('Invalid credentials'));

      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      // Switch to login
      const loginLink = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(loginLink);

      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'wrongpassword');

      const loginButton = screen.getByRole('button', { name: /Iniciar Sesión/i });
      await user.click(loginButton);

      expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
    });
  });

  describe('Navigation Between Steps', () => {
    it('should navigate back from profile creation to signup', async () => {
      const user = userEvent.setup();
      mockSignupMutateAsync.mockResolvedValue({
        success: true,
        data: { user: { id: '123', email: 'test@test.com' } },
      });

      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      // Complete signup
      const emailInput = screen.getByLabelText(/Correo Electrónico/i);
      const passwordInput = screen.getByLabelText(/Contraseña/i);

      await user.type(emailInput, 'tenant@test.com');
      await user.type(passwordInput, 'password123');

      const createAccountButton = screen.getByRole('button', { name: /Crear Cuenta/i });
      await user.click(createAccountButton);

      // Wait for profile step
      await waitFor(() => {
        expect(screen.getByText('Completa tu Perfil de Inquilino')).toBeInTheDocument();
      });

      // Go back
      const backButton = screen.getByRole('button', { name: /Volver/i });
      await user.click(backButton);

      expect(screen.getByText('Crea tu Cuenta para Contactar al Propietario')).toBeInTheDocument();
    });
  });

  describe('UI Elements', () => {
    it('should show benefits list', () => {
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText('Un perfil para todas las propiedades')).toBeInTheDocument();
      expect(screen.getByText('Mensajes personalizados automáticos')).toBeInTheDocument();
      expect(screen.getByText('Historial de contactos')).toBeInTheDocument();
      expect(screen.getByText('Alertas de propiedades')).toBeInTheDocument();
    });

    it('should show password toggle', () => {
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByRole('button', { name: /Mostrar contraseña/i })).toBeInTheDocument();
    });

    it('should show remember me checkbox', () => {
      render(<TenantAuthFlow isOpen={true} onClose=mockOnClose} />);

      expect(screen.getByLabelText(/Recordarme/i)).toBeInTheDocument();
    });

    it('should show terms and privacy links', () => {
      render(<TenantAuthFlow isOpen={true} onClose={mockOnClose} />);

      expect(screen.getByText(/Al continuar, aceptas los/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Términos/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Privacidad/i })).toBeInTheDocument();
    });
  });
});