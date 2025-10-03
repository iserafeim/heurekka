'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { LandlordType, LandlordFormData, OnboardingState } from '@/types/landlord';
import {
  useSaveOnboardingProgress,
  useOnboardingProgress,
  useCompleteOnboarding,
} from '@/hooks/landlord/useOnboarding';
import { toast } from 'sonner';

interface OnboardingContextType {
  state: OnboardingState;
  currentStep: number;
  totalSteps: number;
  landlordType?: LandlordType;
  formData: Partial<LandlordFormData>;
  isLoading: boolean;
  isSaving: boolean;

  // Actions
  setLandlordType: (type: LandlordType) => void;
  updateFormData: (data: Partial<LandlordFormData>) => Promise<void>;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (step: number) => void;
  skipStep: (stepName: string) => void;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const router = useRouter();

  // Backend queries/mutations
  const { data: progressData, isLoading: isLoadingProgress } = useOnboardingProgress();
  const saveProgress = useSaveOnboardingProgress();
  const completeOnboardingMutation = useCompleteOnboarding();

  // Local state
  const [state, setState] = useState<OnboardingState>({
    currentStep: 0,
    totalSteps: 6, // Welcome, Type, Details, Photo, Verification, Complete
    landlordType: undefined,
    formData: {},
    completionScore: 0,
    skippedSteps: [],
  });

  // Sincronizar con backend cuando carga
  useEffect(() => {
    if (progressData) {
      setState({
        currentStep: progressData.step || 0,
        totalSteps: 6,
        landlordType: progressData.formData?.landlordType,
        formData: progressData.formData || {},
        completionScore: 0,
        skippedSteps: progressData.skippedSteps || [],
      });
    }
  }, [progressData]);

  const setLandlordType = useCallback((type: LandlordType) => {
    setState((prev) => ({
      ...prev,
      landlordType: type,
      formData: { ...prev.formData, landlordType: type },
    }));
  }, []);

  const updateFormData = useCallback(
    async (data: Partial<LandlordFormData>) => {
      // Actualizar estado local
      setState((prev) => ({
        ...prev,
        formData: { ...prev.formData, ...data },
      }));

      // Guardar en backend (auto-save)
      try {
        await saveProgress.mutateAsync({
          step: state.currentStep,
          formData: { ...state.formData, ...data },
          skippedSteps: state.skippedSteps,
        });
      } catch (error) {
        console.error('Error al guardar progreso:', error);
        // No mostramos error al usuario para no interrumpir el flujo
        // El progreso se guardará en el siguiente paso
      }
    },
    [state.currentStep, state.formData, state.skippedSteps, saveProgress]
  );

  const nextStep = useCallback(() => {
    setState((prev) => {
      const newStep = Math.min(prev.currentStep + 1, prev.totalSteps - 1);

      // Guardar progreso al avanzar
      saveProgress.mutate({
        step: newStep,
        formData: prev.formData,
        skippedSteps: prev.skippedSteps,
      });

      return { ...prev, currentStep: newStep };
    });
  }, [saveProgress]);

  const prevStep = useCallback(() => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((step: number) => {
    setState((prev) => ({
      ...prev,
      currentStep: Math.max(0, Math.min(step, prev.totalSteps - 1)),
    }));
  }, []);

  const skipStep = useCallback((stepName: string) => {
    setState((prev) => ({
      ...prev,
      skippedSteps: [...prev.skippedSteps, stepName],
    }));
    nextStep();
  }, [nextStep]);

  const completeOnboarding = useCallback(async () => {
    try {
      await completeOnboardingMutation.mutateAsync();
      toast.success('¡Perfil creado exitosamente!');
      router.push('/landlord/dashboard');
    } catch (error: any) {
      toast.error(error?.message || 'Error al completar el onboarding');
      throw error;
    }
  }, [completeOnboardingMutation, router]);

  const resetOnboarding = useCallback(() => {
    setState({
      currentStep: 0,
      totalSteps: 6,
      landlordType: undefined,
      formData: {},
      completionScore: 0,
      skippedSteps: [],
    });
  }, []);

  const value: OnboardingContextType = {
    state,
    currentStep: state.currentStep,
    totalSteps: state.totalSteps,
    landlordType: state.landlordType,
    formData: state.formData,
    isLoading: isLoadingProgress,
    isSaving: saveProgress.isPending,
    setLandlordType,
    updateFormData,
    nextStep,
    prevStep,
    goToStep,
    skipStep,
    completeOnboarding,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}
