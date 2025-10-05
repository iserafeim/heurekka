/**
 * Landlord Onboarding Layout
 * Layout compartido para todas las páginas del onboarding
 */

import React from 'react';
import Link from 'next/link';
import { OnboardingProvider } from '@/contexts/landlord/OnboardingContext';
import { Logo } from '@/components/logo';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 md:py-12">
          <div className="max-w-2xl mx-auto">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-sm mt-auto">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-600">
              <div className="flex gap-6">
                <Link href="/ayuda" className="hover:text-blue-600 transition-colors">
                  Ayuda
                </Link>
                <Link href="/privacidad" className="hover:text-blue-600 transition-colors">
                  Privacidad
                </Link>
                <Link href="/terminos" className="hover:text-blue-600 transition-colors">
                  Términos
                </Link>
              </div>
              <p className="text-gray-500">
                © {new Date().getFullYear()} Heurekka. Todos los derechos reservados.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </OnboardingProvider>
  );
}
