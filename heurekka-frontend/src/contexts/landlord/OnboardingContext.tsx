'use client';

/**
 * Landlord Onboarding Context
 * Gestiona el estado del flujo de onboarding con auto-save
 */

import React, { createContext, useContext, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSaveOnboardingProgress, useOnboardingProgress } from '@/hooks/landlord/useOnboarding';
import type { LandlordType, LandlordFormData, OnboardingState } from '@/types/landlord';

interface OnboardingContextType {
  // Estado
  state: OnboardingState;
  isLoading: boolean;
  isSaving: boolean;

  // Acciones
  setLandlordType: (type: LandlordType) => void;
  updateFormData: (data: Partial<LandlordFormData>) => void;
  nextStep: () => void;
  previousStep: () => void;
  skipStep: (stepName: string) => void;
  goToStep: (step: number) => void;
  saveProgress: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

const TOTAL_STEPS = 5; // welcome, type, details, photo, verification, complete

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: savedProgress, isLoading } = useOnboardingProgress();
  const { mutateAsync: saveProgressMutation, isPending: isSaving } = useSaveOnboardingProgress();

  // Estado inicial
  const [state, setState] = React.useState<OnboardingState>({
    currentStep: 0,
    totalSteps: TOTAL_STEPS,
    landlordType: undefined,
    formData: {},
    completionScore: 0,
    skippedSteps: [],
  });

  // Cargar progreso guardado al montar
  useEffect(() => {
    if (savedProgress?.data?.progress) {
      setState(prev => ({
        ...prev,
        ...savedProgress.data.progress,
        totalSteps: TOTAL_STEPS,
      }));
    }
  }, [savedProgress]);

  // Auto-save solo cuando cambia el step (los forms manejan su propio debounce)
  useEffect(() => {
    // Solo guardar si tenemos datos válidos para guardar
    if (state.currentStep > 0) {
      saveProgressMutation({
        step: state.currentStep,
        formData: {
          ...state.formData,
          landlordType: state.landlordType, // ✅ Incluir landlordType en formData
        },
        skippedSteps: state.skippedSteps,
      }).catch(error => {
        // Log errors en desarrollo para debug
        if (process.env.NODE_ENV === 'development') {
          console.error('Error saving onboarding progress:', error);
        }
      });
    }
  }, [state.currentStep, state.landlordType, saveProgressMutation]); // Guardar cuando cambia step o type

  const setLandlordType = useCallback((type: LandlordType) => {
    setState(prev => ({
      ...prev,
      landlordType: type,
      formData: {}, // Reset form data cuando cambia el tipo
    }));
  }, []);

  const updateFormData = useCallback((data: Partial<LandlordFormData>) => {
    setState(prev => ({
      ...prev,
      formData: {
        ...prev.formData,
        ...data,
      },
    }));
  }, []);

  const calculateCompletionScore = useCallback((currentState: OnboardingState): number => {
    let score = 0;

    // Tipo seleccionado: 20%
    if (currentState.landlordType) score += 20;

    // Datos del formulario: 40%
    const formDataKeys = Object.keys(currentState.formData);
    if (formDataKeys.length > 0) score += Math.min(40, formDataKeys.length * 5);

    // Pasos completados: 40%
    score += (currentState.currentStep / TOTAL_STEPS) * 40;

    return Math.min(100, Math.round(score));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => {
      const newState = {
        ...prev,
        currentStep: Math.min(prev.currentStep + 1, TOTAL_STEPS),
      };
      return {
        ...newState,
        completionScore: calculateCompletionScore(newState),
      };
    });
  }, [calculateCompletionScore]);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const skipStep = useCallback((stepName: string) => {
    setState(prev => {
      const newState = {
        ...prev,
        currentStep: prev.currentStep + 1,
        skippedSteps: [...prev.skippedSteps, stepName],
      };
      return {
        ...newState,
        completionScore: calculateCompletionScore(newState),
      };
    });
  }, [calculateCompletionScore]);

  const goToStep = useCallback((step: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, TOTAL_STEPS)),
    }));
  }, []);

  const saveProgress = useCallback(async () => {
    try {
      await saveProgressMutation({
        currentStep: state.currentStep,
        landlordType: state.landlordType,
        formData: state.formData,
        skippedSteps: state.skippedSteps,
      });
    } catch (error) {
      console.error('Error saving progress:', error);
      throw error;
    }
  }, [state, saveProgressMutation]);

  const value: OnboardingContextType = {
    state,
    isLoading,
    isSaving,
    setLandlordType,
    updateFormData,
    nextStep,
    previousStep,
    skipStep,
    goToStep,
    saveProgress,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}
