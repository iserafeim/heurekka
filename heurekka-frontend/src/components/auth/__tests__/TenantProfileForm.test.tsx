import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test/utils/test-utils';
import userEvent from '@testing-library/user-event';
import { TenantProfileForm } from '../TenantProfileForm';

// Mock tRPC
const mockMutateAsync = jest.fn();
jest.mock('@/lib/trpc/client', () => ({
  trpc: {
    tenantProfile: {
      create: {
        useMutation: () => ({
          mutateAsync: mockMutateAsync,
          isLoading: false,
        }),
      },
    },
  },
}));

describe('TenantProfileForm', () => {
  const mockOnBack = jest.fn();
  const mockOnComplete = jest.fn();
  const mockPropertyDetails = {
    title: 'Casa en Tegucigalpa',
    price: 15000,
    location: 'Col. Loma Linda',
    landlordPhone: '9999-9999',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic Rendering', () => {
    it('should render form header', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('Completa tu Perfil de Inquilino')).toBeInTheDocument();
    });

    it('should render back button', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByRole('button', { name: 'Volver' })).toBeInTheDocument();
    });

    it('should render progress indicator', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('Paso 2 de 2')).toBeInTheDocument();
      expect(screen.getByText('Casi listo')).toBeInTheDocument();
    });

    it('should render all form sections', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('Información Personal')).toBeInTheDocument();
      expect(screen.getByText('Preferencias de Búsqueda')).toBeInTheDocument();
      expect(screen.getByText('Información Adicional')).toBeInTheDocument();
    });

    it('should render submit button', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByRole('button', { name: 'Crear Perfil y Contactar' })).toBeInTheDocument();
    });
  });

  describe('Personal Information Section', () => {
    it('should render full name input', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
    });

    it('should render phone input', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();
    });

    it('should render occupation input', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Ocupación/i)).toBeInTheDocument();
    });

    it('should auto-format phone number input', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const phoneInput = screen.getByLabelText(/Teléfono/i);
      await user.type(phoneInput, '99998888');

      expect(phoneInput).toHaveValue('9999-8888');
    });
  });

  describe('Search Preferences Section', () => {
    it('should render budget inputs', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Presupuesto Mínimo/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Presupuesto Máximo/i)).toBeInTheDocument();
    });

    it('should render move date input', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Fecha de Mudanza/i)).toBeInTheDocument();
    });

    it('should render occupants select', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Número de Ocupantes/i)).toBeInTheDocument();
    });

    it('should render preferred areas input', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Zonas Preferidas/i)).toBeInTheDocument();
    });

    it('should allow adding preferred areas', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const areaInput = screen.getByPlaceholderText('Agregar zona...');
      await user.type(areaInput, 'Col. Palmira');

      const addButton = screen.getByRole('button', { name: 'Agregar' });
      await user.click(addButton);

      expect(screen.getByText('Col. Palmira')).toBeInTheDocument();
    });

    it('should limit preferred areas to 5', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const areaInput = screen.getByPlaceholderText('Agregar zona...');
      const addButton = screen.getByRole('button', { name: 'Agregar' });

      // Add 5 areas
      for (let i = 1; i <= 5; i++) {
        await user.clear(areaInput);
        await user.type(areaInput, `Zona ${i}`);
        await user.click(addButton);
      }

      expect(addButton).toBeDisabled();
      expect(areaInput).toBeDisabled();
    });

    it('should allow removing preferred areas', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const areaInput = screen.getByPlaceholderText('Agregar zona...');
      await user.type(areaInput, 'Col. Palmira');

      const addButton = screen.getByRole('button', { name: 'Agregar' });
      await user.click(addButton);

      const removeButton = screen.getByRole('button', { name: 'Remover Col. Palmira' });
      await user.click(removeButton);

      expect(screen.queryByText('Col. Palmira')).not.toBeInTheDocument();
    });

    it('should render property type checkboxes', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('Apartamento')).toBeInTheDocument();
      expect(screen.getByText('Casa')).toBeInTheDocument();
      expect(screen.getByText('Habitación')).toBeInTheDocument();
    });

    it('should allow selecting multiple property types', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const apartmentCheckbox = screen.getByRole('checkbox', { name: /Apartamento/i });
      const houseCheckbox = screen.getByRole('checkbox', { name: /Casa/i });

      expect(apartmentCheckbox).toBeChecked(); // Default

      await user.click(houseCheckbox);
      expect(houseCheckbox).toBeChecked();
      expect(apartmentCheckbox).toBeChecked();
    });
  });

  describe('Additional Information Section', () => {
    it('should render pet options', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('No tengo mascotas')).toBeInTheDocument();
      expect(screen.getByText('Sí, tengo mascotas')).toBeInTheDocument();
    });

    it('should show pet details input when pets selected', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const hasPetsRadio = screen.getByRole('radio', { name: /Sí, tengo mascotas/i });
      await user.click(hasPetsRadio);

      expect(screen.getByLabelText(/Detalles de las mascotas/i)).toBeInTheDocument();
    });

    it('should render references checkbox', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByText('Puedo proporcionar referencias')).toBeInTheDocument();
    });

    it('should render message textarea', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);
      expect(screen.getByLabelText(/Mensaje para propietarios/i)).toBeInTheDocument();
    });

    it('should limit message to 200 characters', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const textarea = screen.getByLabelText(/Mensaje para propietarios/i);
      const longMessage = 'a'.repeat(250);
      await user.type(textarea, longMessage);

      expect(textarea).toHaveValue('a'.repeat(200));
      expect(screen.getByText('200/200 caracteres')).toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should validate required full name', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    });

    it('should validate full name length', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      await user.type(nameInput, 'AB');

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();
    });

    it('should validate phone format', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const phoneInput = screen.getByLabelText(/Teléfono/i);
      await user.type(phoneInput, '999');

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      expect(await screen.findByText(/Formato inválido/i)).toBeInTheDocument();
    });

    it('should validate budget max greater than min', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);
      const budgetMinInput = screen.getByLabelText(/Presupuesto Mínimo/i);
      const budgetMaxInput = screen.getByLabelText(/Presupuesto Máximo/i);

      await user.type(nameInput, 'Juan Pérez');
      await user.type(phoneInput, '99998888');
      await user.type(budgetMinInput, '20000');
      await user.type(budgetMaxInput, '10000');

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      expect(await screen.findByText(/El máximo debe ser mayor al mínimo/i)).toBeInTheDocument();
    });

    it('should clear errors when field is corrected', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });

      await user.click(submitButton);
      expect(await screen.findByText(/El nombre debe tener al menos 3 caracteres/i)).toBeInTheDocument();

      await user.type(nameInput, 'Juan Pérez');
      expect(screen.queryByText(/El nombre debe tener al menos 3 caracteres/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('should submit form with valid data', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockResolvedValue({ success: true });

      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);
      const budgetMaxInput = screen.getByLabelText(/Presupuesto Máximo/i);

      await user.type(nameInput, 'María García');
      await user.type(phoneInput, '99998888');
      await user.type(budgetMaxInput, '15000');

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockMutateAsync).toHaveBeenCalledWith(
          expect.objectContaining({
            fullName: 'María García',
            phone: '9999-8888',
            budgetMax: 15000,
          })
        );
      });

      expect(mockOnComplete).toHaveBeenCalled();
    });

    it('should handle submission error', async () => {
      const user = userEvent.setup();
      mockMutateAsync.mockRejectedValue(new Error('Error al crear el perfil'));

      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const nameInput = screen.getByLabelText(/Nombre Completo/i);
      const phoneInput = screen.getByLabelText(/Teléfono/i);
      const budgetMaxInput = screen.getByLabelText(/Presupuesto Máximo/i);

      await user.type(nameInput, 'María García');
      await user.type(phoneInput, '99998888');
      await user.type(budgetMaxInput, '15000');

      const submitButton = screen.getByRole('button', { name: 'Crear Perfil y Contactar' });
      await user.click(submitButton);

      expect(await screen.findByText(/Error al crear el perfil/i)).toBeInTheDocument();
      expect(mockOnComplete).not.toHaveBeenCalled();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when back button is clicked', async () => {
      const user = userEvent.setup();
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      const backButton = screen.getByRole('button', { name: 'Volver' });
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Spanish Language', () => {
    it('should display all text in Spanish', () => {
      render(<TenantProfileForm onBack={mockOnBack} onComplete={mockOnComplete} />);

      expect(screen.getByText('Completa tu Perfil de Inquilino')).toBeInTheDocument();
      expect(screen.getByText('Información Personal')).toBeInTheDocument();
      expect(screen.getByText('Preferencias de Búsqueda')).toBeInTheDocument();
      expect(screen.getByText('Información Adicional')).toBeInTheDocument();
      expect(screen.getByText('Crear Perfil y Contactar')).toBeInTheDocument();
    });
  });
});